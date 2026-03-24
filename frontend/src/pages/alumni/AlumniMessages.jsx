// frontend/src/pages/alumni/AlumniMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { messagingApi, usersApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { getConversationType } from '../../utils/messaging';
import {
    Send,
    Search,
    User,
    MessageSquare,
    Shield,
    CheckCheck,
    ArrowLeft,
    Paperclip,
    Plus,
    Lock,
    GraduationCap,
    Building2,
    X,
    FileText,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const AlumniMessages = () => {
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
            if (data.length > 0 && !selectedConv) {
                setSelectedConv(data[0]);
            }
        } catch (err) {
            toast.error('Failed to sync mentorship channels');
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const { data } = await usersApi.getStaff();
            setContacts(data || []);
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
                conversationType: selectedConv.type,
                recipientIds: [selectedConv.otherUser._id],
                plaintext: newMessage,
                attachments: attachments
            });
            setMessages(prev => [...prev, { ...res.data, plaintext: newMessage, attachments: attachments }]);
            setNewMessage("");
            setAttachments([]);
            loadConversations();
        } catch (err) {
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

    const myId = user?._id || user?.userId;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-cyan-500/10 border-t-cyan-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-cyan-500 rounded-lg animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] animate-pulse italic">Initializing Secure Channel...</p>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-[var(--bg-card)] rounded-[3rem] shadow-[var(--shadow-2xl)] border border-[var(--border-main)] overflow-hidden animate-in fade-in duration-700">

            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-main)]/30 ${selectedConv && !showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tighter flex items-center gap-4 italic">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                            <MessageSquare size={18} />
                        </div>
                        Channels
                    </h2>
                    <button
                        onClick={() => setShowNewChatPanel(true)}
                        className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl transition-all shadow-xl shadow-cyan-600/20 active:scale-95 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-main) transparent' }}>
                    {showNewChatPanel ? (
                        <div className="p-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">New Mentorship</span>
                                <button onClick={() => setShowNewChatPanel(false)} className="w-8 h-8 rounded-lg bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {['ALL', 'STUDENT', 'FACULTY', 'TPO', 'SUPER_ADMIN'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterRole(t)}
                                        className={clsx(
                                            "py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all italic border",
                                            filterRole === t 
                                                ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20" 
                                                : "bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-cyan-500/30"
                                        )}
                                    >
                                        {t?.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl py-3.5 pl-10 pr-4 text-xs text-[var(--text-bright)] outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-[var(--text-muted)] italic"
                                    value={searchContact}
                                    onChange={(e) => setSearchContact(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                {filteredContacts.map(c => (
                                    <div
                                        key={c._id}
                                        onClick={() => startNewChat(c)}
                                        className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-main)] rounded-2xl cursor-pointer transition-all flex items-center gap-4 border border-[var(--border-main)] hover:border-cyan-500/40 group/contact shadow-[var(--shadow-sm)]"
                                    >
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 group-hover/contact:scale-110 transition-transform">
                                            {c.role === 'STUDENT' ? <GraduationCap size={20} /> : 
                                             c.role === 'SUPER_ADMIN' ? <ShieldCheck size={20} /> :
                                             c.role === 'RECRUITER' ? <Building2 size={20} /> : <User size={20} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-black text-[var(--text-bright)] truncate uppercase italic">{c.name}</div>
                                            <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-0.5 italic opacity-60">{c.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-main)]">
                            {conversations.map(conv => (
                                <div
                                    key={conv.otherUser._id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={clsx(
                                        "p-6 cursor-pointer transition-all border-l-4 relative group",
                                        selectedConv?.otherUser._id === conv.otherUser._id
                                            ? "bg-cyan-500/5 border-l-cyan-500 shadow-inner"
                                            : "border-l-transparent hover:bg-[var(--bg-main)]"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-black text-[var(--text-bright)] text-sm tracking-tight truncate uppercase italic group-hover:text-cyan-400 transition-colors">{conv.otherUser.name}</div>
                                        <div className="text-[8px] font-black text-[var(--text-muted)] uppercase shrink-0 ml-3 opacity-60 italic tabular-nums">
                                            {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Active'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest px-2 py-0.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 italic">
                                            {conv.type?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] truncate opacity-60 italic line-clamp-1">
                                        {conv.lastMessage?.sentBy === myId ? <span className="text-cyan-400 font-black not-italic mr-1">YOU:</span> : ''}
                                        {conv.lastMessage?.plaintext || 'Enter secure frequency...'}
                                    </p>
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)] border border-[var(--border-main)] opacity-50">
                                        <Lock size={30} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">No active frequency</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[var(--bg-main)]/10 ${!selectedConv || showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-[var(--shadow-md)] relative z-10">
                            <div className="flex items-center gap-5">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden text-[var(--text-muted)] hover:text-cyan-400 transition-colors">
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="relative group">
                                    <div className="h-12 w-12 bg-cyan-600/10 border border-cyan-600/20 rounded-2xl flex items-center justify-center text-cyan-400 font-black text-xl italic shadow-[var(--shadow-sm)] group-hover:scale-110 transition-transform">
                                        {selectedConv.otherUser.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[var(--bg-card)] shadow-sm animate-pulse" />
                                </div>
                                <div>
                                    <div className="font-black text-[var(--text-bright)] text-lg tracking-tighter uppercase italic">{selectedConv.otherUser.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic opacity-80">Link Synchronized</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-main)] px-5 py-2.5 rounded-2xl border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                <Shield className="text-cyan-400" size={14} />
                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Quantum Encrypted Channel</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-main) transparent' }}>
                            {messages.map((m, idx) => {
                                const isMe = m.sentBy === myId;
                                return (
                                    <div key={m._id || idx} className={clsx("flex group", isMe ? "justify-end" : "justify-start")}>
                                        <div className={clsx(
                                            "max-w-[75%] p-5 rounded-[1.5rem] text-sm shadow-[var(--shadow-lg)] transition-all",
                                            isMe 
                                                ? "bg-cyan-600 text-white rounded-tr-none shadow-cyan-600/20" 
                                                : "bg-[var(--bg-card)] text-[var(--text-bright)] border border-[var(--border-main)] rounded-tl-none"
                                        )}>
                                            <div className="leading-relaxed font-bold italic">
                                                {m.plaintext}
                                                {m.attachments?.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {m.attachments.map((file, i) => (
                                                            <a
                                                                key={i}
                                                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={clsx(
                                                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest italic shadow-[var(--shadow-sm)]",
                                                                    isMe 
                                                                        ? "bg-white/10 border-white/20 text-white hover:bg-white/20" 
                                                                        : "bg-[var(--bg-main)] border-[var(--border-main)] text-cyan-400 hover:border-cyan-500/50"
                                                                )}
                                                            >
                                                                <FileText size={14} />
                                                                <span className="truncate">{file.filename}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={clsx(
                                                "text-[8px] mt-3 font-black uppercase tracking-wider opacity-50 flex items-center gap-1.5 italic",
                                                isMe ? 'justify-end' : 'justify-start'
                                            )}>
                                                {isMe && <CheckCheck size={10} />}
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 bg-[var(--bg-card)]/80 backdrop-blur-xl border-t border-[var(--border-main)] shrink-0">
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {attachments.map((file, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-[var(--bg-main)] border border-cyan-500/30 px-4 py-2 rounded-xl shadow-[var(--shadow-sm)] animate-in slide-in-from-bottom-2">
                                            <FileText size={14} className="text-cyan-400" />
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate max-w-[120px] italic">{file.filename}</span>
                                            <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                                                <X size={14} />
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
                                    className={clsx(
                                        "w-14 h-14 rounded-2xl border transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-[var(--shadow-sm)]",
                                        isUploading 
                                            ? "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--border-main)]" 
                                            : "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-cyan-400 hover:border-cyan-500/40"
                                    )}
                                >
                                    <Paperclip size={20} className={isUploading ? 'animate-pulse' : ''} />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={isUploading ? "TRANSMITTING DATA..." : "SECURE TRANSMISSION..."}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl px-6 py-4 text-sm text-[var(--text-bright)] focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold italic shadow-inner"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={isUploading}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-20">
                                        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                                        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse [animation-delay:200ms]" />
                                        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse [animation-delay:400ms]" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isUploading || (!newMessage.trim() && attachments.length === 0)}
                                    className="w-14 h-14 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl transition-all shadow-xl shadow-cyan-600/30 active:scale-95 disabled:opacity-50 flex items-center justify-center group"
                                >
                                    <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 opacity-40 select-none grayscale hover:grayscale-0 transition-all duration-1000">
                        <div className="relative">
                            <div className="w-32 h-32 bg-[var(--bg-main)] rounded-[3rem] flex items-center justify-center border border-[var(--border-main)] shadow-[var(--shadow-xl)]">
                                <MessageSquare size={50} className="text-[var(--text-muted)]" />
                            </div>
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 text-cyan-400 animate-bounce">
                                <Zap size={24} />
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <p className="font-black uppercase tracking-[0.4em] text-sm text-[var(--text-bright)] italic">Select Transmission Frequency</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">Awaiting encrypted peer connection...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlumniMessages;
