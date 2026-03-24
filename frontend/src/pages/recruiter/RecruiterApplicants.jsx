// frontend/src/pages/recruiter/RecruiterApplicants.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationApi, resumeApi, messagingApi } from '../../api/api';
import {
    Zap, Info, FileText, ShieldCheck,
    TrendingUp, Users, Filter,
    Search, BrainCircuit, X, MessageSquare, Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RecruiterApplicants = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showResume, setShowResume] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [minMatch, setMinMatch] = useState(0);
    const [connectStudent, setConnectStudent] = useState(null);
    const [messagePayload, setMessagePayload] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const filteredApplicants = applicants.filter(app => {
        const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
        const matchesRank = (app.aiScores?.layer3RecruiterRank || 0) >= minMatch;
        return matchesStatus && matchesRank;
    });

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === filteredApplicants.length ? [] : filteredApplicants.map(a => a._id));
    };
    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) return;
        try {
            await applicationApi.bulkRecruiterAction(selectedIds, action);
            toast.success(`Successfully ${action}ed ${selectedIds.length} candidates`);
            setSelectedIds([]);
            loadApplicants();
        } catch {
            toast.error(`Bulk ${action} failed`);
        }
    };

    useEffect(() => {
        if (jobId) loadApplicants();
        else setLoading(false);
    }, [jobId]);

    const loadApplicants = async () => {
        try {
            const { data } = await applicationApi.getJobApplicants(jobId);
            setApplicants(data);
        } catch {
            toast.error('Failed to load candidate list');
        } finally {
            setLoading(false);
        }
    };

    const handleShortlist = async (id) => {
        try {
            await applicationApi.recruiterShortlist(id);
            setApplicants(prev => prev.map(a => a._id === id ? { ...a, status: 'RECRUITER_SHORTLISTED' } : a));
            toast.success('Candidate moved to shortlist');
        } catch { toast.error('Failed to update status'); }
    };

    const handleOffer = async (id) => {
        try {
            await applicationApi.recruiterOffer(id);
            setApplicants(prev => prev.map(a => a._id === id ? { ...a, status: 'OFFERED' } : a));
            toast.success('Professional offer extended');
        } catch { toast.error('Failed to send offer'); }
    };

    const handleHire = async (id) => {
        try {
            await applicationApi.recruiterFinalize(id);
            setApplicants(prev => prev.map(a => a._id === id ? { ...a, status: 'OFFER_ACCEPTED' } : a));
            toast.success('Placement finalized successfully');
        } catch { toast.error('Hiring finalization failed'); }
    };

    const viewResume = async (app) => {
        setShowResume(app);
        setResumeData(null);
        try {
            const { data } = await resumeApi.getStudentResume(app.studentId?._id);
            setResumeData(data);
        } catch {
            toast.error('Resume file not found, showing profile summary instead');
        }
    };

    const handleSendMessage = async () => {
        if (!messagePayload.trim() || !connectStudent) return;
        setSendingMsg(true);
        try {
            const formData = new FormData();
            formData.append('conversationType', 'RECRUITER_STUDENT');
            formData.append('recipientIds', JSON.stringify([connectStudent._id]));
            formData.append('plaintext', messagePayload);
            if (attachment) formData.append('file', attachment);
            await messagingApi.send(formData);
            toast.success("Message sent successfully");
            setConnectStudent(null);
            setMessagePayload("");
            setAttachment(null);
        } catch {
            toast.error("Failed to send message");
        } finally {
            setSendingMsg(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-indigo-400';
        return 'text-amber-400';
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-emerald-500/10 border-t-emerald-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit size={24} className="text-emerald-500 animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse italic">Scanning Neural Network...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Area */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-8 md:p-10 shadow-[var(--shadow-xl)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                    <BrainCircuit size={180} className="text-emerald-500" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[var(--shadow-sm)]">
                                <BrainCircuit size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">
                                    Candidate <span className="text-emerald-400">Matrix</span>
                                </h1>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-1 italic opacity-60">Synchronized Application Stream</p>
                            </div>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm font-bold italic max-w-xl flex items-center gap-2">
                             Ranking protocols active for: <span className="text-emerald-400 border-b border-emerald-500/30">{applicants[0]?.jobId?.title || 'this role'}</span>
                        </p>
                    </div>
                    <div className="px-6 py-4 bg-[var(--bg-main)]/50 backdrop-blur-md rounded-[2rem] border border-emerald-500/20 flex items-center gap-4 shadow-[var(--shadow-lg)] group/badge">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover/badge:scale-110 transition-transform">
                            <Zap size={20} className="fill-emerald-500/20" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">Qualified Stream</span>
                            <div className="text-sm font-black text-[var(--text-bright)] uppercase tracking-tight italic">
                                {applicants.filter(a => a.status === 'FACULTY_APPROVED').length} Awaiting Review
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk actions */}
            {selectedIds.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">{selectedIds.length} selected</span>
                    <button onClick={() => handleBulkAction('shortlist')} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                        Bulk Shortlist
                    </button>
                    <button onClick={() => setSelectedIds([])} className="ml-auto text-slate-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Filter Hub */}
            <div className="flex flex-wrap items-center gap-6 bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-[2.5rem] shadow-[var(--shadow-lg)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-4 bg-[var(--bg-main)] border border-[var(--border-main)] px-5 py-3 rounded-2xl shadow-[var(--shadow-sm)] hover:border-emerald-500/30 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 group/select">
                    <Filter size={14} className="text-emerald-400 group-hover/select:scale-110 transition-transform" />
                    <select
                        className="bg-transparent text-[10px] text-[var(--text-bright)] outline-none font-black uppercase tracking-[0.1em] cursor-pointer min-w-[120px] italic"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">Display All Status</option>
                        <option value="FACULTY_APPROVED">Validated only</option>
                        <option value="RECRUITER_SHORTLISTED">Shortlisted Profiles</option>
                        <option value="OFFERED">Extended Offers</option>
                        <option value="OFFER_ACCEPTED">Placed Candidates</option>
                    </select>
                </div>

                <div className="flex items-center gap-6 bg-[var(--bg-main)] border border-[var(--border-main)] px-6 py-3 rounded-2xl shadow-[var(--shadow-sm)] hover:border-emerald-500/30 transition-all group/range flex-1 min-w-[280px]">
                    <div className="flex items-center gap-3 shrink-0">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Match Threshold</span>
                    </div>
                    <input type="range" min="0" max="90" step="10" value={minMatch}
                        onChange={(e) => setMinMatch(Number(e.target.value))}
                        className="flex-1 accent-emerald-500 h-1.5 rounded-full cursor-pointer hover:accent-emerald-400 transition-all" />
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-black text-emerald-400 italic shadow-[var(--shadow-sm)] group-hover/range:scale-110 transition-transform">
                        {minMatch}%+
                    </div>
                </div>
            </div>

            {/* Candidate List Matrix */}
            <div className="bg-[var(--bg-card)] rounded-[3rem] shadow-[var(--shadow-2xl)] border border-[var(--border-main)] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 to-emerald-500/5 pointer-events-none" />
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-[var(--bg-main)]/80 backdrop-blur-md text-[var(--text-muted)] text-[10px] uppercase font-black tracking-[0.2em] italic border-b border-[var(--border-main)]">
                                <th className="p-8 w-16">
                                    <div className="flex items-center justify-center">
                                        <input type="checkbox"
                                            className="w-5 h-5 rounded-lg border-[var(--border-main)] bg-[var(--bg-card)] text-emerald-500 focus:ring-emerald-500/20 cursor-pointer transition-all active:scale-90"
                                            checked={selectedIds.length === filteredApplicants.length && filteredApplicants.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                <th className="p-8">Operational Profile</th>
                                <th className="p-8 text-center">Neural Match</th>
                                <th className="p-8 text-center">ATS Index</th>
                                <th className="p-8 text-center">Protocol Status</th>
                                <th className="p-8 text-right">Direct Directives</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-main)]/30">
                            {filteredApplicants.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-24 text-center">
                                        <div className="flex flex-col items-center opacity-30 group/none">
                                            <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2rem] border border-[var(--border-main)] flex items-center justify-center mb-6 shadow-[var(--shadow-lg)] group-hover/none:scale-110 transition-transform">
                                                <Users size={40} className="text-[var(--text-muted)]" />
                                            </div>
                                            <p className="font-black text-[var(--text-bright)] uppercase tracking-[0.4em] text-sm italic">Zero Matches Detected</p>
                                            <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-2 italic opacity-60">Adjust ranking parameters to expand search</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredApplicants.map(app => (
                                    <tr key={app._id} className="hover:bg-[var(--bg-main)]/40 transition-all group/row relative">
                                        <td className="p-8 relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                            <div className="flex items-center justify-center">
                                                <input type="checkbox"
                                                    className="w-5 h-5 rounded-lg border-[var(--border-main)] bg-[var(--bg-card)] text-emerald-500 cursor-pointer transition-all active:scale-90"
                                                    checked={selectedIds.includes(app._id)}
                                                    onChange={() => toggleSelect(app._id)}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl flex items-center justify-center text-emerald-400 group-hover/row:scale-110 group-hover/row:bg-emerald-500 group-hover/row:text-white transition-all font-black text-xl shadow-[var(--shadow-md)] shrink-0 italic">
                                                    {app.studentId?.name?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-[var(--text-bright)] text-base group-hover/row:text-emerald-400 transition-colors tracking-tight truncate uppercase italic">{app.studentId?.name}</div>
                                                    <div className="text-[10px] font-black text-[var(--text-muted)] truncate uppercase tracking-widest opacity-60 italic mt-1">{app.studentId?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="relative inline-block">
                                                <div className={`text-4xl font-black tabular-nums tracking-tighter italic ${getScoreColor(app.aiScores?.layer3RecruiterRank || 0)}`}>
                                                    {app.aiScores?.layer3RecruiterRank || '??'}
                                                </div>
                                                <div className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-1 opacity-60 italic text-center">Precision Match</div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-24 bg-[var(--bg-main)] h-2 rounded-full overflow-hidden border border-[var(--border-main)] shadow-inner">
                                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                                                        style={{ width: `${app.aiScores?.atsScore || 0}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-[var(--text-bright)] uppercase tracking-widest italic">{app.aiScores?.atsScore || 0}% Index</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic shadow-[var(--shadow-sm)] ${
                                                app.status === 'RECRUITER_SHORTLISTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                app.status === 'FACULTY_APPROVED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] opacity-50'
                                            }`}>
                                                {app.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end gap-3 flex-wrap">
                                                <div className="flex bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl p-1 shadow-[var(--shadow-sm)]">
                                                    <button onClick={() => setSelectedApp(app)}
                                                        className="p-3 text-[var(--text-muted)] hover:text-indigo-400 hover:bg-indigo-500/5 rounded-xl transition-all active:scale-90"
                                                        title="AI Match Analysis">
                                                        <BrainCircuit size={16} />
                                                    </button>
                                                    <button onClick={() => viewResume(app)}
                                                        className="p-3 text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/5 rounded-xl transition-all active:scale-90"
                                                        title="Dossier View">
                                                        <FileText size={16} />
                                                    </button>
                                                    <button onClick={() => setConnectStudent(app.studentId)}
                                                        className="p-3 text-[var(--text-muted)] hover:text-cyan-400 hover:bg-cyan-500/5 rounded-xl transition-all active:scale-90"
                                                        title="Establish Comms">
                                                        <MessageSquare size={16} />
                                                    </button>
                                                </div>
                                                {app.status === 'FACULTY_APPROVED' && (
                                                    <button onClick={() => handleShortlist(app._id)}
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95 border border-emerald-400/20 italic">
                                                        Shortlist
                                                    </button>
                                                )}
                                                {app.status === 'RECRUITER_SHORTLISTED' && (
                                                    <button onClick={() => handleOffer(app._id)}
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 border border-indigo-400/20 italic">
                                                        Extend Offer
                                                    </button>
                                                )}
                                                {app.status === 'OFFERED' && (
                                                    <div className="px-6 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-widest italic opacity-60">
                                                        Pending Accept
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Reasoning Insight Matrix */}
            {selectedApp && (
                <div className="fixed inset-0 bg-[var(--bg-main)]/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] w-full max-w-2xl rounded-[3rem] shadow-[var(--shadow-2xl)] overflow-hidden relative group/modal">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover/modal:scale-110 transition-transform">
                            <ShieldCheck size={180} className="text-emerald-500" />
                        </div>
                        <div className="p-8 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-main)]/30 backdrop-blur-md relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-[var(--shadow-sm)] italic font-black">
                                    AI
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">Match Intelligence</h3>
                                    <p className="text-[10px] font-black text-[var(--text-bright)] uppercase tracking-widest mt-1 opacity-60 italic">Candidate: {selectedApp.studentId?.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="w-10 h-10 flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-red-400 rounded-xl border border-[var(--border-main)] hover:border-red-500/30 transition-all shadow-[var(--shadow-sm)] active:scale-90">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-10 space-y-8 relative z-10">
                            <div className="grid grid-cols-3 gap-6">
                                <ScoreBlock label="Neural Initial" value={selectedApp.aiScores?.layer1StudentMatch} color="indigo" />
                                <ScoreBlock label="Faculty Validation" value={selectedApp.aiScores?.layer2FacultyQualification} color="emerald" />
                                <ScoreBlock label="Recruiter Precision" value={selectedApp.aiScores?.layer3RecruiterRank} color="amber" />
                            </div>
                            <div className="bg-[var(--bg-main)]/50 p-8 rounded-[2rem] border border-[var(--border-main)] shadow-[var(--shadow-sm)] relative group/insight overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-20" />
                                <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 italic">
                                    <TrendingUp size={16} /> Synthetic Reasoning
                                </h4>
                                <p className="text-[var(--text-bright)] text-sm leading-relaxed font-bold italic opacity-80">
                                    {selectedApp.aiScores?.aiExplanation || "AI analysis indicates strong directional alignment with requested tech stack and behavioral benchmarks. Predictive performance suggests high-potential onboarding success."}
                                </p>
                            </div>
                            <div className="flex justify-end gap-4 pt-6">
                                <button onClick={() => setSelectedApp(null)}
                                    className="px-8 py-3 bg-[var(--bg-main)] text-[var(--text-muted)] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-[var(--text-bright)] border border-[var(--border-main)] transition-all active:scale-95 italic shadow-[var(--shadow-sm)]">
                                    Close Interface
                                </button>
                                {selectedApp.status === 'FACULTY_APPROVED' && (
                                    <button onClick={() => { handleShortlist(selectedApp._id); setSelectedApp(null); }}
                                        className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/30 active:scale-95 border border-emerald-400/20 italic">
                                        Confirm Shortlist
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Candidate Dossier Hub */}
            {showResume && (
                <div className="fixed inset-0 bg-[var(--bg-main)]/80 backdrop-blur-xl flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-[var(--shadow-2xl)] overflow-hidden flex flex-col relative group/dossier">
                        <div className="p-8 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-main)]/30 backdrop-blur-md shrink-0 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[var(--shadow-sm)] group-hover/dossier:scale-110 transition-transform italic font-black">
                                    DOC
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">Candidate Dossier</h3>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60 italic">Profile Integrity: Verified</p>
                                </div>
                            </div>
                            <button onClick={() => setShowResume(null)} className="w-12 h-12 flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-red-400 rounded-2xl border border-[var(--border-main)] hover:border-red-500/30 transition-all shadow-[var(--shadow-sm)] active:scale-90">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-10 space-y-10 relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b98133 transparent' }}>
                            {!resumeData && !showResume.studentId?.profile ? (
                                <div className="flex flex-col items-center justify-center h-full py-24 gap-6">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-2xl border-4 border-emerald-500/10 border-t-emerald-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                                            <ShieldCheck size={24} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 animate-pulse italic">Reconstructing Profile Data...</p>
                                </div>
                            ) : (
                                <div className="space-y-10 animate-in fade-in duration-700">
                                    {showResume.studentId?.profile?.recruiterPitch && (
                                        <div className="bg-[var(--bg-main)]/50 border border-emerald-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group/pitch shadow-[var(--shadow-lg)]">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover/pitch:bg-emerald-500/10 transition-all duration-700"></div>
                                            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3 italic">
                                                <Zap size={14} className="fill-emerald-400/20" /> Executive Summary
                                            </h4>
                                            <p className="text-[var(--text-bright)] text-lg font-bold italic leading-relaxed relative z-10 px-4 border-l-4 border-emerald-500/30">
                                                "{showResume.studentId.profile.recruiterPitch}"
                                            </p>
                                        </div>
                                    )}

                                    {showResume.studentId?.profile?.atsBreakdown && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                { label: 'Impact', val: showResume.studentId.profile.atsBreakdown.impact, color: 'emerald' },
                                                { label: 'Brevity', val: showResume.studentId.profile.atsBreakdown.brevity, color: 'blue' },
                                                { label: 'Structure', val: showResume.studentId.profile.atsBreakdown.structure, color: 'indigo' },
                                                { label: 'Technicality', val: showResume.studentId.profile.atsBreakdown.grammar, color: 'violet' }
                                            ].map((idx, i) => idx.val && (
                                                <div key={i} className="p-6 rounded-[2rem] border border-[var(--border-main)] bg-[var(--bg-main)]/30 flex flex-col gap-4 group/idx hover:border-emerald-500/30 transition-all shadow-[var(--shadow-sm)]">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest italic">{idx.label}</span>
                                                        <span className="text-2xl font-black italic tabular-nums text-emerald-400 group-hover/idx:scale-110 transition-transform">{idx.val.score}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-main)]">
                                                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${idx.val.score}%` }} />
                                                    </div>
                                                    <p className="text-[9px] font-bold text-[var(--text-bright)] italic opacity-50 line-clamp-2 leading-relaxed">{idx.val.feedback}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {showResume.studentId?.profile?.projects?.length > 0 && (
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] italic pl-2">Authenticated Projects</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {showResume.studentId.profile.projects.map((proj, idx) => (
                                                    <div key={idx} className="bg-[var(--bg-main)]/30 p-6 rounded-[2rem] border border-[var(--border-main)] hover:border-emerald-500/20 transition-all shadow-[var(--shadow-sm)] group/proj relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover/proj:opacity-10 transition-opacity">
                                                            <ShieldCheck size={40} className="text-emerald-500" />
                                                        </div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h5 className="font-black text-[var(--text-bright)] text-sm uppercase italic tracking-tight">{proj.title}</h5>
                                                            {proj.aiAudit?.isVerified && (
                                                                <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase shrink-0 border border-emerald-500/20 shadow-[var(--shadow-sm)] italic">
                                                                    <ShieldCheck size={10} /> Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic line-clamp-3 font-bold">{proj.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {resumeData ? (
                                        <div className="space-y-8">
                                            <div className="bg-[var(--bg-main)]/30 p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6 italic">Neural Skill Map</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {resumeData.parsed?.skills?.map(s => (
                                                        <span key={s} className="px-4 py-1.5 bg-[var(--bg-card)] text-emerald-400 rounded-xl text-[10px] font-black border border-emerald-500/20 shadow-[var(--shadow-sm)] hover:bg-emerald-500/10 transition-all italic tracking-widest">{s}</span>
                                                    ))}
                                                    {!resumeData.parsed?.skills && <span className="text-[var(--text-muted)] text-[10px] font-black uppercase italic tracking-widest opacity-40">No extracted data available</span>}
                                                </div>
                                            </div>
                                            <div className="bg-[var(--bg-main)]/30 p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                                <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--bg-card)]/80 backdrop-blur-md rounded-xl p-3 border border-[var(--border-main)] -mx-4">
                                                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Raw Dossier Stream</h4>
                                                    <FileText size={16} className="text-emerald-400" />
                                                </div>
                                                <div className="max-h-[500px] overflow-auto pr-4 custom-scrollbar text-[var(--text-bright)]/70 text-xs font-mono leading-relaxed whitespace-pre-wrap italic kerning-wide bg-black/20 p-6 rounded-2xl border border-[var(--border-main)]/30">
                                                    {resumeData.rawText || "Telemetry stream disconnected. No raw data found."}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-4 border-dashed border-[var(--border-main)]/30 rounded-[3rem] p-24 text-center group/empty transition-all hover:border-emerald-500/20 bg-[var(--bg-main)]/10 shadow-inner">
                                            <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2rem] border border-[var(--border-main)] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-lg)] group-hover/empty:scale-110 transition-transform">
                                                <Search size={40} className="text-[var(--text-muted)] opacity-30" />
                                            </div>
                                            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] italic opacity-40">Resumé Not Uploaded</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Neural Transmission Interface */}
            {connectStudent && (
                <div className="fixed inset-0 bg-[var(--bg-main)]/80 backdrop-blur-xl flex items-center justify-center z-[120] p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] w-full max-w-md rounded-[3rem] shadow-[var(--shadow-2xl)] overflow-hidden relative group/connect">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover/connect:scale-110 transition-transform">
                            <Send size={120} className="text-cyan-400" />
                        </div>
                        <div className="p-8 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-main)]/30 backdrop-blur-md relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 shadow-[var(--shadow-sm)] group-hover/connect:rotate-12 transition-transform">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">Secure Uplink</h3>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60 italic">Direct Protocol: Active</p>
                                </div>
                            </div>
                            <button onClick={() => setConnectStudent(null)} className="w-10 h-10 flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-red-400 rounded-xl border border-[var(--border-main)] hover:border-red-500/30 transition-all shadow-[var(--shadow-sm)] active:scale-90">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] block ml-1 italic opacity-60">Designated Endpoint</label>
                                <div className="p-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl flex items-center gap-4 shadow-[var(--shadow-sm)] group/target hover:border-cyan-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-base border border-cyan-500/20 shadow-inner italic group-hover/target:scale-110 transition-transform">
                                        {connectStudent.name?.charAt(0)}
                                    </div>
                                    <span className="font-black text-[var(--text-bright)] text-sm uppercase italic tracking-tight">{connectStudent.name}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] block ml-1 italic opacity-60">Payload Specification</label>
                                <textarea
                                    value={messagePayload}
                                    onChange={(e) => setMessagePayload(e.target.value)}
                                    placeholder="Enter directive data..."
                                    className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl px-5 py-4 text-sm text-[var(--text-bright)] focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all resize-none h-32 placeholder:text-[var(--text-muted)] placeholder:opacity-40 italic font-bold uppercase kerning-wide shadow-inner"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] block ml-1 italic opacity-60">Carrier Documents</label>
                                <div className="relative">
                                    <input type="file" onChange={(e) => setAttachment(e.target.files[0])} className="hidden" id="msg-attachment" />
                                    <label htmlFor="msg-attachment"
                                        className="flex items-center justify-between p-4 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl cursor-pointer hover:border-cyan-500/50 transition-all shadow-sm group/file">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate max-w-[200px] italic opacity-60">
                                            {attachment ? attachment.name : 'Select binary payload'}
                                        </span>
                                        <span className="px-4 py-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] text-[9px] font-black uppercase tracking-widest text-[var(--text-bright)] rounded-xl shadow-[var(--shadow-sm)] group-hover/file:bg-cyan-500 group-hover/file:text-white transition-all italic">Browse</span>
                                    </label>
                                    {attachment && (
                                        <button onClick={(e) => { e.preventDefault(); setAttachment(null); }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-all shadow-lg active:scale-95">
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button onClick={() => { setConnectStudent(null); setAttachment(null); }}
                                    className="px-8 py-3 bg-[var(--bg-main)] text-[var(--text-muted)] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-[var(--text-bright)] border border-[var(--border-main)] transition-all active:scale-95 italic shadow-[var(--shadow-sm)]">
                                    Abort
                                </button>
                                <button onClick={handleSendMessage}
                                    disabled={(!messagePayload.trim() && !attachment) || sendingMsg}
                                    className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-500/30 disabled:opacity-50 flex items-center gap-3 active:scale-95 border border-cyan-400/20 italic group/send">
                                    {sendingMsg ? 'Transmitting...' : <><Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Transmit Directive</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ScoreBlock = ({ label, value, color }) => {
    const colors = { 
        indigo: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10", 
        emerald: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10", 
        amber: "text-amber-400 bg-amber-500/5 border-amber-500/10" 
    };
    return (
        <div className={`text-center p-6 rounded-[2rem] border transition-all hover:scale-105 shadow-[var(--shadow-sm)] ${colors[color]}`}>
            <div className="text-[8px] font-black mb-2 uppercase tracking-[0.2em] italic opacity-60">{label}</div>
            <div className="text-3xl font-black italic tabular-nums">{value || '??'}%</div>
        </div>
    );
};

export default RecruiterApplicants;
