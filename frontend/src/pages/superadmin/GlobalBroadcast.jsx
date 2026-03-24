// frontend/src/pages/superadmin/GlobalBroadcast.jsx
import React, { useState } from 'react';
import { adminApi } from '../../api/api';
import { Megaphone, Send, Target, ShieldAlert, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GlobalBroadcast = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        targetAudience: 'All'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            return toast.error('Please fill in all required fields');
        }
        setLoading(true);
        try {
            await adminApi.sendBroadcast(formData);
            toast.success('Global broadcast dispatched successfully!');
            setFormData({ title: '', message: '', targetAudience: 'All' });
        } catch (error) {
            toast.error('Failed to send broadcast');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic">
                        Global <span className="text-violet-400">Broadcast</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                        Matrix-wide synchronization protocol.
                    </p>
                </div>
                <div className="w-16 h-16 bg-violet-500/10 rounded-[2rem] flex items-center justify-center text-violet-400 border border-violet-500/20 shadow-[var(--shadow-md)]">
                    <Megaphone size={32} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-10 space-y-8 relative overflow-hidden group shadow-[var(--shadow-lg)]">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                            <Send size={100} />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic opacity-50">
                                Broadcast Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="E.g., System Maintenance Update"
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl px-6 py-4 text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-violet-500 outline-none transition-all font-black uppercase tracking-tight italic shadow-[var(--shadow-sm)]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic opacity-50">
                                    Target Audience
                                </label>
                                <div className="relative">
                                    <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-500" size={16} />
                                    <select
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl pl-16 pr-8 py-4 text-[var(--text-bright)] focus:ring-2 focus:ring-violet-500 outline-none appearance-none transition-all font-black uppercase tracking-tight italic shadow-[var(--shadow-sm)]"
                                    >
                                        <option value="All">Global Nodes (All)</option>
                                        <option value="STUDENT">Student Persona Matrix</option>
                                        <option value="FACULTY">Faculty Expert Matrix</option>
                                        <option value="RECRUITER">Recruiter Partner Matrix</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-end italic text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest px-2 pb-4 opacity-50 leading-relaxed">
                                * DISPATCHED PAYLOAD WILL BE VISIBLE TO THE TARGET MATRIX UPON NEXT REFRESH.
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2 italic opacity-50">
                                Message Payload
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter the detailed announcement here..."
                                rows={6}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[2rem] px-8 py-6 text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-violet-500 outline-none transition-all font-bold italic resize-none shadow-[var(--shadow-sm)]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-2xl py-5 text-xs font-black uppercase tracking-[0.3em] transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-4 active:scale-[0.98] italic"
                        >
                            {loading ? 'Transmitting Data...' : (
                                <> DISPATCH GLOBAL BROADCAST <Send size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] p-8 space-y-6 shadow-[var(--shadow-md)]">
                        <div className="flex items-center gap-3 text-violet-400">
                            <ShieldAlert size={20} />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] italic">Broadcast Protocols</h3>
                        </div>
                        <ul className="space-y-5">
                            {[
                                'Global messages bypass college-level filters.',
                                'Use for system-wide alerts & major updates.',
                                'Keep messages concise for banner visibility.',
                                'Audience filtering applies to role types only.'
                            ].map((text, i) => (
                                <li key={i} className="flex gap-4 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight leading-relaxed opacity-70">
                                    <CheckCircle size={15} className="text-violet-500/30 shrink-0 mt-0.5" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-violet-600/5 border border-violet-500/10 rounded-[2.5rem] p-8 text-center space-y-4 shadow-[var(--shadow-sm)]">
                        <p className="text-[9px] font-black text-violet-400 uppercase tracking-[0.3em] italic">Active Matrix Status</p>
                        <div className="flex items-center justify-center gap-3 text-[var(--text-bright)]">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-sm font-black uppercase tracking-tighter italic">Nodes Operational</span>
                        </div>
                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-40 italic leading-relaxed">
                            Payload synchronization will occur on next stakeholder refresh cycle.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalBroadcast;
