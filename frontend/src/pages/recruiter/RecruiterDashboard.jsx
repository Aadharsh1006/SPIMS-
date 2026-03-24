// frontend/src/pages/recruiter/RecruiterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/api';
import {
    Briefcase, Zap, TrendingUp, MessageSquare,
    ArrowUpRight, ShieldCheck, PlusCircle, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import moment from 'moment';

const RecruiterDashboard = () => {
    const [stats, setStats] = useState({
        activeJobs: 0, totalCandidates: 0,
        shortlistedCount: 0, avgCTC: 0, highestCTC: 0
    });
    const [recentApplicants, setRecentApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const { data } = await dashboardApi.getRecruiterStats();
            setStats(data);
            setRecentApplicants(data.recentApplicants);
        } catch (error) {
            console.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-emerald-500/10 border-t-emerald-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-emerald-500 rounded-lg animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Talent Matrix...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-10 text-[var(--text-bright)] relative overflow-hidden shadow-[var(--shadow-xl)] group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-700">
                    <ShieldCheck size={200} />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-5 flex-1">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-300">
                                Corporate Engagement
                            </span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/20 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-[var(--text-bright)] uppercase italic">
                                Talent <span className="text-emerald-400">Gateway</span>
                            </h1>
                            <p className="text-[var(--text-muted)] text-sm md:text-base font-bold max-w-xl leading-relaxed italic opacity-80">
                                Identifying top-tier academic talent for your professional openings. Global matrix synchronized.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/recruiter/jobs/new"
                        className="p-8 bg-emerald-600 hover:bg-emerald-500 rounded-3xl border border-emerald-400/20 shadow-2xl shadow-emerald-600/30 transition-all flex flex-col items-center justify-center min-w-[200px] group/btn active:scale-95"
                    >
                        <PlusCircle size={32} className="text-white mb-3 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 italic text-center">Register Opportunity</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Live Opportunities', value: stats.activeJobs, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Avg Remuneration', value: `${stats.avgCTC || 0}L`, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/10' },
                    { label: 'Peak Compensation', value: `${stats.highestCTC || 0}L`, icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { label: 'Career Transitions', value: stats.shortlistedCount, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] flex flex-col gap-6 group hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-500 shadow-[var(--shadow-lg)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700 pointer-events-none" />
                        <div className="flex justify-between items-center relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-[var(--shadow-sm)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${stat.bg} ${stat.border} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <ArrowUpRight size={18} className="text-[var(--text-muted)] opacity-30 group-hover:text-emerald-400 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-[var(--text-bright)] tracking-tighter tabular-nums leading-none uppercase italic group-hover:translate-x-1 transition-transform duration-500">{stat.value}</h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-3 italic opacity-60">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Candidate Pipeline */}
                <div className="lg:col-span-2">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-10 shadow-[var(--shadow-xl)] relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-all">
                            <Filter size={150} className="text-emerald-500" />
                        </div>
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tight flex items-center gap-4 italic">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                        <Filter size={24} />
                                    </div>
                                    Candidate Pipeline
                                </h2>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 italic opacity-50">Real-time application telemetry</p>
                            </div>
                            <Link
                                to="/recruiter/applications"
                                className="px-6 py-2 bg-[var(--bg-main)] text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/20 hover:bg-emerald-500/10 transition-all flex items-center gap-2 italic"
                            >
                                Expansion View <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        
                        <div className="space-y-4">
                            {recentApplicants.length === 0 ? (
                                <div className="py-20 text-center opacity-40">
                                    <div className="w-16 h-16 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border-main)] flex items-center justify-center mx-auto mb-5 shadow-[var(--shadow-sm)]">
                                        <Briefcase size={24} className="text-[var(--text-muted)]" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">No active candidates detected</p>
                                </div>
                            ) : (
                                recentApplicants.map((app, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-[var(--bg-main)]/50 border border-[var(--border-main)] hover:border-emerald-500/30 rounded-[2rem] transition-all group/item shadow-[var(--shadow-sm)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-5 min-w-0">
                                            <div className="w-12 h-12 shrink-0 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl flex items-center justify-center text-emerald-400 group-hover/item:scale-110 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all font-black text-lg shadow-[var(--shadow-sm)] italic">
                                                {app.studentName?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-base font-black text-[var(--text-bright)] truncate uppercase tracking-tight italic group-hover/item:text-emerald-400 transition-colors">{app.studentName}</h4>
                                                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest truncate opacity-60 italic mt-1">{app.jobTitle} • {moment(app.appliedAt).fromNow()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-[var(--shadow-sm)] italic animate-pulse">
                                                Rank: {app.aiScores?.layer3RecruiterRank || app.aiScores?.layer1StudentMatch || 0}%
                                            </span>
                                            <Link to="/recruiter/applications" className="w-10 h-10 bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-emerald-400 rounded-xl border border-[var(--border-main)] hover:border-emerald-500/30 transition-all flex items-center justify-center shadow-[var(--shadow-sm)] active:scale-90">
                                                <ArrowUpRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Messages CTA */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-600/30 group relative overflow-hidden min-h-[320px] flex flex-col justify-end">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <MessageSquare size={160} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Stakeholder <br /> Dialogue</h3>
                                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-80 italic">Secure messaging channel active</p>
                            </div>
                            <Link
                                to="/recruiter/messages"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl hover:scale-105 active:scale-95 italic transition-all group/btn"
                            >
                                Initiate Comms <Zap size={14} className="fill-current group-hover:scale-125 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-10 shadow-[var(--shadow-xl)] relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] italic">Operational Tasks</h3>
                            <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <ShieldCheck size={14} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Link
                                to="/recruiter/requests"
                                className="flex items-center gap-5 p-6 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl hover:border-emerald-500/30 transition-all group/task shadow-[var(--shadow-sm)]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover/task:scale-110 transition-transform shadow-[var(--shadow-sm)]">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[var(--text-bright)] font-black uppercase tracking-tight italic group-hover/task:text-emerald-400 transition-colors">Access Credentials</p>
                                    <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1 opacity-60 italic">{stats.pendingApprovals || 0} Awaiting Verification</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
