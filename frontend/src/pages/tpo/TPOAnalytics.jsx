// frontend/src/pages/tpo/TPOAnalytics.jsx
import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
    Download, TrendingUp, Users, Briefcase, Zap,
    Building2, PieChart as PieIcon, ShieldCheck
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TPOAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ department: 'ALL', timeRange: 'ALL' });
    const [depts, setDepts] = useState(['ALL']);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await analyticsApi.getTpoAnalytics(filters);
                setData(res.data);
                if (res.data.allDepartments) {
                    setDepts(['ALL', ...res.data.allDepartments]);
                }
            } catch (error) {
                console.error('Failed to fetch analytics', error);
                toast.error('Failed to load placement data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleExport = async () => {
        try {
            const res = await analyticsApi.exportPlacements();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Placement_Analytics.csv');
            document.body.appendChild(link);
            link.click();
            toast.success('Placement report downloaded');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading latest data...</p>
        </div>
    );

    if (!data) return (
        <div className="text-slate-400 p-10 font-black uppercase tracking-widest text-center">
            Failed to initialize analytics dashboard.
        </div>
    );

    const trendData = data.monthlyTrend.map(m => ({ name: MONTH_NAMES[m._id - 1], placements: m.count }));
    const deptData = data.departmentStats.map(d => ({ name: d._id || 'General', count: d.placedCount }));
    const companyData = data.companyStats.map(c => ({ name: c._id, hires: c.placedCount }));
    const statusData = data.placementStats.map(s => ({ name: s._id.replace(/_/g, ' ').toUpperCase(), value: s.count }));

    const tooltipStyle = {
        contentStyle: {
            backgroundColor: '#020617',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            fontSize: '10px',
            color: '#94a3b8'
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
                        Placement <span className="text-indigo-400">Analytics</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Key Placement Statistics</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                        {depts.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>)}
                    </select>
                    <select
                        value={filters.timeRange}
                        onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                        <option value="ALL">All Time</option>
                        <option value="30D">Last 30 Days</option>
                        <option value="6M">Last 6 Months</option>
                        <option value="1Y">Last Year</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        <Download size={16} /> Download Report
                    </button>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Students', value: data?.totalStudents || 0, icon: Users, color: 'text-blue-400' },
                    { label: 'Institutional Jobs', value: data?.totalJobs || 0, icon: Building2, color: 'text-indigo-400' },
                    { label: 'Placed Students', value: data?.placementStats?.find(s => s._id === 'OFFER_ACCEPTED')?.count || 0, icon: ShieldCheck, color: 'text-emerald-400' },
                    { label: 'Avg Remuneration', value: `₹${(data?.salaryStats?.avgSalary || 0).toFixed(1)}L`, icon: Zap, color: 'text-pink-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] group hover:border-indigo-500/30 transition-all shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <stat.icon size={20} className={stat.color} />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
                        </div>
                        <p className="text-2xl font-black text-white mb-1 tracking-tight">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hiring Trends */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp size={20} className="text-indigo-400" />
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Hiring Trends</h3>
                    </div>
                    <div className="h-[280px] w-full min-h-[280px] relative">
                        <ResponsiveContainer width="99.9%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="#475569" fontSize={10} fontWeight="bold" />
                                <Tooltip {...tooltipStyle} />
                                <Area type="monotone" dataKey="placements" stroke="#6366f1" fillOpacity={1} fill="url(#colorPlacements)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Placement Status Pie */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <PieIcon size={20} className="text-indigo-400" />
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Placement Status</h3>
                    </div>
                    <div className="h-[280px] w-full min-h-[280px] relative">
                        <ResponsiveContainer width="99.9%" height="100%">
                            <PieChart>
                                <Pie data={statusData} innerRadius={60} outerRadius={95} paddingAngle={5} dataKey="value">
                                    {statusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Placements by Department */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Users size={20} className="text-indigo-400" />
                        <h3 className="text-base font-black text-white uppercase tracking-tight">By Department</h3>
                    </div>
                    <div className="h-[280px] w-full min-h-[280px] relative">
                        <ResponsiveContainer width="99.9%" height="100%">
                            <BarChart data={deptData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" stroke="#475569" fontSize={10} fontWeight="bold" />
                                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} fontWeight="bold" width={80} />
                                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} {...tooltipStyle} />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Recruiting Partners */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Building2 size={20} className="text-indigo-400" />
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Top Recruiting Partners</h3>
                    </div>
                    <div className="h-[280px] w-full min-h-[280px] relative">
                        <ResponsiveContainer width="99.9%" height="100%">
                            <BarChart data={companyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="#475569" fontSize={10} fontWeight="bold" />
                                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} {...tooltipStyle} />
                                <Bar dataKey="hires" fill="#10b981" radius={[8, 8, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TPOAnalytics;
