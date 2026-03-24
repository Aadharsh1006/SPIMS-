// frontend/src/pages/student/StudentApplications.jsx
import React, { useState, useEffect } from 'react';
import { applicationApi } from '../../api/api';
import {
    Briefcase, Search, Download, CheckCircle2, AlertCircle,
    Clock, Target, Zap, TrendingUp, Rocket, Landmark,
    ShieldCheck, Sparkles, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import clsx from 'clsx';

const STATUS_STEPS = [
    { key: 'FACULTY_PENDING', label: 'Applied', icon: Clock },
    { key: 'FACULTY_APPROVED', label: 'Verified', icon: ShieldCheck },
    { key: 'RECRUITER_SHORTLISTED', label: 'Shortlisted', icon: Zap },
    { key: 'OFFERED', label: 'Offered', icon: Landmark },
    { key: 'PLACED', label: 'Hired', icon: Rocket }
];

const StudentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchApplications = async () => {
        try {
            const { data } = await applicationApi.getStudentApplications();
            setApplications(data);
        } catch (err) {
            console.error('Failed to fetch applications', err);
            toast.error('Failed to sync application data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleResponse = async (id, decision) => {
        try {
            await applicationApi.respondToOffer(id, decision);
            setApplications(prev => prev.map(a =>
                a._id === id ? { ...a, status: decision === 'accept' ? 'OFFER_ACCEPTED' : 'OFFER_REJECTED' } : a
            ));
            toast.success(decision === 'accept' ? 'Congratulations! Offer accepted.' : 'Offer declined.');
        } catch {
            toast.error('Failed to process response');
        }
    };

    const getStatusIndex = (currentStatus) => {
        if (currentStatus === 'OFFER_RELEASED' || currentStatus === 'OFFERED') return 3;
        if (currentStatus === 'OFFER_ACCEPTED' || currentStatus === 'HIRED' || currentStatus === 'PLACED') return 4;
        if (currentStatus === 'RECRUITER_REJECTED' || currentStatus === 'FACULTY_REJECTED') return -1;
        const idx = STATUS_STEPS.findIndex(step => step.key === currentStatus);
        return idx !== -1 ? idx : 0;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 border-4 border-[var(--accent)]/20 rounded-full" />
                <div className="absolute inset-0 border-t-4 border-[var(--accent)] rounded-full animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="relative space-y-8 pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] left-[5%] w-80 h-80 bg-blue-500/5 rounded-full blur-[80px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center bg-[var(--bg-card)]/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-lg)]">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-4 py-1.5 bg-[var(--bg-main)] text-[var(--text-bright)] text-[10px] font-black uppercase tracking-[0.3em] rounded-lg border border-[var(--border-main)] italic">Institutional Connectivity</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse delay-75" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--text-bright)] tracking-tighter italic flex items-center gap-4">
                        Career Transition <span className="text-[var(--accent)]">Ledger</span> <Target className="text-[var(--text-muted)]" size={32} />
                    </h1>
                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.4em] text-[10px]">Synchronizing Academic-to-Corporate Transition Data...</p>
                </div>
                <div className="mt-8 md:mt-0 flex gap-5">
                    <div className="bg-[var(--bg-main)] px-8 py-5 rounded-[2rem] border border-[var(--border-main)] flex flex-col items-center shadow-[var(--shadow-sm)]">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2">Applications</p>
                        <p className="text-4xl font-black text-[var(--text-bright)] tracking-tighter italic">{applications.length}</p>
                    </div>
                    <div className="bg-[var(--bg-main)] px-8 py-5 rounded-[2rem] border border-[var(--border-main)] flex flex-col items-center shadow-[var(--shadow-sm)]">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2">Offer Rate</p>
                        <p className="text-4xl font-black text-emerald-400 tracking-tighter italic">
                            {applications.length > 0
                                ? Math.round((applications.filter(a => ['OFFERED', 'HIRED', 'OFFER_ACCEPTED', 'PLACED'].includes(a.status)).length / applications.length) * 100)
                                : 0}%
                        </p>
                    </div>
                </div>
            </header>

            {/* Application Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-[var(--bg-main)]/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 md:p-6 animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] w-full max-w-2xl rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-lg)] overflow-hidden animate-in zoom-in-95 duration-500">

                        {/* Modal Header */}
                        <div className="p-8 bg-[var(--bg-card)] text-[var(--text-bright)] relative h-44 flex flex-col justify-end border-b border-[var(--border-main)]">
                            <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 pointer-events-none">
                                <Rocket size={100} className="text-[var(--accent)]" />
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-bright)] p-2 bg-[var(--bg-main)]/50 rounded-xl transition-all border border-[var(--border-main)]/50 hover:rotate-90">
                                <X size={20} />
                            </button>
                            <div className="relative z-10 space-y-1">
                                <span className="px-2.5 py-1 bg-[var(--accent)]/20 border border-[var(--accent)]/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">Application Details</span>
                                <h1 className="text-3xl font-black text-[var(--text-bright)] tracking-tight leading-none uppercase mt-2">Application Status</h1>
                                <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-[0.2em]">{selectedApp.jobId?.company}</p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">

                            {/* AI Scores */}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="p-7 bg-[var(--bg-main)] rounded-[1.75rem] border border-[var(--border-main)] text-center shadow-[var(--shadow-sm)]">
                                    <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <TrendingUp className="text-[var(--accent)]" size={20} />
                                    </div>
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Career Alignment</p>
                                    <p className="text-4xl font-black text-[var(--accent)] tracking-tighter tabular-nums">{selectedApp.aiScores?.layer1StudentMatch || 0}%</p>
                                </div>
                                <div className="p-7 bg-[var(--bg-main)] rounded-[1.75rem] border border-[var(--border-main)] text-center shadow-[var(--shadow-sm)]">
                                    <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Zap className="text-[var(--text-bright)]" size={20} />
                                    </div>
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Resume Score</p>
                                    <p className="text-4xl font-black text-[var(--text-bright)] tracking-tighter tabular-nums">{selectedApp.studentAtsScore || 0}%</p>
                                </div>
                            </div>

                            {/* Why Selected */}
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] flex items-center gap-3">
                                    <div className="h-px w-6 bg-[var(--border-main)]" /> Why you were selected <div className="h-px w-6 bg-[var(--border-main)]" />
                                </h4>
                                <div className="p-7 bg-[var(--accent)]/5 rounded-[1.75rem] border border-[var(--accent)]/20 relative overflow-hidden shadow-[var(--shadow-sm)]">
                                    <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
                                        <Sparkles size={60} className="text-[var(--accent)]" />
                                    </div>
                                    <p className="text-sm text-[var(--text-main)] leading-relaxed font-medium italic relative z-10">
                                        "{selectedApp.aiScores?.aiExplanation || "Our AI is currently analyzing your profile against this role. Complete your profile for better insights."}"
                                    </p>
                                </div>
                            </section>

                            {/* Application History */}
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] flex items-center gap-3">
                                    <div className="h-px w-6 bg-[var(--border-main)]" /> Application History <div className="h-px w-6 bg-[var(--border-main)]" />
                                </h4>
                                <div className="space-y-8 border-l border-[var(--border-main)] ml-3 pl-8 relative">
                                    {selectedApp.history?.slice().reverse().map((event, idx) => (
                                        <div key={idx} className="relative group/log">
                                            <div className="absolute -left-[37px] top-1 w-2 h-2 bg-[var(--bg-card)] border-2 border-[var(--accent)] rounded-full z-10 group-hover/log:scale-150 transition-all shadow-[var(--shadow-lg)]" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-[var(--text-bright)] uppercase tracking-tight">{event.action?.replace(/_/g, ' ')}</p>
                                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em]">
                                                    {moment(event.timestamp).format('MMM DD, YYYY • HH:mm')}
                                                </p>
                                            </div>
                                            {event.notes && (
                                                <div className="mt-3 p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-main)] border-l-2 border-l-[var(--accent)] shadow-[var(--shadow-sm)]">
                                                    <p className="text-xs text-[var(--text-muted)] font-medium italic leading-relaxed">"{event.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!selectedApp.history || selectedApp.history.length === 0) && (
                                        <p className="text-xs text-[var(--text-muted)] font-medium italic">No events found.</p>
                                    )}
                                </div>
                            </section>

                            <button
                                onClick={() => setSelectedApp(null)}
                                className="w-full py-4 bg-[var(--bg-main)] hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-[var(--border-main)] active:scale-95 shadow-[var(--shadow-sm)]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {applications.length === 0 ? (
                <div className="relative z-10 bg-[var(--bg-card)]/80 backdrop-blur-md p-24 text-center rounded-[3rem] border border-[var(--border-main)] animate-in fade-in zoom-in-95 duration-700 shadow-[var(--shadow-lg)]">
                    <div className="w-28 h-28 bg-[var(--bg-main)] rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                        <Briefcase size={48} className="text-[var(--text-muted)] opacity-50" />
                    </div>
                    <h2 className="text-3xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic mb-3">No applications yet</h2>
                    <p className="text-[var(--text-muted)] font-black text-[11px] uppercase tracking-[0.5em] italic mb-10">You haven't applied to any jobs yet.</p>
                    <button
                        onClick={() => window.location.href = '/student/jobs'}
                        className="px-12 py-4 bg-[var(--accent)] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-[var(--shadow-lg)] shadow-[var(--accent)]/20"
                    >
                        Find Jobs
                    </button>
                </div>
            ) : (
                <div className="relative z-10 grid gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
                    {applications.map((app, idx) => {
                        const statusIdx = getStatusIndex(app.status);
                        const isRejected = app.status?.includes('REJECTED');

                        return (
                            <div
                                key={app._id}
                                className="bg-[var(--bg-card)]/80 backdrop-blur-md p-10 rounded-[3rem] border border-[var(--border-main)] hover:border-[var(--accent)]/30 transition-all duration-700 group relative overflow-hidden flex flex-col gap-10 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-[var(--accent)]/10 transition-all duration-1000" />

                                {/* Job Info Row */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="shrink-0 w-20 h-20 rounded-[2rem] bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-bright)] font-black text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-[var(--shadow-sm)]">
                                            {app.jobId?.company?.charAt(0)}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-2xl font-black text-[var(--text-bright)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-tighter italic leading-none">{app.jobId?.title || 'Job Title'}</h3>
                                                {app.status === 'OFFERED' && (
                                                    <div className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase tracking-[0.3em] animate-bounce shadow-lg shadow-emerald-500/20">Active Offer</div>
                                                )}
                                            </div>
                                            <p className="text-[var(--text-muted)] font-bold text-[11px] uppercase tracking-[0.4em] flex items-center gap-2 italic">
                                                <Landmark size={14} className="text-[var(--accent)]" /> {app.jobId?.company || 'Company'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-5">
                                        <div className="bg-[var(--bg-main)] border border-[var(--border-main)] px-6 py-4 rounded-[1.5rem] flex flex-col items-end shadow-[var(--shadow-sm)]">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-1">Applied On</p>
                                            <p className="text-sm font-black text-[var(--text-main)] uppercase italic tabular-nums">{moment(app.createdAt).format('DD MMM YY')}</p>
                                        </div>
                                        <div className="bg-[var(--accent)] px-6 py-4 rounded-[1.5rem] flex flex-col items-center shadow-[var(--shadow-md)]">
                                            <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-1">AI Match</p>
                                            <p className="text-2xl font-black text-white italic tabular-nums">{app.aiScores?.layer1StudentMatch || 0}%</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedApp(app)}
                                            className="w-14 h-14 bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-muted)] rounded-[1.5rem] flex items-center justify-center hover:bg-[var(--bg-secondary)] hover:text-[var(--text-bright)] hover:scale-110 hover:-rotate-6 transition-all shadow-[var(--shadow-sm)] active:scale-90"
                                        >
                                            <Search size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Tracker */}
                                <div className="relative z-10 pt-2 pb-1">
                                    <div className="flex justify-between items-center relative gap-3">
                                        {/* Connector */}
                                        <div className="absolute left-[5%] right-[5%] top-7 h-1 bg-[var(--bg-main)] rounded-full z-0 overflow-hidden">
                                            <div
                                                className={clsx(
                                                    "h-full transition-all duration-1000 ease-out",
                                                    isRejected ? "bg-red-500/30" : "bg-[var(--accent)]"
                                                )}
                                                style={{ width: isRejected ? '100%' : `${(statusIdx / (STATUS_STEPS.length - 1)) * 90 + 5}%` }}
                                            />
                                        </div>

                                        {STATUS_STEPS.map((step, i) => {
                                            const isActive = i <= statusIdx && !isRejected;
                                            const isCurrent = i === statusIdx && !isRejected;
                                            const StepIcon = step.icon;

                                            return (
                                                <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                                                    <div className={clsx(
                                                        "w-14 h-14 rounded-[1.75rem] border-4 border-[var(--bg-card)] flex items-center justify-center transition-all duration-700",
                                                        isActive ? "bg-[var(--bg-secondary)] text-[var(--text-bright)]" : "bg-[var(--bg-main)] text-[var(--text-muted)]",
                                                        isCurrent && "bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20 animate-pulse"
                                                    )}>
                                                        <StepIcon size={20} className={clsx(isCurrent && "animate-bounce")} />
                                                    </div>
                                                    <span className={clsx(
                                                        "text-[10px] font-black uppercase tracking-[0.2em] italic",
                                                        isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)]",
                                                        isCurrent && "text-[var(--accent)]"
                                                    )}>{step.label}</span>
                                                </div>
                                            );
                                        })}

                                        {isRejected && (
                                            <div className="absolute inset-0 bg-[var(--bg-card)]/70 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-20">
                                                <div className="bg-red-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-2xl">
                                                    <AlertCircle size={18} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Rejected: {app.status?.replace(/_/g, ' ')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Offer Hub */}
                                {(app.status === 'OFFERED' || app.status === 'OFFER_RELEASED' || app.status === 'OFFER_ACCEPTED') && (
                                    <div className="relative z-10 bg-emerald-500/10 rounded-[2rem] p-7 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shadow-[var(--shadow-sm)]">
                                                <Landmark size={28} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-lg font-black text-[var(--text-bright)] uppercase tracking-tight">Offer Details</h4>
                                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded uppercase tracking-widest shadow-[var(--shadow-sm)]">Active</span>
                                                </div>
                                                <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest italic">Review and respond to your offer</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 flex-wrap">
                                            {app.offerLetterUrl && (
                                                <a
                                                    href={app.offerLetterUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-5 py-2.5 bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-main)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] hover:text-[var(--text-bright)] transition-all flex items-center gap-2 shadow-[var(--shadow-sm)]"
                                                >
                                                    <Download size={14} /> View Contract
                                                </a>
                                            )}
                                            {app.status === 'OFFERED' && (
                                                <>
                                                    <button
                                                        onClick={() => handleResponse(app._id, 'accept')}
                                                        className="px-7 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                                    >
                                                        Accept Offer
                                                    </button>
                                                    <button
                                                        onClick={() => handleResponse(app._id, 'reject')}
                                                        className="px-7 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'OFFER_ACCEPTED' && (
                                                <div className="px-7 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <CheckCircle2 size={16} /> Hired!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentApplications;
