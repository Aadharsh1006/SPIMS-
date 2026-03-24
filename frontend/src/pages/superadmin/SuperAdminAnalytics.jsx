// frontend/src/pages/superadmin/SuperAdminAnalytics.jsx
import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Building2, Users, Clock, ShieldCheck, Globe, TrendingUp } from 'lucide-react';

const SuperAdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await adminApi.getAdminAnalytics();
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch admin analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-[var(--accent)]/10 border-t-[var(--accent)] animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-[var(--accent)] rounded-lg animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] animate-pulse italic">Connecting to Analytics Grid...</p>
        </div>
    );

    if (!data) return (
        <div className="text-[var(--text-muted)] p-12 font-black uppercase tracking-widest text-xs italic text-center opacity-50 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl shadow-[var(--shadow-sm)]">
            Failed to synchronize with core analytics matrix.
        </div>
    );

    const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const trendData = data.collegeTrend.map(item => ({
        name: monthNames[item._id - 1],
        colleges: item.count
    }));

    const roleData = data.roleDistribution.map(item => ({
        name: item._id,
        value: item.count
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div>
                    <h1 className="text-3xl font-black text-[var(--text-bright)] italic tracking-tighter uppercase">
                        Global Platform <span className="text-violet-400">Stats</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                        Matrix-wide operational telemetry
                    </p>
                </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl shadow-[var(--shadow-sm)]">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] text-violet-400 font-black uppercase tracking-[0.2em] italic">Active Stream</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Colleges', value: data.stats.totalColleges, icon: Building2, color: 'text-violet-400' },
                    { label: 'Total Students', value: data.stats.totalStudents, icon: Users, color: 'text-blue-400' },
                    { label: 'Active Recruiters', value: data.stats.totalRecruiters, icon: ShieldCheck, color: 'text-emerald-400' },
                    { label: 'Awaiting Approval', value: data.stats.pendingRecruiters, icon: Clock, color: 'text-amber-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-main)] p-7 rounded-[2.5rem] hover:border-violet-500/30 transition-all duration-500 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] group relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-28 h-28 bg-[var(--accent)]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--accent)]/10 transition-all duration-700" />
                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <stat.icon size={24} className={`${stat.color} p-1.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-main)] shadow-[var(--shadow-sm)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`} />
                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40 italic">Global</span>
                        </div>
                        <p className="relative z-10 text-4xl font-black text-[var(--text-bright)] mb-1 tracking-tighter group-hover:translate-x-1 transition-transform duration-500 uppercase italic">{stat.value}</p>
                        <p className="relative z-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60 italic">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Growth Trend */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[3rem] shadow-[var(--shadow-lg)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                    <div className="flex items-center gap-3 mb-10">
                        <TrendingUp size={18} className="text-violet-400" />
                        <h3 className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] italic">Growth Telemetry — Colleges</h3>
                    </div>
                    <div className="h-[280px] w-full min-h-[280px] relative">
                        <ResponsiveContainer width="99.9%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" opacity={0.1} vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="var(--text-muted)" 
                                    fontSize={9} 
                                    fontWeight="900" 
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="var(--text-muted)" 
                                    fontSize={9} 
                                    fontWeight="900" 
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'var(--bg-card)', 
                                        border: '1px solid var(--border-main)', 
                                        borderRadius: '16px', 
                                        fontSize: '10px', 
                                        color: 'var(--text-bright)',
                                        boxShadow: 'var(--shadow-lg)',
                                        textTransform: 'uppercase',
                                        fontWeight: '900',
                                        padding: '12px'
                                    }}
                                    cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    itemStyle={{ color: '#8b5cf6', fontWeight: '900' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="colleges"
                                    stroke="#8b5cf6"
                                    strokeWidth={4}
                                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5, stroke: 'var(--bg-card)' }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#8b5cf6', shadow: '0 0 20px rgba(139,92,246,0.5)' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[3rem] shadow-[var(--shadow-lg)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                    <div className="flex items-center gap-3 mb-10">
                        <Globe size={18} className="text-violet-400" />
                        <h3 className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] italic">Persona Distribution Matrix</h3>
                    </div>
                    <div className="h-[280px] w-full min-h-[280px] relative">
                        <ResponsiveContainer width="99.9%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={105}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                            className="hover:opacity-80 transition-opacity cursor-pointer scale-95 hover:scale-100 origin-center duration-300"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'var(--bg-card)', 
                                        border: '1px solid var(--border-main)', 
                                        borderRadius: '16px', 
                                        fontSize: '10px', 
                                        color: 'var(--text-bright)',
                                        boxShadow: 'var(--shadow-lg)',
                                        textTransform: 'uppercase',
                                        fontWeight: '900',
                                        padding: '12px'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => (
                                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] group-hover:text-violet-400 transition-colors italic opacity-70">
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminAnalytics;
