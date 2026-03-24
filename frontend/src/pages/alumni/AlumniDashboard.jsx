// frontend/src/pages/alumni/AlumniDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, UserCircle, ExternalLink, ShieldCheck, Briefcase, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { messagingApi } from '../../api/api';
import clsx from 'clsx';

const AlumniDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ messages: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await messagingApi.getConversations();
                setStats({ messages: res.data.length || 0 });
            } catch (err) {
                console.error('Failed to fetch alumni stats', err);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    const isProfileComplete = user?.profile?.company && user?.profile?.position;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">

            {/* Hero Welcome */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-10 text-[var(--text-bright)] relative overflow-hidden shadow-[var(--shadow-xl)] group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 group-hover:text-cyan-500 transition-all duration-700">
                    <Sparkles size={220} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Elite Alumni Network
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">Connected</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-[var(--text-bright)] tracking-tighter leading-none uppercase italic mb-4">
                        Welcome Back, <span className="text-cyan-400">{user?.name}</span>
                    </h1>
                    <p className="text-[var(--text-muted)] font-bold max-w-xl text-sm md:text-base italic opacity-80 leading-relaxed">
                        Your insights and experience are the bridge between current students and their professional futures. 
                        Thank you for staying connected with our community.
                    </p>
                </div>
            </div>

            {/* Profile Completion Warning */}
            {!isProfileComplete && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-[var(--shadow-lg)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform">
                        <UserCircle size={100} />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 shadow-[var(--shadow-sm)] animate-pulse">
                            <UserCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[var(--text-bright)] uppercase tracking-tight italic">Finalize Your Matrix</h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60 italic whitespace-nowrap">Add your professional coordinates to enable mentorship discovery.</p>
                        </div>
                    </div>
                    <Link
                        to="/alumni/profile"
                        className="shrink-0 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20 active:scale-95 italic"
                    >
                        Update Credentials
                    </Link>
                </div>
            )}

            {/* Stats + Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Identity Card */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-lg)] hover:border-cyan-500/30 transition-all group relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:text-cyan-500 transition-all duration-700 pointer-events-none">
                        <Briefcase size={120} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6 italic opacity-50">Professional Identity</p>
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-cyan-400 border border-[var(--border-main)] shrink-0 shadow-[var(--shadow-md)] group-hover:rotate-6 transition-transform">
                                <Briefcase size={28} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[var(--text-bright)] font-black text-lg leading-tight truncate uppercase italic">
                                    {user?.profile?.position || 'Update Position'}
                                </h4>
                                <p className="text-cyan-400 font-black text-[10px] uppercase tracking-widest truncate mt-1 italic opacity-80">
                                    {user?.profile?.company || 'Update Company'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-[var(--border-main)] flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">
                        <span>Institution Vault</span>
                        <span className="flex items-center gap-2 text-emerald-400">
                            <ShieldCheck size={14} /> Verified Matrix
                        </span>
                    </div>
                </div>

                {/* Engagement Statistics */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-lg)] group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:text-amber-500 transition-all duration-700 pointer-events-none">
                        <TrendingUp size={100} />
                    </div>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-8 italic opacity-50">Impact Analytics</p>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between p-5 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl shadow-[var(--shadow-sm)] hover:border-cyan-500/20 transition-all group/stat">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                                    <MessageSquare size={16} />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Communication Hub</span>
                            </div>
                            <span className={clsx(
                                "text-2xl font-black text-[var(--text-bright)] italic tabular-nums",
                                loadingStats && "animate-pulse"
                            )}>
                                {loadingStats ? '—' : stats.messages}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-5 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl shadow-[var(--shadow-sm)] hover:border-amber-500/20 transition-all group/stat">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                                    <TrendingUp size={16} />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Network Exposure</span>
                            </div>
                            <span className="text-2xl font-black text-[var(--text-bright)] italic tabular-nums">14</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-lg)]">
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-8 italic opacity-50">Operational Matrix</p>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { to: '/alumni/messages', label: 'Message Vault', icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                            { to: '/alumni/network', label: 'Talent Directory', icon: ExternalLink, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                            { to: '/alumni/profile', label: 'Manage Profile', icon: UserCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                        ].map((action, i) => (
                            <Link
                                key={i}
                                to={action.to}
                                className="flex items-center justify-between p-4 bg-[var(--bg-main)]/50 hover:bg-cyan-500/5 rounded-2xl border border-[var(--border-main)] group transition-all shadow-[var(--shadow-sm)] hover:border-cyan-500/30 active:scale-95"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={clsx("p-2 rounded-xl transition-all group-hover:scale-110", action.bg, action.color)}>
                                        <action.icon size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-colors italic">{action.label}</span>
                                </div>
                                <ArrowUpRight size={14} className="text-[var(--text-muted)] opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniDashboard;
