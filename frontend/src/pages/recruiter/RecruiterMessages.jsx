// frontend/src/pages/recruiter/RecruiterMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { messagingApi, usersApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { getConversationType } from '../../utils/messaging';
import {
    Send, Search, User, MessageSquare, Shield,
    CheckCheck, ArrowLeft, Paperclip, Plus, Lock,
    GraduationCap, Building2, X, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RecruiterMessages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [showNewChatPanel, setShowNewChatPanel] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [searchContact, setSearchContact] = useState("");
    const [filterRole, setFilterRole] = useState('ALL');
    const [attachments, setAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadConversations();
        loadContacts();
        const convInterval = setInterval(loadConversations, 10000);
        return () => clearInterval(convInterval);
    }, []);

    useEffect(() => {
        if (selectedConv) {
            loadHistory();
            const interval = setInterval(loadHistory, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedConv]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const { data } = await messagingApi.getConversations();
            setConversations(data);
            if (data.length > 0 && !selectedConv) setSelectedConv(data[0]);
        } catch {
            toast.error('Failed to sync recruitment channels');
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const { data } = await usersApi.getStaff();
            setContacts(data);
        } catch {
            console.error('Failed to load contacts');
        }
    };

    const loadHistory = async () => {
        try {
            const { data } = await messagingApi.getHistory(selectedConv.otherUser._id, selectedConv.type);
            setMessages(data);
        } catch {
            console.error('Failed to load history');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await messagingApi.uploadAttachment(formData);
            setAttachments(prev => [...prev, data]);
            toast.success('File uploaded');
        } catch {
            toast.error('File upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && attachments.length === 0) || !selectedConv) return;
        try {
            const res = await messagingApi.send({
                conversationType: selectedConv.type,
                recipientIds: [selectedConv.otherUser._id],
                plaintext: newMessage,
                attachments: attachments
            });
            setMessages(prev => [...prev, { ...res.data, plaintext: newMessage, attachments }]);
            setNewMessage("");
            setAttachments([]);
            loadConversations();
        } catch {
            toast.error('Message transmission failed');
        }
    };

    const startNewChat = (contact) => {
        const existing = conversations.find(c => c.otherUser._id === contact._id);
        if (existing) {
            setSelectedConv(existing);
        } else {
            setSelectedConv({
                otherUser: contact,
                type: getConversationType(user.role, contact.role),
                lastMessage: null
            });
            setMessages([]);
        }
        setShowNewChatPanel(false);
    };

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchContact.toLowerCase());
        const matchesRole = filterRole === 'ALL' || c.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <MessageSquare size={24} className="animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Neural Channels...</p>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-[var(--bg-main)] rounded-[3rem] shadow-[var(--shadow-2xl)] border border-[var(--border-main)] overflow-hidden animate-in fade-in duration-700 relative">
            {/* Sidebar */}
            <div className={`w-full md:w-80 lg:w-[400px] border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-card)]/50 backdrop-blur-xl relative z-20 ${selectedConv && !showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tight flex items-center gap-3 italic">
                            <MessageSquare className="text-indigo-500" size={24} /> Neural <span className="text-indigo-400">Link</span>
                        </h2>
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1 italic opacity-50">Secure Transmission Grid</p>
                    </div>
                    <button onClick={() => setShowNewChatPanel(true)}
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-indigo-500/20 group/plus">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-main)] scrollbar-track-transparent">
                    {showNewChatPanel ? (
                        <div className="p-6 animate-in slide-in-from-right-6 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">Initialize Channel</span>
                                <button onClick={() => setShowNewChatPanel(false)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors bg-[var(--bg-main)] p-2 rounded-lg border border-[var(--border-main)]"><X size={14} /></button>
                            </div>
                            <div className="flex gap-2 mb-6 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-main)] shadow-inner">
                                {['ALL', 'STUDENT', 'TPO'].map(t => (
                                    <button key={t} onClick={() => setFilterRole(t)}
                                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic ${filterRole === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-indigo-400'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="relative mb-6 group/search">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/search:text-indigo-500 transition-colors" size={14} />
                                <input type="text" placeholder="Scan Directory..."
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl py-3.5 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-bright)] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:opacity-40 italic shadow-inner"
                                    value={searchContact} onChange={(e) => setSearchContact(e.target.value)} />
                            </div>
                            <div className="space-y-3">
                                {filteredContacts.map(c => (
                                    <div key={c._id} onClick={() => startNewChat(c)}
                                        className="p-4 bg-[var(--bg-main)]/50 hover:bg-[var(--bg-main)] rounded-2xl cursor-pointer transition-all flex items-center gap-4 border border-[var(--border-main)] hover:border-indigo-500/30 group/contact shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 group-hover/contact:bg-indigo-500 group-hover/contact:text-white transition-all shrink-0">
                                            {c.role === 'STUDENT' ? <GraduationCap size={18} /> : c.role === 'RECRUITER' ? <Building2 size={18} /> : <User size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-black text-[var(--text-bright)] truncate uppercase italic leading-none">{c.name}</div>
                                            <div className="text-[8px] text-indigo-400 font-black uppercase tracking-widest mt-1 opacity-60 italic">{c.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div key={conv.otherUser._id} onClick={() => setSelectedConv(conv)}
                                className={`p-6 cursor-pointer transition-all border-l-4 relative group/conv ${
                                    selectedConv?.otherUser._id === conv.otherUser._id
                                        ? 'bg-indigo-500/5 border-l-indigo-500 shadow-inner'
                                        : 'border-l-transparent hover:bg-[var(--bg-main)]/50 hover:border-l-[var(--border-main)]'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`font-black tracking-tight truncate pr-4 text-sm uppercase italic transition-colors ${selectedConv?.otherUser._id === conv.otherUser._id ? 'text-indigo-400' : 'text-[var(--text-bright)]'}`}>{conv.otherUser.name}</div>
                                    <div className="text-[8px] font-black text-[var(--text-muted)] uppercase shrink-0 opacity-40 italic">
                                        {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : 'Active'}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest italic">{conv.type.replace(/_/g, ' ')}</div>
                                    {selectedConv?.otherUser._id === conv.otherUser._id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {!showNewChatPanel && conversations.length === 0 && (
                        <div className="p-16 text-center opacity-20 italic">
                            <Lock size={40} className="mx-auto mb-5 text-[var(--text-muted)]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Channels Inactive</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[var(--bg-main)]/30 backdrop-blur-sm ${!selectedConv || showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                {selectedConv ? (
                    <>
                        {/* Header Area */}
                        <div className="p-6 border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-xl flex items-center justify-between shrink-0 relative z-10 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center gap-5">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden text-[var(--text-muted)] hover:text-indigo-400 mr-2 bg-[var(--bg-main)] p-2 rounded-xl border border-[var(--border-main)]">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 font-black italic shadow-inner">
                                    {selectedConv.otherUser.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-black text-[var(--text-bright)] tracking-tight uppercase italic text-base">{selectedConv.otherUser.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]"></div>
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic opacity-80">Synchronized</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-main)] px-4 py-2.5 rounded-2xl border border-[var(--border-main)] shadow-inner group/shield hover:border-indigo-500/30 transition-all cursor-help">
                                <Shield className="text-indigo-400 group-hover:rotate-12 transition-transform" size={14} />
                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">Neural Encryption Active</span>
                            </div>
                        </div>

                        {/* Message Feed */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent scrollbar-thin scrollbar-thumb-[var(--border-main)] scrollbar-track-transparent">
                            {messages.map((m, idx) => (
                                <div key={m._id || idx} className={`flex animate-in fade-in slide-in-from-bottom-2 duration-500 ${m.sentBy === (user?._id || user?.userId) ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] md:max-w-[70%] lg:max-w-[60%] p-5 rounded-[2rem] text-sm shadow-[var(--shadow-lg)] relative group/msg ${
                                        m.sentBy === (user?._id || user?.userId)
                                            ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/30"
                                            : "bg-[var(--bg-card)] text-[var(--text-bright)] border border-[var(--border-main)] rounded-tl-none shadow-[var(--shadow-sm)]"
                                    }`}>
                                        <div className="leading-relaxed font-bold italic">
                                            {m.plaintext}
                                            {m.attachments?.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {m.attachments.map((file, i) => (
                                                        <a key={i}
                                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 ${
                                                                m.sentBy === (user?._id || user?.userId)
                                                                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                                    : "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-bright)] hover:border-indigo-500/30 shadow-inner"
                                                            }`}>
                                                            <div className={`p-2 rounded-xl ${m.sentBy === (user?._id || user?.userId) ? 'bg-white/10' : 'bg-[var(--bg-card)] border border-[var(--border-main)] text-indigo-400'}`}>
                                                                <FileText size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-[10px] font-black uppercase tracking-tight truncate block italic">{file.filename}</span>
                                                                <span className="text-[8px] opacity-40 uppercase font-black mt-0.5 block italic">Resource Link</span>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-[8px] mt-3 font-black uppercase tracking-widest opacity-40 flex items-center gap-2 italic ${
                                            m.sentBy === (user?._id || user?.userId) ? 'justify-end' : 'justify-start'
                                        }`}>
                                            {m.sentBy === (user?._id || user?.userId) && <CheckCheck size={11} className="text-emerald-300" />}
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* Direct Control Input */}
                        <div className="p-6 bg-[var(--bg-card)]/50 border-t border-[var(--border-main)] shrink-0 relative z-10 backdrop-blur-xl">
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300">
                                    {attachments.map((file, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-[var(--bg-main)] border border-indigo-500/30 px-4 py-2 rounded-2xl shadow-[var(--shadow-md)]">
                                            <FileText size={14} className="text-indigo-400" />
                                            <span className="text-[10px] font-black uppercase tracking-tight text-[var(--text-bright)] truncate max-w-[150px] italic">{file.filename}</span>
                                            <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"><X size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all active:scale-90 shrink-0 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] ${
                                        isUploading 
                                            ? 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] overflow-hidden relative' 
                                            : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-indigo-500/40 hover:text-indigo-400'
                                    }`}>
                                    {isUploading ? (
                                        <div className="absolute inset-0 bg-indigo-600/10 animate-pulse flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
                                        </div>
                                    ) : <Paperclip size={20} />}
                                </button>
                                <div className="flex-1 relative group/input">
                                    <input type="text" value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={isUploading ? "TRANSMITTING DATA..." : "INITIATE TRANSMISSION..."}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl px-6 py-4 text-sm text-[var(--text-bright)] font-bold italic focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:opacity-30 placeholder:uppercase placeholder:tracking-[0.2em] shadow-inner hover:border-indigo-500/30"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={isUploading} />
                                </div>
                                <button onClick={handleSendMessage}
                                    disabled={isUploading || (!newMessage.trim() && attachments.length === 0)}
                                    className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-xl shadow-indigo-500/30 active:scale-90 disabled:opacity-50 shrink-0 flex items-center justify-center group/send border border-indigo-400/20">
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform fill-current" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-8 relative overflow-hidden">
                        {/* Background Visual focus */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                            <MessageSquare size={500} className="rotate-12" />
                        </div>
                        <div className="w-24 h-24 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] flex items-center justify-center relative shadow-[var(--shadow-2xl)] animate-bounce duration-[3s]">
                            <MessageSquare size={40} className="text-indigo-400" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full animate-ping" />
                        </div>
                        <div className="text-center relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-[0.4em] text-[var(--text-bright)] italic leading-none">Awaiting Directive</h3>
                            <p className="text-[10px] mt-3 uppercase font-black tracking-widest opacity-40 italic">Select a neural node to initiate synchronization</p>
                        </div>
                        <button onClick={() => setShowNewChatPanel(true)} className="px-8 py-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:border-indigo-500/30 hover:text-indigo-400 transition-all italic shadow-[var(--shadow-md)]">
                            Initialize Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterMessages;
