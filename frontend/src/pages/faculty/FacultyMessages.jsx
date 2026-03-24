// frontend/src/pages/faculty/FacultyMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { messagingApi, usersApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { getConversationType } from '../../utils/messaging';
import {
    Send, Search, User, MessageSquare, Shield,
    CheckCheck, ArrowLeft, Paperclip, File,
    Plus, Lock, GraduationCap, Building2, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const FacultyMessages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showNewChatPanel, setShowNewChatPanel] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [searchContact, setSearchContact] = useState('');
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
        } catch (err) {
            toast.error('Failed to sync conversations');
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const { data } = await usersApi.getStaff();
            setContacts(data);
        } catch (err) {
            console.error('Failed to load contacts');
        }
    };

    const loadHistory = async () => {
        try {
            const { data } = await messagingApi.getHistory(selectedConv.otherUser._id, selectedConv.type);
            setMessages(data);
        } catch (err) {
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
        } catch (err) {
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
                conversationType: selectedConv.type || 'FACULTY_STUDENT',
                recipientIds: [selectedConv.otherUser._id],
                plaintext: newMessage,
                attachments
            });
            setMessages(prev => [...prev, { ...res.data, plaintext: newMessage, attachments }]);
            setNewMessage('');
            setAttachments([]);
            loadConversations();
        } catch (err) {
            toast.error('Failed to send message');
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <MessageSquare size={24} className="text-indigo-500 animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Establishing Secure Uplink...</p>
        </div>
    );

    const myId = user?._id || user?.userId;

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] overflow-hidden shadow-[var(--shadow-2xl)] animate-in fade-in zoom-in-95 duration-500">

            {/* Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-main)]/30 backdrop-blur-xl shrink-0 ${selectedConv && !showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between">
                    <h2 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tight flex items-center gap-3 italic">
                        <MessageSquare size={20} className="text-indigo-500" /> Pulse<span className="text-indigo-400">Comms</span>
                    </h2>
                    <button
                        onClick={() => setShowNewChatPanel(true)}
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-90 transition-all flex items-center justify-center border border-indigo-400/20"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
                    {showNewChatPanel ? (
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic animate-pulse">Initialize Contact</span>
                                <button onClick={() => setShowNewChatPanel(false)} className="w-8 h-8 flex items-center justify-center bg-[var(--bg-main)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 rounded-lg transition-all border border-[var(--border-main)] hover:border-red-500/30 shadow-[var(--shadow-sm)]">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['ALL', 'STUDENT', 'TPO', 'ALUMNI'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterRole(t)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border italic ${
                                            filterRole === t 
                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' 
                                                : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-indigo-400 border-[var(--border-main)] hover:border-indigo-500/30'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search people..."
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl py-3 pl-11 pr-4 text-xs text-[var(--text-bright)] outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-[var(--text-muted)] transition-all font-medium shadow-[var(--shadow-sm)]"
                                    value={searchContact}
                                    onChange={(e) => setSearchContact(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f133 transparent' }}>
                                {contacts.filter(c => {
                                    const matchesSearch = c.name?.toLowerCase().includes(searchContact.toLowerCase());
                                    const matchesRole = filterRole === 'ALL' || c.role === filterRole;
                                    return matchesSearch && matchesRole;
                                }).map(c => (
                                    <div
                                        key={c._id}
                                        onClick={() => startNewChat(c)}
                                        className="p-4 bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] rounded-[1.5rem] cursor-pointer transition-all flex items-center gap-4 border border-[var(--border-main)] hover:border-indigo-500/40 group shadow-[var(--shadow-sm)]"
                                    >
                                        <div className="w-11 h-11 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all shadow-[var(--shadow-sm)]">
                                            {c.role === 'STUDENT' ? <GraduationCap size={18} /> : c.role === 'RECRUITER' ? <Building2 size={18} /> : <User size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-black text-[var(--text-bright)] leading-tight truncate uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">{c.name}</div>
                                            <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-1 opacity-50 italic">{c.role}</div>
                                        </div>
                                    </div>
                                ))}
                                {contacts.length === 0 && (
                                    <div className="p-12 text-center opacity-40">
                                        <div className="p-6 rounded-full bg-[var(--bg-main)] border border-[var(--border-main)] inline-block mb-4 shadow-[var(--shadow-sm)]">
                                            <Search size={32} className="text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">No matches found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-px overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f133 transparent' }}>
                            {conversations.map(conv => (
                                <div
                                    key={conv.otherUser._id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={`p-6 cursor-pointer transition-all border-l-4 relative group/item overflow-hidden ${
                                        selectedConv?.otherUser._id === conv.otherUser._id
                                            ? 'bg-indigo-600/10 border-l-indigo-500'
                                            : 'border-l-transparent hover:bg-[var(--bg-main)]/40 hover:border-l-indigo-500/30'
                                    }`}
                                >
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-[1.2rem] bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-indigo-400 font-black text-lg shrink-0 shadow-[var(--shadow-sm)] group-hover/item:scale-110 transition-transform italic">
                                            {conv.otherUser.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <div className="font-black text-[var(--text-bright)] text-sm truncate uppercase tracking-tight italic group-hover/item:text-indigo-400 transition-colors">{conv.otherUser.name}</div>
                                                <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest shrink-0 ml-2 opacity-60">
                                                    {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                                                </div>
                                            </div>
                                            <p className={`text-[10px] truncate uppercase font-bold tracking-tight italic ${selectedConv?.otherUser._id === conv.otherUser._id ? 'text-indigo-400/80' : 'text-[var(--text-muted)] opacity-60'}`}>
                                                {conv.lastMessage?.sentBy === myId ? 'Sent | ' : 'Recv | '}
                                                {conv.lastMessage?.plaintext || 'Initializing Secure Channel...'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <div className="p-16 text-center opacity-20 group">
                                    <div className="p-10 rounded-[3rem] bg-[var(--bg-main)] border border-[var(--border-main)] inline-block mb-6 shadow-[var(--shadow-lg)] group-hover:scale-110 transition-transform">
                                        <Lock size={48} className="text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] italic">No Comms History</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col min-w-0 ${!selectedConv || showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-6 border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-2xl flex items-center justify-between shrink-0 z-20 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center gap-5">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden w-10 h-10 flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-indigo-400 rounded-xl border border-[var(--border-main)] shadow-[var(--shadow-sm)] transition-all active:scale-95">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-14 h-14 bg-indigo-600/10 border-2 border-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-xl shadow-[var(--shadow-md)] italic">
                                    {selectedConv.otherUser.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-black text-[var(--text-bright)] text-base uppercase tracking-tight italic flex items-center gap-2">
                                        {selectedConv.otherUser.name}
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic opacity-80">Telemetry Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-main)] px-5 py-2.5 rounded-2xl border border-[var(--border-main)] shadow-[var(--shadow-sm)] group cursor-help">
                                <Shield className="text-indigo-400 group-hover:scale-110 transition-transform" size={16} />
                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Quantum Shielded</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-1 p-8 overflow-y-auto space-y-6 bg-[var(--bg-main)]/20 relative"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f133 transparent' }}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--indigo-500-10),transparent)] pointer-events-none" />
                            {messages.map((m, idx) => (
                                <div key={m._id || idx} className={`flex ${m.sentBy === myId ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[75%] p-5 rounded-[2rem] text-sm shadow-[var(--shadow-lg)] relative group/msg transition-all hover:scale-[1.02] ${
                                        m.sentBy === myId
                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/20'
                                            : 'bg-[var(--bg-card)] text-[var(--text-bright)] border border-[var(--border-main)] rounded-tl-none'
                                    }`}>
                                        <div className="leading-relaxed font-bold italic tracking-tight">
                                            {m.plaintext}
                                            {m.attachments?.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {m.attachments.map((file, i) => (
                                                        <a
                                                            key={i}
                                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all hover:scale-[1.05] ${
                                                                m.sentBy === myId
                                                                    ? 'bg-white/10 border-white/20 text-white shadow-xl shadow-white/5'
                                                                    : 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-indigo-400 hover:border-indigo-500/30'
                                                            }`}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
                                                                <File size={16} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest truncate">{file.filename}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-[8px] mt-2 font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 italic ${
                                            m.sentBy === myId ? 'justify-end' : 'justify-start'
                                        }`}>
                                            {m.sentBy === myId && <CheckCheck size={12} className="text-white" />}
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-[var(--border-main)] bg-[var(--bg-card)]/50 backdrop-blur-3xl shrink-0 z-20">
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-4 animate-in slide-in-from-bottom-4">
                                    {attachments.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-[var(--bg-main)] border border-indigo-500/20 px-3 py-2 rounded-xl shadow-[var(--shadow-sm)] group/file">
                                            <File size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate max-w-[120px] italic">{file.filename}</span>
                                            <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="w-5 h-5 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all ml-1 border border-red-500/20">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={`w-14 h-14 rounded-2xl border transition-all active:scale-95 shrink-0 flex items-center justify-center shadow-[var(--shadow-md)] ${
                                        isUploading 
                                            ? 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--border-main)]' 
                                            : 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-indigo-400 hover:border-indigo-500/30'
                                    }`}
                                >
                                    <Paperclip size={20} className={isUploading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={isUploading ? 'PROCESSING PAYLOAD...' : 'TRANSMIT MESSAGE...'}
                                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl px-6 py-4 text-sm text-[var(--text-bright)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-40 font-black tracking-tight italic uppercase shadow-[var(--shadow-md)]"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isUploading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isUploading || (!newMessage.trim() && attachments.length === 0)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white w-14 h-14 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50 shrink-0 group flex items-center justify-center border border-indigo-400/20"
                                >
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 opacity-40 select-none animate-in fade-in zoom-in-95 duration-700">
                        <div className="relative">
                            <div className="w-28 h-28 bg-[var(--bg-card)] rounded-[2.5rem] flex items-center justify-center border border-[var(--border-main)] shadow-[var(--shadow-xl)] group-hover:rotate-12 transition-transform">
                                <MessageSquare size={44} className="text-indigo-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border-4 border-[var(--bg-main)] shadow-lg animate-bounce">
                                <Zap size={16} />
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <p className="font-black uppercase tracking-[0.4em] text-[var(--text-bright)] text-sm italic">Comms Offline</p>
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--text-muted)] italic opacity-60">Select a secure channel to begin transmission</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyMessages;
