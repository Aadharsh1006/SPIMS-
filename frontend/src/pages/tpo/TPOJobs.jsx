// frontend/src/pages/tpo/TPOJobs.jsx
import { useState, useEffect } from 'react';
import { tpoApi } from '../../api/api';
import { Briefcase, Building2, MapPin, Globe, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TPOJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const res = await tpoApi.getJobs();
            setJobs(res.data);
        } catch (err) {
            console.error('Failed to load jobs', err);
            toast.error('Failed to load placement opportunities');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id) => {
        try {
            await tpoApi.publishJob(id);
            toast.success('Job published to institutional portal');
            loadJobs();
        } catch (err) {
            toast.error('Failed to publish job track');
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Scanning Job Market...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
                        Track <span className="text-indigo-400">Management</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">
                        Review and activate job tracks for student visibility.
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search tracks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Opportunity Details</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin & Model</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility Status</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredJobs.map(j => (
                                <tr key={j._id} className="hover:bg-slate-800/40 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors border border-slate-800">
                                                <Building2 size={22} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-base tracking-tight">{j.title}</div>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{j.company}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-2">
                                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${j.isGlobal ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {j.isGlobal ? <Globe size={12} /> : <Briefcase size={12} />}
                                                {j.isGlobal ? 'Global Recruiter' : 'Internal Partner'}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                                                <MapPin size={10} /> {j.location} • {j.type}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                                            j.status === 'PUBLISHED'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : j.status === 'DRAFT'
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                                        }`}>
                                            {j.status === 'PUBLISHED' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            {j.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        {j.status === 'DRAFT' ? (
                                            <button
                                                onClick={() => handlePublish(j._id)}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                            >
                                                Publish Track
                                            </button>
                                        ) : (
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 py-2 border border-slate-800 rounded-xl">Published</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredJobs.length === 0 && (
                    <div className="p-20 text-center opacity-30">
                        <Briefcase size={64} className="mx-auto mb-6 text-slate-500" />
                        <p className="font-black uppercase tracking-widest text-slate-400 text-sm">No Jobs Found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TPOJobs;
