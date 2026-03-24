// frontend/src/components/ChatbotPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import api from '../api/api';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

const ChatbotPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your placement assistant. Ask me about jobs, your application status, or interview tips.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setLoading(true);

        try {
            const { data } = await api.post('/chatbot', { query: userMsg });
            setMessages(prev => [...prev, {
                text: data.reply,
                sender: 'bot',
                actions: data.actions
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                text: "Sorry, I'm having trouble connecting right now.",
                sender: 'bot'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (url) => {
        setIsOpen(false);
        navigate(url);
    };

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[100] flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-6rem)] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-indigo-500/10 flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="bg-white/5 px-5 py-4 flex justify-between items-center border-b border-white/5 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                    <Bot size={20} />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-black text-white text-sm uppercase tracking-tight">
                                    AI Assistant
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                        Online
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={clsx(
                                    "flex flex-col",
                                    msg.sender === 'user' ? "items-end" : "items-start"
                                )}
                            >
                                <div className={clsx(
                                    "max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed font-medium",
                                    msg.sender === 'user'
                                        ? "bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/20"
                                        : "bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm"
                                )}>
                                    {msg.text.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                                    ))}
                                </div>

                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {msg.actions.map((action, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleActionClick(action.url)}
                                                className="text-[10px] bg-white/5 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-white/10 hover:border-indigo-500 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {loading && (
                            <div className="flex items-start">
                                <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5">
                                    <div className="flex space-x-1.5 items-center h-4">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSend}
                        className="px-4 py-3 bg-white/5 border-t border-white/5 shrink-0"
                    >
                        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2.5 border border-white/5 focus-within:border-indigo-500/50 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="bg-transparent flex-1 text-sm text-white placeholder-slate-500 font-medium outline-none border-none focus:ring-0"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="text-indigo-500 hover:text-indigo-400 disabled:opacity-30 transition-all hover:scale-110 active:scale-90 shrink-0"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Launch Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "h-14 w-14 rounded-2xl shadow-2xl transition-all flex items-center justify-center relative overflow-hidden",
                    isOpen
                        ? "bg-slate-700 hover:bg-slate-600 shadow-slate-500/20"
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40 hover:scale-110"
                )}
            >
                {isOpen ? (
                    <X size={22} className="text-white relative z-10" />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                        <MessageSquare size={24} className="text-white relative z-10" />
                        {/* Unread dot */}
                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};

export default ChatbotPanel;
