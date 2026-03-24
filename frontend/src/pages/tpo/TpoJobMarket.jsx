// frontend/src/pages/tpo/TpoJobMarket.jsx
import React, { useState, useEffect } from 'react';
import { tpoApi } from '../../api/api';
import { Briefcase, Search, Globe, ShieldCheck, Zap, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TpoJobMarket = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [requesting, setRequesting] = useState(null);

    const fetchGlobalJobs = async () => {
        try {
            const { data } = await tpoApi.getGlobalJobs();
            setJobs(data);
        } catch (error) {
            toast.error('Failed to load global job market');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalJobs();
    }, []);

    const handleRequestAccess = async (jobId) => {
        setRequesting(jobId);
        try {
            await tpoApi.requestAccess(jobId);
            toast.success('Access request dispatched to recruiter');
            setJobs(prev => prev.filter(j => j._id !== jobId));
        } catch (error) {
            toast.error('Failed to dispatch request');
        } finally {
            setRequesting(null);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-400 font-medium">Scanning global recruiter market...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
                        Global <span className="text-indigo-400">Job Market</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Discover and request high-impact roles for your institution.
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search recruiters or roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all w-72 md:w-80 text-sm font-medium placeholder:text-slate-600"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {filteredJobs.length === 0 ? (
                    <div className="bg-slate-900 border border-dashed border-slate-800 rounded-[2rem] p-20 text-center">
                        <Globe size={48} className="text-slate-700 mx-auto mb-4 opacity-30" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No Unclaimed Opportunities Found</p>
                        <p className="text-slate-600 text-xs mt-1">Check back later for new recruiter postings.</p>
                    </div>
                ) : (
                    filteredJobs.map(job => (
                        <div key={job._id} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] hover:border-indigo-500/30 transition-all group flex flex-col lg:flex-row lg:items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform pointer-events-none">
                                <ShieldCheck size={100} className="text-indigo-400" />
                            </div>

                            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                <Briefcase size={28} />
                            </div>

                            <div className="flex-1 space-y-2 relative z-10 min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{job.title}</h3>
                                    <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">Global</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400 font-bold uppercase tracking-tight">
                                    <span className="flex items-center gap-2"><Globe size={13} className="text-indigo-400" /> {job.company}</span>
                                    <span className="flex items-center gap-2"><MapPin size={13} className="text-indigo-400" /> {job.location}</span>
                                    <span className="px-2 py-0.5 border border-slate-800 rounded text-[10px]">{job.type}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative z-10 shrink-0">
                                <div className="hidden lg:block h-12 w-px bg-slate-800" />
                                <button
                                    onClick={() => handleRequestAccess(job._id)}
                                    disabled={requesting === job._id}
                                    className="flex items-center gap-3 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
                                >
                                    {requesting === job._id ? 'Dispatching...' : (
                                        <><Zap size={15} /> Request Access</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TpoJobMarket;
