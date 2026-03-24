// frontend/src/pages/student/InterviewPrep.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import {
    Mic, StopCircle, Bot, User, Award, AlertTriangle, CheckCircle,
    Play, Loader2, MessageSquare, Zap, Briefcase, Camera, CameraOff
} from 'lucide-react';
import clsx from 'clsx';

const InterviewPrep = () => {
    const { user } = useAuth();
    const [jobDescription, setJobDescription] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [isInterviewActive, setIsInterviewActive] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [interviewResult, setInterviewResult] = useState(null);
    const messagesEndRef = useRef(null);

    const [isSpotlightMode, setIsSpotlightMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef(null);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const startInterview = async () => {
        if (!jobTitle.trim() || !jobDescription.trim()) {
            toast.error("Please provide both Job Title and Description.");
            return;
        }
        setIsInterviewActive(true);
        setMessages([{
            role: 'system',
            content: `Hello ${user?.name}. I'll be your AI Interviewer for the ${jobTitle} position. I've reviewed your profile and the job description. Let's begin — tell me about yourself and how your background aligns with this role.`
        }]);
    };

    const handleSendMessage = async () => {
        if (loading || !currentInput.trim()) return;
        const newUserMessage = { role: 'user', content: currentInput };
        setMessages(prev => [...prev, newUserMessage]);
        setCurrentInput("");
        setLoading(true);
        try {
            const contextMessages = messages.map(m => `${m.role === 'system' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n');
            const prompt = `
                Act as an expert technical recruiter interviewing a candidate for a "${jobTitle}" role.
                Job Description context: "${jobDescription}"
                Candidate Profile context: ${JSON.stringify(user?.profile?.skills || [])}
                Previous Conversation:\n${contextMessages}
                Candidate: ${newUserMessage.content}
                Provide the next interview question OR feedback if they answered poorly. Keep it conversational, professional, under 3 sentences. Do not break character.
            `;
            const res = await aiApi.interviewChat(prompt);
            setMessages(prev => [...prev, { role: 'system', content: res.data.response || "Could you elaborate more on your relevant experience?" }]);
        } catch {
            toast.error("Failed to get AI response.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSpotlight = async () => {
        if (isSpotlightMode) {
            setIsSpotlightMode(false);
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
                setIsSpotlightMode(true);
            } catch {
                toast.error("Camera and Microphone access is required for Spotlight mode.");
            }
        }
    };

    const startRecording = async () => {
        if (loading || isRecording) return;
        try {
            if (!streamRef.current) {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = audioStream;
            }
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (!audioTrack) throw new Error("No audio track found");
            const cleanAudioStream = new MediaStream([audioTrack]);

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                audioContextRef.current.createMediaStreamSource(cleanAudioStream).connect(analyserRef.current);
                analyserRef.current.fftSize = 256;
            }

            const updateVolume = () => {
                if (!analyserRef.current) return;
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                setVolume(dataArray.reduce((a, v) => a + v, 0) / dataArray.length);
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();

            audioChunksRef.current = [];
            let options = { mimeType: 'audio/webm;codecs=opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: 'audio/webm' };

            const mediaRecorder = new MediaRecorder(cleanAudioStream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
                if (audioBlob.size === 0) { toast.error("Recording failed. Check browser microphone permissions."); setLoading(false); return; }

                let imageSnapshot = null;
                if (isSpotlightMode && videoRef.current) {
                    const canvas = document.createElement('canvas');
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
                    imageSnapshot = canvas.toDataURL('image/jpeg', 0.6);
                }
                await handleAudioMessage(audioBlob, imageSnapshot);
                cancelAnimationFrame(animationFrameRef.current);
                setVolume(0);
                if (!isSpotlightMode) { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; audioContextRef.current = null; }
            };

            mediaRecorder.start(250);
            setIsRecording(true);
        } catch (err) {
            toast.error(`Mic access failed: ${err.message || 'Unknown error'}`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    const handleAudioMessage = async (audioBlob, imageSnapshot = null) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'interview-audio.webm');
            if (imageSnapshot) formData.append('image', imageSnapshot);
            const contextMessages = messages.map(m => `${m.role === 'system' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n');
            formData.append('prompt', `Job Description: "${jobDescription}"\nCandidate Profile: ${JSON.stringify(user?.profile?.skills || [])}\nConversation:\n${contextMessages}`);

            const res = await aiApi.interviewAudioChat(formData);
            if (res.data.transcription) setMessages(prev => [...prev, { role: 'user', content: res.data.transcription }]);
            if (res.data.response) {
                const content = res.data.presenceAnalysis ? `[Observation: ${res.data.presenceAnalysis}]\n\n${res.data.response}` : res.data.response;
                setMessages(prev => [...prev, { role: 'system', content }]);
            }
        } catch {
            toast.error("AI service unreachable.");
        } finally {
            setLoading(false);
        }
    };

    const endInterview = async () => {
        setIsInterviewActive(false);
        if (isSpotlightMode && streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; setIsSpotlightMode(false); }
        setLoading(true);
        const t = toast.loading('Analyzing your interview performance...');
        try {
            const res = await aiApi.evaluateInterview(messages, jobTitle, jobDescription);
            setInterviewResult({
                score: res.data.score || 70,
                feedback: res.data.feedback || 'Interview evaluation complete.',
                strengths: res.data.strengths || ['Professional communication', 'Relevant experience'],
                areasForImprovement: res.data.areasForImprovement || ['Provide more quantifiable outcomes']
            });
            toast.success('Interview analyzed.', { id: t });
        } catch {
            toast.error('Could not generate AI report.', { id: t });
            setInterviewResult({ score: 70, feedback: 'Your interview was completed. AI evaluation is temporarily unavailable.', strengths: ['Completed the session'], areasForImprovement: ['Try again when AI service is available'] });
        } finally {
            setLoading(false);
        }
    };

    // Result Screen
    if (interviewResult) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Award size={180} className="text-emerald-400" /></div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight italic mb-2">Your Result</h1>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-10">Feedback & Analysis Complete</p>

                    <div className="flex justify-center mb-10">
                        <div className="w-44 h-44 rounded-full border-8 border-slate-800 flex items-center justify-center relative flex-col">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 80}
                                    strokeDashoffset={2 * Math.PI * 80 * (1 - interviewResult.score / 100)}
                                    className="text-emerald-500 transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="text-5xl font-black text-white relative z-10 tabular-nums">{interviewResult.score}</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest relative z-10 mt-1">Score</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-left relative z-10 mb-8">
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><CheckCircle size={15} /></div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">What you did well</h3>
                            </div>
                            <ul className="space-y-3">
                                {interviewResult.strengths.map((s, i) => (
                                    <li key={i} className="text-sm text-slate-300 font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> {s}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center"><AlertTriangle size={15} /></div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">What to work on</h3>
                            </div>
                            <ul className="space-y-3">
                                {interviewResult.areasForImprovement.map((s, i) => (
                                    <li key={i} className="text-sm text-slate-300 font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> {s}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-indigo-500/10 p-6 rounded-2xl border border-indigo-500/20 text-left relative z-10 mb-8">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Coach's Advice</h3>
                        <p className="text-sm text-slate-300 leading-relaxed italic">"{interviewResult.feedback}"</p>
                    </div>

                    <button onClick={() => { setInterviewResult(null); setMessages([]); }} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all border border-slate-700 active:scale-95">
                        Practice Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                        <Bot className="text-indigo-400" size={30} /> AI Interview Practice
                    </h1>
                    <p className="text-slate-600 text-[10px] mt-1 uppercase font-black tracking-widest">Practice for your dream job</p>
                </div>
                {isInterviewActive && (
                    <button onClick={endInterview} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-black rounded-2xl transition-all text-xs uppercase tracking-widest active:scale-95">
                        <StopCircle size={16} /> End Practice
                    </button>
                )}
            </div>

            {!isInterviewActive ? (
                /* Setup Panel */
                <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-[2.5rem]" />
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-black text-white tracking-tight mb-8 uppercase italic">Get Started</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Job Role Title</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="e.g. Software Engineer"
                                            className="w-full bg-slate-800 border border-slate-700 text-white p-4 pl-14 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Job Description</label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here. Our AI will use this to ask the right questions..."
                                        className="w-full bg-slate-800 border border-slate-700 text-white p-5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 h-40 resize-none [scrollbar-width:thin]"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                    <button onClick={startInterview} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs">
                                        <Play size={16} /> Start Practice
                                    </button>
                                    <button
                                        onClick={toggleSpotlight}
                                        className={clsx(
                                            "flex items-center gap-2 px-6 py-3 border-2 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all",
                                            isSpotlightMode
                                                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                                                : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                                        )}
                                    >
                                        {isSpotlightMode ? <Camera size={14} /> : <CameraOff size={14} />}
                                        Camera {isSpotlightMode ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-60 hidden lg:block">
                            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center"><Zap size={20} /></div>
                                <h4 className="text-sm font-black text-white uppercase">How it works</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">Our AI studies your profile and the job description. It will ask you tailored interview questions and give you a detailed performance report at the end.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Active Interview Chat */
                <div className="flex-1 flex flex-col bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-base tracking-tight uppercase italic">AI Interviewer</h3>
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Role: {jobTitle}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 relative overflow-hidden">
                        {/* Spotlight Camera */}
                        {isSpotlightMode && (
                            <div className="absolute inset-0 bg-black/50 z-0 flex items-center justify-center pointer-events-none">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-25" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                <div className="absolute bottom-5 right-5 w-44 aspect-[3/4] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl pointer-events-auto">
                                    <video ref={(el) => { if (el && streamRef.current) el.srcObject = streamRef.current; }} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                                    {isRecording && (
                                        <div className="absolute top-2 left-2 bg-red-500/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" /> REC
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 p-7 overflow-y-auto space-y-5 bg-slate-900 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] relative z-10">
                            {messages.map((m, idx) => (
                                <div key={idx} className={clsx("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                                    <div className={clsx(
                                        "max-w-[75%] p-5 rounded-[1.75rem] text-sm shadow-xl",
                                        m.role === 'user'
                                            ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20"
                                            : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
                                    )}>
                                        <div className="leading-relaxed font-medium">{m.content}</div>
                                        <div className={clsx(
                                            "text-[9px] mt-3 font-black uppercase tracking-widest opacity-50 flex items-center gap-1",
                                            m.role === 'user' ? 'justify-end' : 'justify-start'
                                        )}>
                                            {m.role === 'user' ? <User size={9} /> : <Bot size={9} />}
                                            {m.role === 'user' ? 'Me' : 'AI Interviewer'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 border border-slate-700 px-5 py-4 rounded-[1.75rem] rounded-tl-none flex items-center gap-3">
                                        <Loader2 size={16} className="text-indigo-400 animate-spin" />
                                        <span className="text-xs font-bold text-slate-500">AI is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-5 bg-slate-950 border-t border-slate-800 relative z-10">
                            <div className="flex items-end gap-3 max-w-5xl mx-auto">
                                <textarea
                                    value={currentInput}
                                    onChange={(e) => setCurrentInput(e.target.value)}
                                    placeholder="Type your response here..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 resize-none min-h-[56px] max-h-[120px] [scrollbar-width:thin]"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !currentInput.trim() || isRecording}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white h-14 px-7 rounded-2xl transition-all active:scale-95 flex items-center justify-center disabled:cursor-not-allowed"
                                >
                                    <MessageSquare size={20} />
                                </button>
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={loading}
                                    className={clsx(
                                        "h-14 px-7 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shrink-0 relative overflow-hidden",
                                        isRecording
                                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse"
                                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                    )}
                                >
                                    {/* Volume bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700 overflow-hidden">
                                        <div className="h-full bg-emerald-400 transition-all duration-75" style={{ width: `${Math.min(volume * 2, 100)}%` }} />
                                    </div>
                                    <Mic size={18} className={isRecording ? "animate-bounce" : ""} />
                                    <span className="hidden sm:block">{isRecording ? "Stop" : "Record"}</span>
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-slate-700 font-bold mt-3 uppercase tracking-widest">
                                {isSpotlightMode ? "Type or click the mic to speak" : "Press Enter to send • Shift+Enter for new line"}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewPrep;
