// frontend/src/pages/faculty/FacultyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/api';
import {
    Users, ClipboardList, MessageSquare,
    TrendingUp, CheckCircle, Zap,
    Clock, ArrowUpRight,
    Activity, Shield, Award, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Radar, Doughnut } from 'react-chartjs-2';
import clsx from 'clsx';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement
);

const FacultyDashboard = () => {
    const [stats, setStats] = useState({
        assignedStudents: 0,
        pendingApprovals: 0,
        completedReviews: 0,
        totalEndorsements: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await dashboardApi.getFacultyStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load faculty stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading || !stats) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-indigo-500 rounded-lg animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Faculty Matrix...</p>
        </div>
    );

    const radarData = {
        labels: ['Technical Alignment', 'Profile Index', 'Academic Assessment'],
        datasets: [{
            label: 'Cohort Average (%)',
            data: [
                stats.cohortRadar?.systemMatch || 0,
                stats.cohortRadar?.atsScore || 0,
                stats.cohortRadar?.facultyQual || 0
            ],
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderColor: '#6366f1',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
        }]
    };

    const doughnutData = {
        labels: ['Verified', 'Revision Required', 'Pending'],
        datasets: [{
            data: [
                stats.endorsementRates?.[1]?.count || 0,
                stats.endorsementRates?.[2]?.count || 0,
                stats.endorsementRates?.[0]?.count || 0,
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#6366f1'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: { color: '#94a3b8', font: { size: 10, weight: '700' } }
            }
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-10 text-[var(--text-bright)] relative overflow-hidden shadow-[var(--shadow-xl)] group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-700">
                    <Shield size={200} />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-5 flex-1">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300">
                                Faculty Dashboard
                            </span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/20 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-[var(--text-bright)] uppercase italic">
                                Academic <span className="text-indigo-400">Portal</span>
                            </h1>
                            <p className="text-[var(--text-muted)] text-sm md:text-base font-bold max-w-xl leading-relaxed italic opacity-80">
                                Overseeing Student Application Lifecycle. Concurrent tasks:
                                <span className={clsx(
                                    "inline-block font-black uppercase px-4 py-1.5 rounded-2xl ml-3 text-[10px] shadow-xl tracking-widest transition-all italic border",
                                    stats.pendingApprovals > 10 ? "bg-red-500 text-white border-red-400/20" :
                                        stats.pendingApprovals > 0 ? "bg-amber-500 text-white border-amber-400/20" : "bg-emerald-500 text-white border-emerald-400/20"
                                )}>
                                    {stats.pendingApprovals} Pending Approvals
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 shrink-0">
                        <Link
                            to="/faculty/approvals"
                            className="p-8 bg-indigo-600 hover:bg-indigo-500 rounded-3xl border border-indigo-400/20 shadow-2xl shadow-indigo-600/30 transition-all flex flex-col items-center justify-center min-w-[160px] group/btn active:scale-95"
                        >
                            <CheckCircle size={32} className="text-white mb-3 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 italic">Validate Batch</span>
                        </Link>
                        <Link
                            to="/faculty/messages"
                            className="p-8 bg-[var(--bg-main)]/50 hover:bg-[var(--bg-main)] rounded-3xl border border-[var(--border-main)] shadow-xl transition-all flex flex-col items-center justify-center min-w-[160px] group/btn active:scale-95"
                        >
                            <MessageSquare size={32} className="text-indigo-400 mb-3 group-hover/btn:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">Conversations</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                { [
                    { label: 'Enrolled Pool', value: stats.assignedStudents, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                    { label: 'Awaiting Verification', value: stats.pendingApprovals, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { label: 'Interview Progress', value: stats.completedReviews, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                    { label: 'Placement Success', value: stats.totalEndorsements, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] flex flex-col gap-6 group hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-500 shadow-[var(--shadow-lg)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-700 pointer-events-none" />
                        <div className="flex justify-between items-center relative z-10">
                            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-[var(--shadow-sm)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500", stat.bg, stat.border)}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                            <ArrowUpRight size={18} className="text-[var(--text-muted)] opacity-30 group-hover:text-indigo-400 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-[var(--text-bright)] tracking-tighter tabular-nums leading-none uppercase italic group-hover:translate-x-1 transition-transform duration-500">{stat.value}</h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-3 italic opacity-60">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Analytics Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Charts Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] h-[360px] flex flex-col shadow-[var(--shadow-lg)] group/chart">
                        <h3 className="text-[10px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover/chart:rotate-12 transition-transform">
                                <Activity size={14} />
                            </div>
                            Cohort Competency Mapping
                        </h3>
                        <div className="flex-1 min-h-0 relative">
                            <Radar
                                data={radarData}
                                options={{
                                    ...commonOptions,
                                    scales: {
                                        r: {
                                            ticks: { display: false, backdropColor: 'transparent' },
                                            grid: { color: 'rgba(255,255,255,0.05)' },
                                            pointLabels: {
                                                color: '#64748b',
                                                font: { size: 9, weight: '700' }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] h-[360px] flex flex-col shadow-[var(--shadow-lg)] group/chart">
                        <h3 className="text-[10px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover/chart:rotate-12 transition-transform">
                                <CheckCircle size={14} />
                            </div>
                            Endorsement Distribution
                        </h3>
                        <div className="flex-1 min-h-0 relative">
                            <Doughnut data={doughnutData} options={{ ...commonOptions, cutout: '70%' }} />
                        </div>
                        <div className="mt-5 text-center">
                            <p className="text-3xl font-black text-[var(--text-bright)] italic tracking-tighter uppercase">{stats.endorsementRates?.[1]?.count || 0}</p>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1 italic opacity-60">Verified Credentials</p>
                        </div>
                    </div>
                </div>

                {/* Live Stream Column */}
                <div className="lg:col-span-2">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-10 rounded-[3rem] flex flex-col shadow-[var(--shadow-lg)] relative overflow-hidden" style={{ height: '744px' }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                        <div className="flex items-center justify-between mb-10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tighter flex items-center gap-4 italic">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 animate-pulse">
                                        <Zap size={24} />
                                    </div>
                                    Live Placement Stream
                                </h2>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 italic opacity-50">Real-time candidate transition telemetry</p>
                            </div>
                            <div className="bg-[var(--bg-main)] text-indigo-400 text-[9px] font-black px-4 py-2 rounded-2xl uppercase tracking-[0.2em] border border-indigo-500/20 shadow-[var(--shadow-sm)] italic animate-pulse">
                                Live Matrix Active
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 space-y-6 relative group/timeline" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f133 transparent' }}>
                            {/* Timeline line */}
                            <div className="absolute left-7 top-0 bottom-0 w-px bg-[var(--border-main)] pointer-events-none group-hover/timeline:bg-indigo-500/20 transition-colors duration-700" />

                            {stats.timeline && stats.timeline.length > 0 ? (
                                stats.timeline.map((event, i) => {
                                    const statusConfigs = {
                                        'Application Submitted': { icon: ClipboardList, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' },
                                        'Approved by You': { icon: CheckCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                                        'Shortlisted for Interview': { icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                                        'Offer Letter Released': { icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                                        'Offer Accepted - Hired!': { icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                                        'Updates Requested by You': { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
                                    };
                                    const config = statusConfigs[event.event] || { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' };
                                    const StatusIcon = config.icon;

                                    return (
                                        <div key={i} className="relative flex items-start gap-6 group hover:translate-x-2 transition-all duration-300">
                                            <div className={clsx(
                                                "relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 shadow-[var(--shadow-md)]",
                                                config.bg, config.border, config.color
                                            )}>
                                                <StatusIcon size={20} />
                                            </div>

                                            <div className="flex-1 bg-[var(--bg-main)]/50 hover:bg-[var(--bg-main)] p-6 rounded-3xl border border-[var(--border-main)] hover:border-indigo-500/30 transition-all duration-500 shadow-[var(--shadow-sm)] group/item">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-black text-[var(--text-bright)] text-sm uppercase tracking-tight italic group-hover/item:text-indigo-400 transition-colors">{event.studentName}</h4>
                                                    <span className={clsx("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border shadow-sm italic transition-all", config.bg, config.border, config.color)}>
                                                        {event.event === 'Approved by You' ? 'Academic Validation' : event.event}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] italic opacity-60">
                                                    <div className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                                                        <ArrowUpRight size={14} className="text-indigo-400" />
                                                        <span>{event.company}</span>
                                                    </div>
                                                    <span className="text-[var(--border-main)]">•</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} />
                                                        <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-5 opacity-40 select-none">
                                    <div className="w-20 h-20 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                        <Activity size={32} className="text-[var(--text-muted)]" />
                                    </div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">No active placement telemetry detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
