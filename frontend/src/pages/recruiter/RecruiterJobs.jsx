// frontend/src/pages/recruiter/RecruiterJobs.jsx
import React, { useState, useEffect } from 'react';
import { recruiterApi } from '../../api/api';
import {
    Briefcase, Search, Edit3, Trash2,
    ShieldCheck, Clock, Users, PlusCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const RecruiterJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchJobs = async () => {
        try {
            const { data } = await recruiterApi.getJobs();
            setJobs(data);
        } catch {
            toast.error('Failed to load job postings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this job posting? This action cannot be undone.')) return;
        try {
            await recruiterApi.deleteJob(id);
            toast.success('Job posting removed');
            setJobs(prev => prev.filter(j => j._id !== id));
        } catch {
            toast.error('Failed to delete job');
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-emerald-500/10 border-t-emerald-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Briefcase size={24} className="text-emerald-500 animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Job Matrix...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Hub */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-8 md:p-10 shadow-[var(--shadow-xl)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                    <Briefcase size={180} className="text-emerald-500" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[var(--shadow-sm)]">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">
                                    Career <span className="text-emerald-400">Inventory</span>
                                </h1>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-1 italic opacity-60">Global Distribution Management</p>
                            </div>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm font-bold italic max-w-xl">
                            Overseeing <span className="text-emerald-400">{jobs.length} Active Directives</span> within the verified talent ecosystem.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/search:text-emerald-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search Job Protocols..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[var(--bg-main)]/50 border border-[var(--border-main)] text-[var(--text-bright)] pl-12 pr-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-full sm:w-64 text-[10px] font-black uppercase tracking-widest placeholder:opacity-40 italic shadow-inner hover:border-emerald-500/30"
                            />
                        </div>
                        <Link
                            to="/recruiter/jobs/new"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 border border-emerald-400/20 italic group/btn"
                        >
                            <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" /> Post New Protocol
                        </Link>
                    </div>
                </div>
            </div>

            {/* Protocol Distribution Matrix */}
            <div className="grid grid-cols-1 gap-6">
                {filteredJobs.length === 0 ? (
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-24 text-center shadow-[var(--shadow-xl)] relative overflow-hidden group/empty">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover/empty:opacity-100 transition-opacity" />
                        <div className="flex flex-col items-center opacity-30 relative z-10">
                            <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2.5rem] border border-[var(--border-main)] flex items-center justify-center mb-8 shadow-[var(--shadow-lg)] group-hover/empty:scale-110 transition-transform">
                                <Briefcase size={40} className="text-[var(--text-muted)]" />
                            </div>
                            <p className="text-lg text-[var(--text-bright)] font-black uppercase tracking-[0.4em] italic leading-none">Matrix Empty</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-3 italic">Register a new protocol to initiate talent stream</p>
                        </div>
                    </div>
                ) : (
                    filteredJobs.map(job => (
                        <div key={job._id} className="bg-[var(--bg-card)] hover:bg-[var(--bg-main)] border border-[var(--border-main)] hover:border-emerald-500/30 p-8 rounded-[3rem] shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-2xl)] transition-all duration-500 group/card relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                            <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                                {/* Visual Signature */}
                                <div className="w-16 h-16 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[1.5rem] flex items-center justify-center text-emerald-400 group-hover/card:scale-110 group-hover/card:bg-emerald-500 group-hover/card:text-white transition-all font-black text-2xl shadow-[var(--shadow-md)] shrink-0 italic">
                                    {job.title?.charAt(0)}
                                </div>

                                {/* Core Logistics */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-4 mb-3">
                                        <h3 className="text-xl md:text-2xl font-black text-[var(--text-bright)] group-hover/card:text-emerald-400 transition-colors uppercase tracking-tight truncate italic">
                                            {job.title}
                                        </h3>
                                        <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic border shadow-[var(--shadow-sm)] ${
                                            job.status === 'PUBLISHED'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] opacity-50'
                                        }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] italic opacity-80">
                                        <span className="flex items-center gap-3">
                                            <Briefcase size={14} className="text-emerald-500/50" /> {job.company}
                                        </span>
                                        <span className="flex items-center gap-3">
                                            <Clock size={14} className="text-emerald-500/50" /> {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="px-3 py-1 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg text-emerald-400 shadow-inner">{job.location}</span>
                                    </div>
                                </div>

                                {/* Operational Directives */}
                                <div className="flex items-center gap-4 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-[var(--border-main)] md:pl-10">
                                    <div className="flex bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl p-1 shadow-[var(--shadow-sm)]">
                                        <Link
                                            to={`/recruiter/applications?jobId=${job._id}`}
                                            className="p-4 text-[var(--text-muted)] hover:text-indigo-400 hover:bg-indigo-500/5 rounded-xl transition-all active:scale-90"
                                            title="View Candidate Stream"
                                        >
                                            <Users size={20} />
                                        </Link>
                                        <button
                                            className="p-4 text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/5 rounded-xl transition-all active:scale-90"
                                            title="Modify Protocol"
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job._id)}
                                            className="p-4 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all active:scale-90"
                                            title="Decommission Job"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecruiterJobs;
