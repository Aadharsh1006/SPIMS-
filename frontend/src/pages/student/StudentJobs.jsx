// frontend/src/pages/student/StudentJobs.jsx
import { useState, useEffect } from 'react';
import { jobsApi, usersApi, aiApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Briefcase, Filter, Sparkles, ChevronRight, CheckCircle, Bookmark, Activity, Zap, Target, Cpu, ExternalLink, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

// --- Dynamic Job Fit Analysis Component ---
const JobFitAnalysis = ({ job, userProfile, onAnalysisComplete }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!job || !userProfile) return;
        setAnalysis(null);
        setLoading(true);

        aiApi.analyzeJobFit(userProfile, job)
            .then(res => {
                const unifiedData = {
                    ...res.data,
                    matchScore: job.aiMatch?.matchPercentage || res.data.matchScore || 25
                };
                setAnalysis(unifiedData);
                if (onAnalysisComplete) onAnalysisComplete(unifiedData);
            })
            .catch(() => {
                const baseScore = job.aiMatch?.matchPercentage || 25;
                const fallbackData = {
                    matchScore: baseScore,
                    fitReason: "Matching your profile with job requirements. Core skills identified.",
                    gapAnalysis: baseScore > 75 ? "Your profile matches this role well." : "You might need more specific skills for this role.",
                    isFallback: true
                };
                setAnalysis(fallbackData);
                if (onAnalysisComplete) onAnalysisComplete(fallbackData);
            })
            .finally(() => setLoading(false));
    }, [job, userProfile]);

    if (loading) return (
        <div className="p-10 bg-[var(--bg-card)] rounded-[2.5rem] animate-pulse flex flex-col items-center justify-center space-y-4 border border-[var(--border-main)] shadow-[var(--shadow-lg)]">
            <Sparkles className="text-[var(--accent)] animate-pulse" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent)]">Calculating your fit...</p>
        </div>
    );

    if (!analysis) return (
        <div className="p-8 bg-amber-500/10 rounded-[2rem] border border-amber-500/20 flex items-center gap-6">
            <AlertTriangle className="text-amber-400 shrink-0" size={28} />
            <p className="text-amber-300 font-black text-xs uppercase tracking-tight">Update your profile to see how well you fit this job.</p>
        </div>
    );

    return (
        <div className="animate-in fade-in zoom-in-95 duration-700 mb-8">
            <div className="p-10 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] relative overflow-hidden group shadow-[var(--shadow-lg)]">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000 overflow-hidden pointer-events-none">
                    <Sparkles size={200} className="translate-x-20 -translate-y-20 text-[var(--accent)]" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <span className="text-5xl font-black tracking-tighter italic tabular-nums text-[var(--text-bright)]">{analysis.matchScore}%</span>
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--accent)]">
                                {analysis.isFallback ? 'Basic Match Score' : 'AI Fit Score'}
                            </p>
                        </div>
                        <div className={clsx(
                            "w-16 h-16 rounded-[2rem] flex items-center justify-center animate-pulse shadow-2xl",
                            analysis.matchScore >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                                analysis.matchScore >= 50 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                        )}>
                            <Activity size={32} />
                        </div>
                    </div>
                    <p className="text-lg font-black italic leading-tight text-[var(--text-main)] border-l-4 border-[var(--accent)] pl-6 py-3 mb-6">
                        "{analysis.fitReason}"
                    </p>
                    <div className="pt-6 border-t border-[var(--border-main)]">
                        <div className="flex items-center gap-3">
                            <Target className="text-red-400 shrink-0" size={18} />
                            <div>
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none mb-1">Recommended Skills to Add</p>
                                <p className="text-sm font-bold text-[var(--text-muted)] italic">"{analysis.gapAnalysis}"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [activeAnalysis, setActiveAnalysis] = useState(null);
    const { user } = useAuth();

    const fetchJobs = () => {
        setLoading(true);
        jobsApi.list()
            .then(res => {
                setJobs(res.data);
                setFilteredJobs(res.data);
            })
            .catch(err => console.error('Failed to fetch jobs', err))
            .finally(() => setLoading(false));
    };

    const fetchProfile = () => {
        import('../../api/api').then(({ authApi }) => {
            authApi.me()
                .then(res => setUserProfile(res.data.profile || res.data))
                .catch(err => console.error('Failed to fetch profile', err));
        });
    };

    useEffect(() => {
        fetchJobs();
        fetchProfile();
        if (user?.profile?.bookmarks) {
            setBookmarks(user.profile.bookmarks);
        }
    }, [user]);

    useEffect(() => {
        let result = jobs;
        if (searchTerm) {
            result = result.filter(j =>
                j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                j.company.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (typeFilter !== 'ALL') {
            result = result.filter(j => j.type === typeFilter);
        }
        if (showSavedOnly) {
            result = result.filter(j => bookmarks.includes(j._id));
        }
        setFilteredJobs(result);
    }, [searchTerm, typeFilter, showSavedOnly, jobs, bookmarks]);

    const handleToggleBookmark = async (e, jobId) => {
        e.stopPropagation();
        try {
            const { data } = await usersApi.toggleBookmark(jobId);
            setBookmarks(data.bookmarks);
            toast.success(data.bookmarks.includes(jobId) ? 'Job bookmarked!' : 'Bookmark removed.');
        } catch {
            toast.error('Failed to update bookmark');
        }
    };

    const handleApply = async (jobId, customAiData = null) => {
        try {
            const payload = customAiData ? { customAiData } : {};
            await jobsApi.apply(jobId, payload);
            toast.success('Application submitted successfully!');
            fetchJobs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px]">Finding jobs for you...</p>
        </div>
    );

    return (
        <div className="relative min-h-screen selection:bg-indigo-900 selection:text-indigo-100">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-slate-800/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 space-y-8 pb-20 max-w-[1600px] mx-auto">

                {/* Header & Search */}
                <div className="bg-slate-900/80 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-slate-800 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <Sparkles size={200} />
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic flex items-center gap-4">
                                <Sparkles className="text-indigo-500 animate-pulse" size={40} /> Find Jobs
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                <span className="w-8 h-px bg-slate-700" /> Smart Job Matching <span className="w-8 h-px bg-slate-700" />
                            </p>
                        </div>
                        <span className="px-5 py-2.5 bg-[var(--bg-main)] text-[var(--text-bright)] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--border-main)] self-start lg:self-auto shadow-[var(--shadow-sm)]">
                            {filteredJobs.length} Jobs Found
                        </span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 relative z-10">
                        <div className="flex-1 relative group/input">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-[var(--accent)] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search jobs, skills, or companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl font-bold text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all placeholder:text-[var(--text-muted)] placeholder:italic"
                            />
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap gap-3">
                            <div className="relative">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="pl-5 pr-12 py-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-all appearance-none cursor-pointer min-w-[180px] shadow-[var(--shadow-sm)]"
                                >
                                    <option value="ALL">All Job Types</option>
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="INTERNSHIP">Internship</option>
                                    <option value="PART_TIME">Part Time</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90 pointer-events-none" size={14} />
                            </div>
                            <button
                                onClick={() => setShowSavedOnly(!showSavedOnly)}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                                    showSavedOnly
                                        ? "bg-[var(--accent)] text-white shadow-[var(--shadow-md)] shadow-[var(--accent)]/20"
                                        : "bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-main)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] shadow-[var(--shadow-sm)]"
                                )}
                            >
                                <Bookmark size={16} className={clsx(showSavedOnly && "fill-current")} />
                                {showSavedOnly ? 'Saved Jobs' : 'Bookmarks'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredJobs.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-[var(--bg-card)]/60 backdrop-blur-md rounded-[2.5rem] border border-dashed border-[var(--border-main)] shadow-[var(--shadow-lg)]">
                            <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[var(--border-main)]">
                                <Filter size={32} className="text-[var(--text-muted)]" />
                            </div>
                            <h3 className="text-lg font-black text-[var(--text-bright)] mb-2 uppercase tracking-tight">No jobs found</h3>
                            <p className="text-[var(--text-muted)] font-medium mb-6 max-w-xs mx-auto text-sm">No opportunities match these filters.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setShowSavedOnly(false); }}
                                className="px-8 py-3 bg-[var(--bg-main)] text-[var(--text-bright)] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[var(--accent)] transition-all border border-[var(--border-main)] shadow-[var(--shadow-sm)]"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        filteredJobs.map((job, idx) => (
                            <div
                                key={job._id || idx}
                                onClick={() => setSelectedJob(job)}
                                style={{ animationDelay: `${idx * 80}ms` }}
                                className="bg-[var(--bg-card)]/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-[var(--border-main)] hover:border-[var(--accent)]/50 hover:shadow-[var(--shadow-lg)] transition-all group flex flex-col justify-between cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 shadow-[var(--shadow-md)]"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="h-16 w-16 rounded-[1.5rem] bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--accent)] font-black text-2xl group-hover:bg-[var(--accent)] group-hover:text-white group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                                            {job.company?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <button
                                                onClick={(e) => handleToggleBookmark(e, job._id)}
                                                className={clsx(
                                                    "p-3 rounded-xl transition-all border outline-none active:scale-90",
                                                    bookmarks.includes(job._id)
                                                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                                                        : "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50"
                                                )}
                                            >
                                                <Bookmark size={18} className={bookmarks.includes(job._id) ? "fill-current" : ""} />
                                            </button>
                                            <div className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                                {job.aiMatch?.matchPercentage || 0}% Match
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <h3 className="text-xl font-black text-[var(--text-bright)] group-hover:text-[var(--accent)] transition-colors truncate tracking-tighter uppercase italic">{job.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-px bg-[var(--accent)] group-hover:w-4 transition-all" />
                                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{job.company}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter">
                                            <MapPin size={12} className="text-[var(--text-muted)]" /> {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter">
                                            <Briefcase size={12} className="text-[var(--text-muted)]" /> {job.type?.replace(/_/g, ' ')}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                                            ₹{job.salaryRange?.min}–{job.salaryRange?.max} LPA
                                        </div>
                                    </div>

                                    <div className="p-5 bg-[var(--bg-main)]/50 rounded-[1.5rem] border border-[var(--border-main)] mb-6 shadow-[var(--shadow-sm)]">
                                        <p className="text-[11px] text-[var(--text-muted)] font-medium italic leading-relaxed line-clamp-2">
                                            "{job.aiMatch?.explanation || "Analyzing how your skills match this role..."}"
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[var(--border-main)] flex items-center justify-between relative z-10">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </span>
                                    {job.hasApplied ? (
                                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-5 py-2.5 rounded-xl border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest">
                                            <CheckCircle size={16} /> Applied
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleApply(job._id); }}
                                            className="flex items-center gap-2 bg-[var(--accent)] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all hover:scale-105 active:scale-95 shadow-[var(--shadow-md)]"
                                        >
                                            Apply Now <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Job Details Modal */}
                {selectedJob && (
                    <div className="fixed inset-0 bg-[var(--bg-main)]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                        <div className="bg-[var(--bg-card)] rounded-[2.5rem] shadow-[var(--shadow-lg)] w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-[var(--border-main)]">

                            {/* Modal Header */}
                            <div className="p-8 md:p-10 border-b border-[var(--border-main)] bg-[var(--bg-card)] relative flex-shrink-0">
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="absolute top-8 right-8 text-[var(--text-muted)] hover:text-[var(--text-bright)] bg-[var(--bg-main)] p-3 rounded-2xl border border-[var(--border-main)] transition-all hover:rotate-90 hover:scale-110 active:scale-95 hover:border-[var(--text-muted)]"
                                >
                                    <X size={22} />
                                </button>

                                <div className="flex flex-col md:flex-row items-start gap-8 pr-16">
                                    <div className="h-24 w-24 rounded-[2rem] bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-[var(--accent)] font-black text-4xl shadow-[var(--shadow-md)]">
                                        {selectedJob.company?.charAt(0)}
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-bright)] tracking-tighter uppercase italic">{selectedJob.title}</h2>
                                            {selectedJob.hasApplied && (
                                                <span className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <CheckCircle size={16} /> Applied
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6 text-[var(--text-muted)]">
                                            <p className="font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                                                <Briefcase size={18} className="text-[var(--accent)]" /> {selectedJob.company}
                                            </p>
                                            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                                <MapPin size={16} /> {selectedJob.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-10 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                    {/* Left Column */}
                                    <div className="lg:col-span-8 space-y-10">
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-8 w-1 bg-[var(--accent)] rounded-full" />
                                                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Job Description</h3>
                                            </div>
                                            <div className="text-[var(--text-main)]/80 leading-relaxed font-medium bg-[var(--bg-main)]/50 p-8 rounded-[2rem] border border-[var(--border-main)] space-y-4 shadow-[var(--shadow-sm)]">
                                                {selectedJob.description ? selectedJob.description.split('\n').map((para, idx) => {
                                                    if (!para.trim()) return null;
                                                    if (para.trim().match(/^[-•*]/)) {
                                                        return (
                                                            <div key={idx} className="flex items-start gap-3 pl-2">
                                                                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-400 shrink-0" />
                                                                <p className="text-slate-300 font-medium">{para.replace(/^[-•*]\s*/, '').trim()}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return <p key={idx} className={idx === 0 ? "text-lg italic font-black text-slate-200" : "text-sm font-medium text-slate-400"}>{para.trim()}</p>;
                                                }) : (
                                                    <p className="italic text-slate-500 text-sm">"More details about this job will be available soon..."</p>
                                                )}
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Why you're a good fit</h3>
                                            </div>

                                            <JobFitAnalysis job={selectedJob} userProfile={userProfile} onAnalysisComplete={setActiveAnalysis} />

                                            {/* Resume Optimization */}
                                            <div className="bg-[var(--bg-main)]/60 border border-[var(--border-main)] rounded-[2rem] p-8 space-y-6 shadow-[var(--shadow-sm)]">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-black text-[var(--text-bright)] uppercase tracking-[0.3em] flex items-center gap-3">
                                                        <ShieldCheck className="text-[var(--accent)]" size={20} /> How to improve your application
                                                    </h4>
                                                    <span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-4 py-1.5 rounded-lg uppercase tracking-widest">Active</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="p-6 bg-[var(--bg-main)] rounded-[1.75rem] border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4">Skills to Highlight</p>
                                                        <ul className="space-y-3">
                                                            <li className="text-sm font-black text-[var(--text-bright)] flex items-center gap-3 italic uppercase tracking-tighter">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/20" /> Scalable Architecture
                                                            </li>
                                                            <li className="text-sm font-black text-[var(--text-bright)] flex items-center gap-3 italic uppercase tracking-tighter">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/20" /> {selectedJob.requirements?.skillsRequired?.[0] || 'Core Stack'} Focus
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="p-6 bg-[var(--bg-card)] rounded-[1.75rem] border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                                        <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] mb-4">Important Keywords</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedJob.requirements?.skillsRequired?.slice(0, 3).map(kw => (
                                                                <span key={kw} className="px-3 py-1.5 bg-[var(--bg-main)] border border-[var(--border-main)] text-[10px] font-black text-[var(--text-bright)] uppercase rounded-lg tracking-widest">{kw}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Column */}
                                    <div className="lg:col-span-4 space-y-6">
                                        {/* Requirements */}
                                        <div className="p-8 bg-[var(--bg-main)]/60 rounded-[2rem] border border-[var(--border-main)] space-y-8 shadow-[var(--shadow-sm)]">
                                            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Requirements</h3>
                                            <div className="space-y-4">
                                                {!selectedJob.requirements?.minCgpa && !selectedJob.requirements?.batchYear && (!selectedJob.requirements?.branchesAllowed?.length) && (
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] bg-slate-800 rounded-xl border border-dashed border-slate-700 p-5 text-center italic">No thresholds active</p>
                                                )}
                                                {selectedJob.requirements?.minCgpa && (
                                                    <div className="flex items-center justify-between p-5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border-main)]">
                                                        <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Min CGPA</p>
                                                        <p className="font-black text-[var(--text-bright)] text-xl tabular-nums">{selectedJob.requirements.minCgpa} <span className="text-sm text-[var(--text-muted)]">/ 10</span></p>
                                                    </div>
                                                )}
                                                {selectedJob.requirements?.batchYear && (
                                                    <div className="flex items-center justify-between p-5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border-main)]">
                                                        <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Batch Year</p>
                                                        <p className="font-black text-[var(--text-bright)] text-xl uppercase tracking-tighter italic">{selectedJob.requirements.batchYear}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {selectedJob.requirements?.branchesAllowed?.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-4">Eligible Departments</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedJob.requirements.branchesAllowed.map(branch => (
                                                            <span key={branch} className="px-4 py-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg uppercase tracking-widest text-[10px] font-black text-[var(--accent)]">{branch}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Required Skills */}
                                        {selectedJob.requirements?.skillsRequired?.length > 0 && (
                                            <div className="p-8 bg-[var(--bg-card)] text-[var(--text-main)] rounded-[2rem] border border-[var(--border-main)] relative overflow-hidden shadow-[var(--shadow-md)]">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                                    <Zap size={120} className="translate-x-10 -translate-y-10 text-[var(--accent)]" />
                                                </div>
                                                <div className="relative z-10 space-y-6">
                                                    <h3 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.4em]">Required Skills</h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {selectedJob.requirements.skillsRequired.map(skill => (
                                                            <a
                                                                key={skill}
                                                                href={`https://www.coursera.org/search?query=${encodeURIComponent(skill)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-bright)] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] transition-all group/skill shadow-[var(--shadow-sm)]"
                                                            >
                                                                {skill} <ExternalLink size={11} className="opacity-40 group-hover/skill:opacity-100" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                    <div className="pt-4 border-t border-[var(--border-main)]">
                                                        <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest flex items-center gap-2">
                                                            <Cpu size={12} /> Learn these on Coursera
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Company Culture */}
                                        <div className="p-8 bg-[var(--bg-main)]/60 border border-[var(--border-main)] rounded-[2rem] space-y-6 shadow-[var(--shadow-sm)]">
                                            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Company Culture</h3>
                                            <div className="space-y-5">
                                                {[
                                                    { label: 'Tech Innovation', hint: 'Company R&D frequency and tech stack evolution.' },
                                                    { label: 'Company Growth', hint: 'Market resilience and expansion rate.' },
                                                    { label: 'Team Spirit', hint: 'Team cohesion and horizontal leadership scores.' }
                                                ].map((dna, i) => {
                                                    const hash = (dna.label + selectedJob.company).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                                                    const val = 65 + (hash % 30);
                                                    return (
                                                        <div key={i} className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic">{dna.label}</span>
                                                                <span className="text-[11px] font-black text-[var(--accent)] tabular-nums">{val}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 rounded-full transition-all duration-1000"
                                                                    style={{ width: `${val}%`, transitionDelay: `${i * 200}ms` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Salary */}
                                        <div className="p-8 bg-emerald-600 text-white rounded-[2rem] border border-emerald-500/30 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                            <h3 className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.4em] mb-3 relative z-10">Salary Range</h3>
                                            <p className="text-3xl font-black tracking-tighter uppercase tabular-nums relative z-10">
                                                ₹{selectedJob.salaryRange?.min}–{selectedJob.salaryRange?.max}
                                                <span className="text-lg ml-1 text-emerald-200/60 italic"> LPA</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-[var(--border-main)] bg-[var(--bg-card)] flex flex-col md:flex-row items-center justify-between gap-6 flex-shrink-0">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">
                                        Ref: {selectedJob._id?.slice(-8).toUpperCase()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                                        <p className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">Ready for your application</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button
                                        onClick={() => setSelectedJob(null)}
                                        className="flex-1 md:flex-none px-10 py-4 bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/30 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95 shadow-[var(--shadow-sm)]"
                                    >
                                        Close
                                    </button>
                                    {!selectedJob.hasApplied && (
                                        <button
                                            onClick={() => { handleApply(selectedJob._id, activeAnalysis); setSelectedJob(null); }}
                                            className="flex-1 md:flex-none px-14 py-4 bg-[var(--accent)] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:brightness-110 transition-all shadow-[var(--shadow-md)] shadow-[var(--accent)]/20 flex items-center justify-center gap-3 active:scale-95 group"
                                        >
                                            Apply Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentJobs;
