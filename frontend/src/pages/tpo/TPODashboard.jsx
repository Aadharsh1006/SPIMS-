// frontend/src/pages/tpo/TPODashboard.jsx
import { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import {
    Users, Briefcase, TrendingUp, Download,
    Building2, GraduationCap, Award, Shield, Target
} from 'lucide-react';

const TPODashboard = () => {
    const [stats, setStats] = useState({
        studentCount: 0,
        jobCount: 0,
        placementRate: '0%',
        avgAtsScore: 0,
        avgJobMatch: 0,
        placementsByFaculty: [],
        companiesByHires: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardApi.getTpoDashboard()
            .then(res => setStats(res.data))
            .catch(err => console.error('Failed to fetch TPO stats', err))
            .finally(() => setLoading(false));
    }, []);

    const handleExport = async () => {
        try {
            const res = await dashboardApi.exportTpoData();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'TPO_Export_Data.csv');
            document.body.appendChild(link);
            link.click();
            toast.success('Placement data downloaded');
        } catch (err) {
            toast.error('Download failed. Please try again.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-indigo-500 rounded-lg animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Institutional Matrix...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic">
                        Institutional <span className="text-indigo-400">Analytics</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60 italic">
                        Real-time placement telemetry and student success metrics.
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 group active:scale-95 shrink-0"
                >
                    Download Report
                    <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
            </header>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
                {[
                    { label: 'Enrolled Candidate Pool', value: stats.studentCount, icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                    { label: 'Live Career Opportunities', value: stats.jobCount, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                    { label: 'Career Transition Rate', value: stats.placementRate, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Institutional ATS Avg', value: `${stats.avgAtsScore}%`, icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { label: 'Technical Alignment', value: `${stats.avgJobMatch}%`, icon: Target, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-500 shadow-[var(--shadow-lg)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-700 pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2 opacity-50 italic">{stat.label}</p>
                            <p className="text-4xl font-black text-[var(--text-bright)] tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform duration-500">{stat.value}</p>
                        </div>
                        <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center border ${stat.bg} ${stat.border} shadow-[var(--shadow-md)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Faculty Performance */}
                <div className="bg-[var(--bg-card)] rounded-[3rem] p-10 border border-[var(--border-main)] shadow-[var(--shadow-lg)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-[var(--shadow-sm)] group-hover:scale-110 transition-transform duration-500">
                            <Award size={24} />
                        </div>
                        <h2 className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] italic">Departmental Success Distribution</h2>
                    </div>
                    <div className="space-y-5">
                        {stats.placementsByFaculty?.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-[var(--bg-main)]/50 rounded-3xl border border-[var(--border-main)] hover:border-indigo-500/30 transition-all duration-500 group/item shadow-[var(--shadow-sm)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-center text-indigo-400 group-hover/item:scale-110 transition-all shadow-[var(--shadow-sm)]">
                                        <Users size={22} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-[var(--text-bright)] uppercase tracking-tight italic group-hover/item:text-indigo-400 transition-colors">{f.facultyName || 'Institutional Direct'}</span>
                                        <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] opacity-50 italic">{f.department} Matrix</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-indigo-500 italic tracking-tighter">{f.placedCount}</p>
                                    <p className="text-[8px] font-black text-indigo-500/50 uppercase tracking-[0.2em] leading-none">Units</p>
                                </div>
                            </div>
                        ))}
                        {(!stats.placementsByFaculty || stats.placementsByFaculty.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-16 opacity-30 select-none">
                                <Users size={40} className="text-[var(--text-muted)] mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">No departmental telemetry available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Companies */}
                <div className="bg-[var(--bg-card)] rounded-[3rem] p-10 border border-[var(--border-main)] shadow-[var(--shadow-lg)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[var(--shadow-sm)] group-hover:scale-110 transition-transform duration-500">
                            <Building2 size={24} />
                        </div>
                        <h2 className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] italic">Lead Corporate Partnerships</h2>
                    </div>
                    <div className="space-y-5">
                        {stats.companiesByHires?.slice(0, 5).map((company, i) => (
                            <div key={i} className="p-5 rounded-3xl bg-[var(--bg-main)]/50 border border-[var(--border-main)] flex items-center justify-between hover:border-emerald-500/30 transition-all duration-500 group/item shadow-[var(--shadow-sm)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-center shadow-[var(--shadow-sm)] group-hover/item:scale-110 transition-all">
                                        <Building2 size={20} className="text-[var(--text-muted)] opacity-60" />
                                    </div>
                                    <h4 className="font-black text-[var(--text-bright)] uppercase tracking-tight text-sm italic group-hover/item:text-emerald-400 transition-colors">{company.company}</h4>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="text-xl font-black text-[var(--text-bright)] italic tracking-tighter">{company.hiresCount}</span>
                                        <span className="text-[9px] font-black text-[var(--text-muted)] ml-2 uppercase tracking-widest opacity-40">Personnel</span>
                                    </div>
                                    <div className="h-1.5 w-24 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)] shadow-inner">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                            style={{ width: `${(company.hiresCount / (stats.companiesByHires[0]?.hiresCount || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!stats.companiesByHires || stats.companiesByHires.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-16 opacity-30 select-none">
                                <Building2 size={40} className="text-[var(--text-muted)] mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">No corporate hiring telemetry</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TPODashboard;
