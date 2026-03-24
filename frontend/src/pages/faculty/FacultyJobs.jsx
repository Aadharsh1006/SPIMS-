// frontend/src/pages/faculty/FacultyJobs.jsx
import React, { useState, useEffect } from 'react';
import { tpoApi, applicationApi } from '../../api/api';
import {
    Briefcase, Building2, MapPin, Calendar,
    ArrowUpRight, Search, Zap, X, CheckCircle, Clock,
    TrendingUp, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const FacultyJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchJobs = async () => {
        try {
            const { data } = await tpoApi.getJobs();
            setJobs(data);
        } catch (error) {
            console.error('Failed to load institutional jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleViewDetails = async (job) => {
        setSelectedJob(job);
        setLoadingApplicants(true);
        try {
            const { data } = await applicationApi.getJobApplicants(job._id);
            setApplicants(data);
        } catch (error) {
            toast.error('Failed to fetch applicants');
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleEndorse = async (appId) => {
        setActionLoading(appId);
        try {
            await applicationApi.facultyApprove(appId, 'approve');
            toast.success('Candidate endorsed successfully');
            setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: 'FACULTY_APPROVED' } : a));
        } catch (error) {
            toast.error('Endorsement failed');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={24} className="text-indigo-500 animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Institutional Matrix...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] shadow-[var(--shadow-lg)]">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">
                        Job <span className="text-indigo-400">Tracking</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60 italic">Analyzing industry mandates and monitoring institutional alignment.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        type="text"
                        placeholder="Search mandates or corporate entities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm font-medium shadow-[var(--shadow-sm)]"
                    />
                </div>
            </div>

            {/* Job Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <div key={job._id} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-8 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col justify-between shadow-[var(--shadow-lg)] group/card">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-700 pointer-events-none">
                            <Briefcase size={120} />
                        </div>

                        <div>
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 bg-[var(--bg-main)] rounded-[1.5rem] flex items-center justify-center text-indigo-400 border border-[var(--border-main)] shadow-[var(--shadow-md)] group-hover:scale-110 group-hover:rotate-6 transition-all shrink-0">
                                    <Building2 size={28} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-lg font-black text-[var(--text-bright)] uppercase tracking-tight truncate italic">{job.title}</h3>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate italic opacity-80">{job.company}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest italic opacity-70">
                                    <MapPin size={14} className="text-indigo-400 shrink-0" />
                                    <span className="truncate">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest italic opacity-70">
                                    <Calendar size={14} className="text-indigo-400 shrink-0" />
                                    <span>{job.type?.replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap pt-2">
                                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest shadow-[var(--shadow-sm)] italic">
                                        {job.status || 'Active'}
                                    </span>
                                    {job.isGlobal && (
                                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] font-black text-amber-400 uppercase tracking-widest shadow-[var(--shadow-sm)] italic">
                                            Global Reach
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleViewDetails(job)}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3 italic group/btn"
                        >
                            View Alignment Matrix
                            <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-24 text-center shadow-[var(--shadow-xl)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 group-hover:text-amber-500 transition-all duration-700">
                        <Zap size={150} />
                    </div>
                    <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-500/20 shadow-[var(--shadow-md)] group-hover:rotate-12 transition-transform">
                        <Zap size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">No Mandates Detected</h3>
                    <p className="text-[var(--text-muted)] mt-2 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto opacity-60 italic">No active job postings are currently available for institutional assessment.</p>
                </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-main)]/80 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] shadow-[var(--shadow-2xl)] overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

                        {/* Modal Header */}
                        <div className="p-8 border-b border-[var(--border-main)] flex justify-between items-start shrink-0 relative z-10">
                            <div className="flex gap-6 items-center">
                                <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2rem] flex items-center justify-center text-indigo-400 border border-[var(--border-main)] shrink-0 shadow-[var(--shadow-md)] italic font-black text-2xl group-hover:scale-105 transition-transform">
                                    <Building2 size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic">{selectedJob.title}</h2>
                                    <div className="flex items-center gap-4 mt-2 flex-wrap text-[10px] font-black uppercase tracking-[0.1em] opacity-80">
                                        <span className="text-indigo-400">{selectedJob.company}</span>
                                        <span className="text-[var(--border-main)]">•</span>
                                        <span className="text-[var(--text-muted)] italic">{selectedJob.location}</span>
                                        <span className="text-[var(--border-main)]">•</span>
                                        <span className="text-amber-400 italic">{selectedJob.type?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="w-12 h-12 bg-[var(--bg-main)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-bright)] rounded-2xl flex items-center justify-center transition-all border border-[var(--border-main)] shadow-[var(--shadow-sm)] active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Applicants List */}
                        <div className="flex-1 overflow-y-auto p-8 relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f133 transparent' }}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">
                                    Institutional <span className="text-indigo-400">Alignment Matrix</span>
                                </h3>
                                <div className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-indigo-500/20 shadow-[var(--shadow-sm)] italic">
                                    {applicants.length} Target Pool Candidates
                                </div>
                            </div>

                            {loadingApplicants ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-6">
                                    <div className="w-16 h-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Scanning Cohort Intelligence...</p>
                                </div>
                            ) : applicants.length === 0 ? (
                                <div className="py-24 text-center bg-[var(--bg-main)]/50 border border-dashed border-[var(--border-main)] rounded-[2.5rem] shadow-[var(--shadow-inner)]">
                                    <Zap size={40} className="mx-auto text-[var(--text-muted)] mb-4 opacity-30" />
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60 italic">No candidates from your institution match this mandate yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {applicants.map(app => (
                                        <div key={app._id} className="bg-[var(--bg-main)]/50 border border-[var(--border-main)] p-6 rounded-[2rem] flex items-center justify-between gap-6 hover:border-indigo-500/30 transition-all group/item shadow-[var(--shadow-sm)]">
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className="w-14 h-14 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] font-black text-xl group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all shrink-0 border border-[var(--border-main)] shadow-[var(--shadow-sm)] italic">
                                                    {app.studentId?.name?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-[var(--text-bright)] uppercase tracking-tight text-lg truncate italic group-hover/item:text-indigo-400 transition-colors">{app.studentId?.name}</h4>
                                                    <div className="flex items-center gap-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-70 italic">
                                                        <span className={clsx(
                                                            "px-2 py-0.5 rounded-lg border",
                                                            app.status === 'FACULTY_PENDING' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' : 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
                                                        )}>
                                                            {app.status.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-[var(--border-main)]">•</span>
                                                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-400" /> {new Date(app.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 shrink-0">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1 italic opacity-50">Precision Fit</div>
                                                    <div className="text-2xl font-black text-emerald-400 italic tabular-nums">{app.aiScores?.layer1StudentMatch || 0}%</div>
                                                </div>

                                                {app.status === 'FACULTY_PENDING' ? (
                                                    <button
                                                        onClick={() => handleEndorse(app._id)}
                                                        disabled={actionLoading === appId}
                                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2 group/btn active:scale-95 italic"
                                                    >
                                                        {actionLoading === app._id ? (
                                                            <div className="w-4 h-4 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                Endorse <TrendingUp size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-[var(--shadow-sm)]" title="Endorsed">
                                                        <CheckCircle size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-[var(--border-main)] bg-[var(--bg-main)]/30 text-center shrink-0 relative z-10">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic opacity-40">Synchronized Mandate Analysis • Academic Intelligence Division • SPIMS+ Core</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyJobs;
