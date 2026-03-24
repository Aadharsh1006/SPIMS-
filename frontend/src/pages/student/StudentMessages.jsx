// frontend/src/pages/student/StudentMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { messagingApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import {
    User, Send, Shield, Search,
    MessageSquare, ArrowLeft, CheckCheck,
    Lock, Plus, X, GraduationCap, Building2, Paperclip, File
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usersApi } from '../../api/api';
import { getConversationType } from '../../utils/messaging';

const StudentMessages = () => {
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
        } catch {
            toast.error('Failed to load messages');
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
                conversationType: selectedConv.type || 'FACULTY_STUDENT',
                recipientIds: [selectedConv.otherUser._id],
                plaintext: newMessage,
                attachments
            });
            setMessages(prev => [...prev, { ...res.data, plaintext: newMessage, attachments }]);
            setNewMessage("");
            setAttachments([]);
            loadConversations();
        } catch {
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
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)] mb-4 shadow-[var(--shadow-sm)]"></div>
            <p className="text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest italic">Loading secure channel...</p>
        </div>
    );

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchContact.toLowerCase());
        const matchesRole = filterRole === 'ALL' || c.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-[var(--bg-card)]/80 backdrop-blur-md rounded-[2.5rem] border border-[var(--border-main)] overflow-hidden animate-in fade-in duration-700 shadow-[var(--shadow-lg)]">

            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-main)]/30 ${selectedConv && !showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>

                {/* Sidebar Header */}
                <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card)]/40">
                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-[var(--text-bright)] uppercase tracking-tighter flex items-center gap-3 italic">
                            <MessageSquare className="text-[var(--accent)]" size={22} /> Messages
                        </h2>
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Protected channel</p>
                    </div>
                    <button
                        onClick={() => setShowNewChatPanel(true)}
                        className="p-3.5 bg-[var(--bg-main)] hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-white rounded-[1rem] transition-all border border-[var(--border-main)] hover:border-[var(--accent)]/50 active:scale-95 group shadow-[var(--shadow-sm)]"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Sidebar Body */}
                <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
                    {showNewChatPanel ? (
                        <div className="p-5 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Search people</span>
                                <button onClick={() => setShowNewChatPanel(false)} className="text-[var(--text-muted)] hover:text-[var(--text-bright)] p-2 hover:bg-[var(--bg-main)] rounded-lg transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex gap-2 mb-5 flex-wrap">
                                {['ALL', 'FACULTY', 'TPO', 'ALUMNI', 'RECRUITER'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterRole(t)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-[var(--shadow-sm)] ${filterRole === t ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-main)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="relative mb-6 group/search">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/search:text-[var(--accent)] transition-colors" size={15} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl py-3 pl-10 pr-5 text-xs text-[var(--text-bright)] outline-none focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] transition-all font-black placeholder:text-[var(--text-muted)]/50 italic"
                                    value={searchContact}
                                    onChange={(e) => setSearchContact(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                {filteredContacts.map(c => (
                                    <div
                                        key={c._id}
                                        onClick={() => startNewChat(c)}
                                        className="p-4 bg-[var(--bg-main)]/50 hover:bg-[var(--bg-main)] rounded-[1.25rem] cursor-pointer transition-all flex items-center gap-4 border border-[var(--border-main)]/50 hover:border-[var(--accent)]/30 group shadow-[var(--shadow-sm)]"
                                    >
                                        <div className="w-10 h-10 bg-[var(--bg-card)] text-[var(--accent)] rounded-xl flex items-center justify-center font-black text-xs border border-[var(--border-main)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all shadow-[var(--shadow-sm)]">
                                            {c.role === 'STUDENT' ? <GraduationCap size={18} /> : c.role === 'RECRUITER' ? <Building2 size={18} /> : <User size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-black text-[var(--text-bright)] leading-tight italic uppercase tracking-tighter truncate">{c.name}</div>
                                            <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[var(--shadow-sm)] shadow-emerald-500/20" />
                                                {c.role} {c.profile?.department || c.profile?.company}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredContacts.length === 0 && (
                                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase italic p-10 text-center border-2 border-dashed border-[var(--border-main)] rounded-[1.5rem] opacity-50">
                                        No contacts found
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {conversations.map(conv => (
                                <div
                                    key={conv.otherUser._id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={`p-6 cursor-pointer transition-all border-l-4 relative group ${
                                        selectedConv?.otherUser._id === conv.otherUser._id
                                            ? 'bg-[var(--bg-secondary)] border-l-[var(--accent)]'
                                            : 'border-l-transparent hover:bg-[var(--bg-secondary)]/50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-black text-[var(--text-bright)] tracking-tighter italic uppercase text-sm group-hover:text-[var(--accent)] transition-colors truncate flex-1 mr-3 leading-none">{conv.otherUser.name}</div>
                                        <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-main)] px-2 py-0.5 rounded border border-[var(--border-main)] shrink-0 shadow-[var(--shadow-sm)]">
                                            {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : 'Now'}
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-black text-[var(--accent)]/60 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-[var(--accent)]/40 shadow-[var(--shadow-sm)]" />
                                        {conv.type?.replace(/_/g, ' ')}
                                    </div>
                                    <p className="text-[11px] text-[var(--text-muted)] truncate italic font-bold">
                                        {conv.lastMessage?.sentBy === (user?._id || user?.userId) && (
                                            <span className="text-[var(--accent)]/80 font-black mr-1 not-italic text-[9px] uppercase tracking-tighter">You: </span>
                                        )}
                                        "{conv.lastMessage?.plaintext || 'No messages yet'}"
                                    </p>
                                    {selectedConv?.otherUser._id === conv.otherUser._id && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[var(--accent)]/5">
                                            <Shield size={48} />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <div className="p-14 text-center">
                                    <div className="w-24 h-24 bg-[var(--bg-main)] rounded-[2.5rem] border border-[var(--border-main)] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-sm)]">
                                        <Lock size={36} className="text-[var(--text-muted)] opacity-20" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">No messages yet</p>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-2 tracking-widest opacity-60 italic">Start a conversation to see it here.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConv || showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-md flex items-center justify-between z-10 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center gap-5">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-bright)] mr-1 p-2 bg-[var(--bg-main)] rounded-xl border border-[var(--border-main)] active:scale-90 transition-all shadow-[var(--shadow-sm)]">
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="h-14 w-14 bg-[var(--bg-main)] text-[var(--text-bright)] border border-[var(--border-main)] rounded-[1.25rem] flex items-center justify-center font-black text-xl shadow-[var(--shadow-md)]">
                                    {selectedConv.otherUser.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-black text-[var(--text-bright)] text-xl tracking-tighter uppercase italic leading-none">{selectedConv.otherUser.name}</div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-emerald-500/50"></div>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-main)] border border-[var(--border-main)] px-5 py-2.5 rounded-xl shadow-[var(--shadow-sm)]">
                                <Shield className="text-[var(--accent)]" size={16} />
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Secure Connection</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[var(--bg-main)]/30 [scrollbar-width:thin] [scrollbar-color:var(--border-main)_transparent]">
                            {messages.map((m, idx) => (
                                <div key={m._id || idx} className={`flex ${m.sentBy === (user?._id || user?.userId) ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] p-6 rounded-[2rem] text-sm shadow-[var(--shadow-md)] relative overflow-hidden border ${
                                        m.sentBy === (user?._id || user?.userId)
                                            ? "bg-[var(--accent)] text-white rounded-tr-none border-[var(--accent)]/30"
                                            : "bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-main)] rounded-tl-none font-medium italic"
                                    }`}>
                                        <div className="leading-relaxed relative z-10">
                                            {m.plaintext}
                                            {m.attachments?.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {m.attachments.map((file, i) => (
                                                        <a
                                                            key={i}
                                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] shadow-[var(--shadow-sm)] ${
                                                                m.sentBy === (user?._id || user?.userId)
                                                                    ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                                                                    : "bg-[var(--bg-main)] border-[var(--border-main)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                                                            }`}
                                                        >
                                                            <File size={15} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[10px] font-black uppercase truncate">{file.filename}</div>
                                                                <div className="text-[8px] opacity-60 uppercase tracking-widest tabular-nums">{(file.size / 1024).toFixed(1)} KB</div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-[9px] mt-3 font-black uppercase tracking-widest opacity-50 flex items-center gap-2 relative z-10 tabular-nums ${
                                            m.sentBy === (user?._id || user?.userId) ? 'justify-end' : 'justify-start'
                                        }`}>
                                            {m.sentBy === (user?._id || user?.userId) && <CheckCheck size={13} className="text-white/80" />}
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-[var(--bg-card)]/80 border-t border-[var(--border-main)] flex-shrink-0 shadow-[var(--shadow-md)]">
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4 max-w-5xl mx-auto">
                                    {attachments.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1.5 rounded-lg shadow-[var(--shadow-sm)]">
                                            <File size={13} className="text-[var(--accent)]" />
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tight truncate max-w-[100px]">{file.filename}</span>
                                            <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="relative flex items-center gap-4 max-w-5xl mx-auto">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={`p-4 rounded-xl border transition-all active:scale-95 shadow-[var(--shadow-sm)] ${isUploading ? 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] opacity-50' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50'}`}
                                >
                                    <Paperclip size={18} className={isUploading ? 'animate-pulse' : ''} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={isUploading ? "Uploading file..." : "Type a message..."}
                                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[1.5rem] px-7 py-4 text-sm text-[var(--text-bright)] focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all placeholder:text-[var(--text-muted)] italic font-black shadow-[var(--shadow-sm)]"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isUploading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isUploading || (!newMessage.trim() && attachments.length === 0)}
                                    className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white p-4 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 group disabled:opacity-40 disabled:pointer-events-none shadow-[var(--shadow-md)]"
                                >
                                    <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-6 bg-[var(--bg-main)]/30">
                        <div className="w-28 h-28 bg-[var(--bg-card)] rounded-[3rem] flex items-center justify-center border border-[var(--border-main)] shadow-[var(--shadow-lg)]">
                            <MessageSquare size={48} className="text-[var(--accent)] opacity-20" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="font-black uppercase tracking-[0.5em] text-[var(--text-bright)] text-sm italic">No conversation selected</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] italic opacity-60">Select a contact to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMessages;
