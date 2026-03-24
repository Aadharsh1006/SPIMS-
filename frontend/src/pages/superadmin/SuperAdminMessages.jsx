// frontend/src/pages/superadmin/SuperAdminMessages.jsx
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
    ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SuperAdminMessages = () => {
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
            toast.error('Failed to sync administrative channels');
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const { data } = await usersApi.getStaff();
            setContacts(data || []);
        } catch (err) {
            console.error('Failed to load administrative contacts');
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
            toast.success('Asset uploaded successfully');
        } catch (err) {
            toast.error('Asset upload blocked');
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
            toast.error('Encryption transmission failure');
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
                <div className="h-16 w-16 rounded-2xl border-4 border-[var(--accent)]/10 border-t-[var(--accent)] animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-[var(--accent)] rounded-lg animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] animate-pulse italic">Initializing Neural Communication Layer...</p>
        </div>
    );

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchContact.toLowerCase());
        const matchesRole = filterRole === 'ALL' || c.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const myId = user?._id || user?.userId;

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-main)] overflow-hidden animate-in fade-in duration-700">

            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-main)]/30 ${selectedConv && !showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-card)]/50 backdrop-blur-md">
                    <h2 className="text-base font-black text-[var(--text-bright)] uppercase tracking-tight flex items-center gap-3 italic">
                        <MessageSquare size={18} className="text-violet-500" />
                        Admin Channels
                    </h2>
                    <button
                        onClick={() => setShowNewChatPanel(true)}
                        className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all shadow-lg shadow-violet-500/20 active:scale-95 border border-white/10"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {showNewChatPanel ? (
                        <div className="p-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic opacity-50">Global Stakeholder Matrix</span>
                                <button onClick={() => setShowNewChatPanel(false)} className="p-1.5 hover:bg-[var(--bg-main)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-bright)] transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex gap-1.5 mb-6 flex-wrap">
                                {['ALL', 'TPO', 'RECRUITER', 'ALUMNI'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterRole(t)}
                                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${filterRole === t ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20' : 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-bright)]'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500 opacity-50" size={14} />
                                <input
                                    type="text"
                                    placeholder="Scan neural directory..."
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl py-3.5 pl-11 pr-5 text-xs text-[var(--text-bright)] outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold italic placeholder:opacity-30"
                                    value={searchContact}
                                    onChange={(e) => setSearchContact(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                {filteredContacts.map(c => (
                                    <div
                                        key={c._id}
                                        onClick={() => startNewChat(c)}
                                        className="p-4 bg-[var(--bg-main)]/50 hover:bg-violet-500/10 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border border-[var(--border-main)] hover:border-violet-500/30 group mb-2 shadow-[var(--shadow-sm)] hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                                    >
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--bg-card)] text-violet-500 border border-[var(--border-main)] shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[var(--shadow-sm)]">
                                            {c.role === 'TPO' ? <ShieldCheck size={18} /> : c.role === 'RECRUITER' ? <Building2 size={18} /> : <User size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-black text-[var(--text-bright)] truncate group-hover:text-violet-400 transition-colors uppercase italic tracking-tighter">{c.name}</div>
                                            <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-1 opacity-50 italic">{c.role} Matrix</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                             {conversations.map(conv => (
                                <div
                                    key={conv.otherUser._id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={`p-6 cursor-pointer transition-all border-l-[6px] relative overflow-hidden group ${selectedConv?.otherUser._id === conv.otherUser._id
                                        ? 'bg-violet-500/5 border-l-violet-600 shadow-[var(--shadow-inner)]'
                                        : 'border-l-transparent hover:bg-[var(--bg-main)]/40'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1.5 relative z-10">
                                        <div className="font-black text-[var(--text-bright)] tracking-tighter truncate uppercase italic group-hover:text-violet-400 transition-colors">{conv.otherUser.name}</div>
                                        <div className="text-[8px] font-black text-[var(--text-muted)] uppercase shrink-0 ml-2 opacity-40">
                                            {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : 'Active Node'}
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 opacity-50 italic">{conv.type?.replace(/_/g, ' ')} Channel</div>
                                    <p className="text-[11px] text-[var(--text-muted)] truncate opacity-50 italic leading-relaxed group-hover:opacity-100 transition-opacity">
                                        {conv.lastMessage?.sentBy === myId ? 'Sent: ' : 'From: '}
                                        {conv.lastMessage?.plaintext || 'No synchronized data available...'}
                                    </p>
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <div className="p-16 text-center opacity-30 mt-10">
                                    <div className="w-20 h-20 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center border border-[var(--border-main)] mx-auto mb-6 shadow-[var(--shadow-sm)]">
                                        <Lock size={40} className="text-violet-500/50" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">Global Vault Empty</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[var(--bg-main)]/20 ${!selectedConv || showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-[var(--border-main)] bg-[var(--bg-card)]/70 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-xl z-20">
                            <div className="flex items-center gap-5">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden text-[var(--text-muted)] hover:text-violet-500 transition-all p-2 hover:bg-[var(--bg-main)] rounded-xl">
                                    <ArrowLeft size={22} />
                                </button>
                                <div className="h-12 w-12 bg-violet-600/10 border-2 border-violet-600/20 rounded-2xl flex items-center justify-center text-violet-400 font-black text-lg shrink-0 shadow-[var(--shadow-md)]">
                                    {selectedConv.otherUser.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-black text-[var(--text-bright)] tracking-tighter uppercase italic text-lg">{selectedConv.otherUser.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.2em] italic">Active Secure Stream</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-main)]/50 px-5 py-2.5 rounded-2xl border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                <Shield className="text-violet-500" size={16} />
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic">Level 1 Encryption</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-[var(--bg-main)]/30 to-transparent">
                            {messages.map((m, idx) => (
                                <div key={m._id || idx} className={`flex ${m.sentBy === myId ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                    <div className={`max-w-[75%] p-5 rounded-[2rem] text-sm shadow-[var(--shadow-lg)] relative group ${m.sentBy === myId
                                        ? "bg-violet-600 text-white rounded-tr-none shadow-violet-600/20 border border-white/10"
                                        : "bg-[var(--bg-card)] text-[var(--text-bright)] border border-[var(--border-main)] rounded-tl-none font-medium italic"
                                        }`}>
                                        <div className="leading-relaxed font-medium">
                                            {m.plaintext}
                                            {m.attachments?.length > 0 && (
                                                <div className="mt-4 space-y-2.5">
                                                    {m.attachments.map((file, i) => (
                                                        <a
                                                            key={i}
                                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all hover:scale-[1.02] backdrop-blur-sm ${m.sentBy === myId
                                                                ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                                : "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-bright)] hover:bg-[var(--bg-secondary)]"
                                                                }`}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center">
                                                                <FileText size={16} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[10px] font-black uppercase tracking-tight truncate">{file.filename}</span>
                                                                <span className="text-[8px] opacity-60 uppercase font-black">Secure Asset</span>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-[8px] mt-3 font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-1.5 italic ${m.sentBy === myId ? 'justify-end' : 'justify-start'}`}>
                                            {m.sentBy === myId && <CheckCheck size={12} className="text-white" />}
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} NODE_TIME
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 bg-[var(--bg-card)]/50 backdrop-blur-md border-t border-[var(--border-main)] shrink-0 z-20">
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-5">
                                    {attachments.map((file, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-[var(--bg-main)] border border-[var(--border-main)] px-4 py-2 rounded-2xl shadow-[var(--shadow-sm)] animate-in zoom-in-95 duration-300">
                                            <FileText size={14} className="text-violet-500" />
                                            <span className="text-[10px] font-black text-[var(--text-bright)] uppercase tracking-tight truncate max-w-[150px] italic">{file.filename}</span>
                                            <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all">
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
                                    className={`p-4 rounded-2xl border transition-all active:scale-95 shadow-[var(--shadow-sm)] ${isUploading ? 'bg-[var(--bg-main)] text-[var(--text-muted)]' : 'bg-[var(--bg-main)] text-violet-500 hover:bg-violet-500/10 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 border-[var(--border-main)]'}`}
                                >
                                    <Paperclip size={20} className={isUploading ? 'animate-pulse' : ''} />
                                </button>
                                <div className="flex-1 relative group">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={isUploading ? "Uploading Secure Payloads..." : "Enter neural directive..."}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[2rem] px-8 py-4 text-[var(--text-bright)] focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-30 font-bold italic shadow-[var(--shadow-inner)]"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={isUploading}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                                        <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-[0.2em] italic">Encrypted Layer 1</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isUploading || (!newMessage.trim() && attachments.length === 0)}
                                    className="bg-violet-600 hover:bg-violet-500 text-white p-4 rounded-[1.5rem] transition-all shadow-xl shadow-violet-600/20 active:scale-95 disabled:opacity-30 group border border-white/10"
                                >
                                    <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-40">
                        <div className="w-20 h-20 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center border border-[var(--border-main)]">
                            <ShieldCheck size={40} className="text-violet-500/50" />
                        </div>
                        <div className="text-center">
                            <p className="font-black uppercase tracking-widest text-sm text-[var(--text-main)]">Command Center Ready</p>
                            <p className="text-[10px] mt-1 uppercase font-bold text-[var(--text-muted)]">Select an administrative stakeholder to begin communication</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminMessages;
