// frontend/src/pages/tpo/TPOMessages.jsx
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

const TPOMessages = () => {
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
            if (data.length > 0 && !selectedConv) {
                setSelectedConv(data[0]);
            }
        } catch (err) {
            toast.error('Failed to sync TPO channels');
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const { data } = await usersApi.getStaff();
            setContacts(data);
        } catch (error) {
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
                conversationType: selectedConv.type || 'TPO_STUDENT',
                recipientIds: [selectedConv.otherUser._id],
                plaintext: newMessage,
                attachments: attachments,
            });
            setMessages(prev => [...prev, { ...res.data, plaintext: newMessage, attachments: attachments }]);
            setNewMessage('');
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
                lastMessage: null,
            });
            setMessages([]);
        }
        setShowNewChatPanel(false);
    };

    const filteredContacts = contacts.filter(c => {
        const matchesSearch =
            c.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchContact.toLowerCase());
        const matchesRole = filterRole === 'ALL' || c.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Initializing Secure Channel...</p>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-14rem)] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in duration-700">

            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-950/50 ${selectedConv && !showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <MessageSquare size={18} className="text-indigo-400" />
                        Communications
                    </h2>
                    <button
                        onClick={() => setShowNewChatPanel(true)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {showNewChatPanel ? (
                        <div className="p-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Conversation</span>
                                <button onClick={() => setShowNewChatPanel(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex gap-1 mb-4 flex-wrap">
                                {['ALL', 'STUDENT', 'FACULTY', 'RECRUITER', 'ALUMNI'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterRole(t)}
                                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filterRole === t ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600"
                                    value={searchContact}
                                    onChange={(e) => setSearchContact(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                {filteredContacts.map(c => (
                                    <div
                                        key={c._id}
                                        onClick={() => startNewChat(c)}
                                        className="p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border border-slate-800/50 hover:border-indigo-500/30"
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 shrink-0">
                                            {c.role === 'STUDENT' ? <GraduationCap size={16} /> : c.role === 'RECRUITER' ? <Building2 size={16} /> : <User size={16} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-white leading-tight truncate">{c.name}</div>
                                            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{c.role}</div>
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
                                    className={`p-5 cursor-pointer transition-all border-l-4 ${
                                        selectedConv?.otherUser._id === conv.otherUser._id
                                            ? 'bg-indigo-500/10 border-l-indigo-500'
                                            : 'border-l-transparent hover:bg-slate-800/50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-white tracking-tight truncate">{conv.otherUser.name}</div>
                                        <div className="text-[8px] font-black text-slate-500 uppercase shrink-0 ml-2">
                                            {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : 'New'}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{conv.type?.replace(/_/g, ' ')}</div>
                                    <p className="text-xs text-slate-500 truncate italic">
                                        {conv.lastMessage?.sentBy === (user?._id || user?.userId) ? 'You: ' : ''}Secured
                                    </p>
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <div className="p-12 text-center opacity-30">
                                    <Lock size={40} className="mx-auto mb-4 text-slate-500" />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">No conversations yet</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-slate-900 ${!selectedConv || showNewChatPanel ? 'hidden md:flex' : 'flex'}`}>
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden text-slate-400 hover:text-white">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="h-11 w-11 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 font-bold shadow-xl">
                                    {selectedConv.otherUser.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-black text-white tracking-tight uppercase">{selectedConv.otherUser.name}</div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                                <Shield className="text-indigo-400" size={14} />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encrypted</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-900">
                            {messages.map((m, idx) => (
                                <div key={m._id || idx} className={`flex ${m.sentBy === (user?._id || user?.userId) ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-3xl text-sm shadow-xl relative ${
                                        m.sentBy === (user?._id || user?.userId)
                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20'
                                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                                    }`}>
                                        <div className="leading-relaxed font-medium">
                                            {m.plaintext}
                                            {m.attachments?.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {m.attachments.map((file, i) => (
                                                        <a
                                                            key={i}
                                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all hover:bg-white/10 ${
                                                                m.sentBy === (user?._id || user?.userId)
                                                                    ? 'bg-white/5 border-white/10 text-white'
                                                                    : 'bg-slate-900 border-slate-700 text-slate-300'
                                                            }`}
                                                        >
                                                            <FileText size={14} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[9px] font-bold truncate">{file.filename}</div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-[8px] mt-2 font-black uppercase tracking-tighter opacity-50 flex items-center gap-1 ${
                                            m.sentBy === (user?._id || user?.userId) ? 'justify-end' : 'justify-start'
                                        }`}>
                                            {m.sentBy === (user?._id || user?.userId) && <CheckCheck size={10} />}
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <div className="p-5 bg-slate-950/50 border-t border-slate-800 shrink-0">
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {attachments.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                                            <FileText size={12} className="text-indigo-400" />
                                            <span className="text-[9px] font-bold text-slate-400 truncate max-w-[100px]">{file.filename}</span>
                                            <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-600 hover:text-red-400 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 text-slate-500 hover:text-indigo-400 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                                >
                                    <Paperclip size={18} className={isUploading ? 'animate-pulse' : ''} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={isUploading ? 'Uploading...' : 'Type a message...'}
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isUploading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isUploading || (!newMessage.trim() && attachments.length === 0)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 shrink-0 group"
                                >
                                    <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-6 opacity-30">
                        <div className="w-20 h-20 bg-slate-800 rounded-[32px] flex items-center justify-center">
                            <MessageSquare size={40} />
                        </div>
                        <div className="text-center">
                            <p className="font-black uppercase tracking-widest text-sm">No Conversation Selected</p>
                            <p className="text-[10px] mt-1 uppercase font-bold">Pick a contact to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TPOMessages;
