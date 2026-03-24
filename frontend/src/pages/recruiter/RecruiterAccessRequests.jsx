// frontend/src/pages/recruiter/RecruiterAccessRequests.jsx
import React, { useState, useEffect } from 'react';
import { recruiterApi } from '../../api/api';
import { Building2, CheckCircle2, Clock, ShieldCheck, Briefcase, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RecruiterAccessRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    const fetchRequests = async () => {
        try {
            const { data } = await recruiterApi.getAccessRequests();
            setRequests(data);
        } catch {
            toast.error('Failed to load access requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleApprove = async (jobId, collegeId) => {
        setProcessing(`${jobId}-${collegeId}`);
        try {
            await recruiterApi.approveAccess(jobId, collegeId);
            toast.success('Institutional access granted');
            setRequests(prev =>
                prev.map(job => {
                    if (job.jobId === jobId) {
                        return { ...job, requests: job.requests.filter(r => r.collegeId !== collegeId) };
                    }
                    return job;
                }).filter(job => job.requests.length > 0)
            );
        } catch {
            toast.error('Failed to grant access');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-amber-500/10 border-t-amber-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                    <ShieldCheck size={24} className="animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] animate-pulse italic">Scanning Authorization Requests...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Hub */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-8 md:p-10 shadow-[var(--shadow-xl)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                    <ShieldCheck size={180} className="text-amber-500" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-[var(--shadow-sm)]">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">
                                    Access <span className="text-amber-400">Control Matrix</span>
                                </h1>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-1 italic opacity-60">Authentication & Permissions Layer</p>
                            </div>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm font-bold italic max-w-xl leading-relaxed">
                            Managing and auditing institutional requests for <span className="text-amber-400">{requests.length} Critical Roles</span> within the talent grid.
                        </p>
                    </div>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-24 text-center shadow-[var(--shadow-xl)] relative overflow-hidden group/empty transition-all hover:border-amber-500/20">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 to-amber-500/5 opacity-0 group-hover/empty:opacity-100 transition-opacity" />
                    <div className="flex flex-col items-center opacity-30 relative z-10">
                        <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2.5rem] border border-[var(--border-main)] flex items-center justify-center mb-8 shadow-[var(--shadow-lg)] group-hover/empty:scale-110 transition-transform">
                            <ShieldCheck size={40} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-lg text-[var(--text-bright)] font-black uppercase tracking-[0.4em] italic leading-none">Security Loop Closed</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-3 italic">No institutional access requests requiring recruiter intervention</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {requests.map(job => (
                        <div key={job.jobId} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] overflow-hidden shadow-[var(--shadow-xl)] transition-all duration-500 group/card hover:border-amber-500/30 flex flex-col hover:-translate-y-1 relative">
                            {/* Decorative Blur */}
                            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover/card:bg-amber-500/10 transition-all duration-700 pointer-events-none" />

                            {/* Job Header */}
                            <div className="bg-[var(--bg-main)]/50 p-8 border-b border-[var(--border-main)] relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl flex items-center justify-center text-amber-500 group-hover/card:scale-110 group-hover/card:bg-amber-500 group-hover/card:text-white transition-all font-black text-xl shadow-[var(--shadow-md)] shrink-0 italic">
                                        {job.title?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tight truncate italic group-hover/card:text-amber-400 transition-colors">{job.title}</h3>
                                        <p className="text-[10px] text-amber-400 font-black uppercase tracking-[0.2em] mt-1 italic opacity-60 flex items-center gap-2">
                                            <Briefcase size={12} /> {job.company}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Requests List */}
                            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[350px] relative z-10 scrollbar-thin scrollbar-thumb-[var(--border-main)] scrollbar-track-transparent">
                                {job.requests.map(req => (
                                    <div
                                        key={req.collegeId}
                                        className="bg-[var(--bg-main)] border border-[var(--border-main)] p-5 rounded-[1.5rem] flex items-center justify-between gap-6 group/req hover:border-amber-500/20 transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover/req:text-amber-400 group-hover/req:scale-110 transition-all shrink-0">
                                                <Building2 size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-[var(--text-bright)] uppercase tracking-tight truncate italic">{req.collegeId}</p>
                                                <div className="flex items-center gap-1.5 mt-1 text-[8px] font-black uppercase tracking-widest text-amber-500 italic opacity-60">
                                                    <Clock size={10} /> Pending Directive
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleApprove(job.jobId, req.collegeId)}
                                            disabled={processing === `${job.jobId}-${req.collegeId}`}
                                            className="shrink-0 px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 border border-amber-400/20 italic group-hover/req:scale-105"
                                        >
                                            <Zap size={14} className={processing === `${job.jobId}-${req.collegeId}` ? "animate-spin" : "fill-current group-hover/req:animate-pulse"} />
                                            {processing === `${job.jobId}-${req.collegeId}` ? 'Injecting...' : 'Grant Access'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecruiterAccessRequests;
