// frontend/src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, analyticsApi, aiApi } from '../../api/api';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import {
    LayoutDashboard,
    Briefcase,
    CheckCircle,
    Clock,
    Trophy,
    ChevronRight,
    Search,
    Target,
    Zap,
    Sparkles,
    Rocket,
    BookOpen,
    TrendingUp,
    ArrowRight,
    Share2,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

// --- Growth Blueprint Component ---
const GrowthBlueprint = ({ profile }) => {
    const [blueprintData, setBlueprintData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!profile) return;
        let isMounted = true;
        setLoading(true);
        setError(null);

        aiApi.predictPath(profile)
            .then(res => {
                if (isMounted) {
                    if (res.data && res.data.actionPlan) {
                        setBlueprintData(res.data.actionPlan);
                    } else {
                        throw new Error("Invalid AI response format");
                    }
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("AI Prediction Error:", err);
                if (isMounted) {
                    setError("AI was unable to generate a blueprint at this time. We are using the Gemini model with Ollama as a local fallback, but both are currently unreachable.");
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, [profile]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-card)] rounded-3xl p-8 md:p-12 shadow-[var(--shadow-lg)] relative overflow-hidden border border-[var(--border-main)]"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                                <Sparkles size={20} className="text-white animate-pulse" />
                            </div>
                            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest inline-flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                AI Career Strategist
                            </span>
                        </div>
                        <h3 className="text-4xl font-black text-[var(--text-bright)] tracking-tight uppercase italic leading-none">Growth Blueprint</h3>
                        <p className="text-[var(--text-muted)] text-sm max-w-xl font-medium leading-relaxed">
                            A highly personalized 3-phase strategic roadmap generated entirely by our AI models (Gemini + Ollama) based on your unique tech stack and career trajectory.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center space-y-6">
                        <div className="flex justify-center flex-col items-center gap-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                                <Sparkles size={20} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
                            </div>
                            <h4 className="text-xl font-black text-[var(--text-bright)] uppercase italic tracking-tighter">Analyzing Profile...</h4>
                            <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">Generating Strategic Action Plan</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Target size={24} className="text-red-400" />
                        </div>
                        <p className="text-red-400 font-bold text-sm max-w-md mx-auto">{error}</p>
                    </div>
                ) : blueprintData && blueprintData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-12 left-10 right-10 h-px bg-white/5 rounded-full hidden md:block">
                            <div className="absolute top-0 left-0 h-full bg-indigo-500/30 w-full blur-sm" />
                        </div>

                        {blueprintData.map((phase, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="bg-[var(--bg-main)]/50 border border-[var(--border-main)] p-8 rounded-3xl relative flex flex-col hover:bg-[var(--bg-main)] hover:border-[var(--accent)]/30 transition-all shadow-[var(--shadow-md)]"
                            >
                                <div className="mb-6 relative z-10 flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl">
                                        {phase.step || (idx + 1)}
                                    </div>
                                    <span className={clsx(
                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                        phase.impact === 'High' ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                                        phase.impact === 'Medium' ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                        "text-[var(--text-muted)] bg-[var(--bg-secondary)] border-[var(--border-main)]"
                                    )}>
                                        {phase.impact || 'Medium'} Impact
                                    </span>
                                </div>

                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 truncate" title={phase.phase}>
                                    {phase.phase}
                                </span>
                                <h4 className="text-lg font-black text-[var(--text-bright)] uppercase tracking-tight leading-tight mb-4">
                                    {phase.task}
                                </h4>
                                <p className="text-[11px] text-[var(--text-muted)] font-bold leading-relaxed italic opacity-80 mb-6 flex-1">
                                    {phase.detail}
                                </p>
                                <div className="pt-5 border-t border-[var(--border-main)] flex items-center gap-3">
                                    <Clock size={14} className="text-[var(--text-muted)]" />
                                    <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                        {phase.duration || '2-4 Weeks'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center">
                        <p className="text-[var(--text-muted)] italic">No blueprint available.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// --- Market Intelligence Component ---
const MarketIntelligence = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyticsApi.getSkillGap()
            .then(res => setData(res.data))
            .catch(err => console.error('Failed to fetch skill gap', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="animate-pulse flex gap-6 h-64 p-8">
            <div className="flex-1 bg-[var(--bg-secondary)] rounded-3xl" />
            <div className="flex-1 bg-[var(--bg-secondary)] rounded-3xl" />
        </div>
    );
    if (!data) return null;

    const { mySkills, topMarketSkills, recommendations, missingSkills } = data;
    const marketSkillLabels = topMarketSkills.slice(0, 7).map(s => s.skill);

    const radarData = {
        labels: marketSkillLabels.map(l => l.toUpperCase()),
        datasets: [
            {
                label: 'Market Demand',
                data: marketSkillLabels.map(label => {
                    const skillData = topMarketSkills.find(s => s.skill === label);
                    return skillData ? (skillData.count / topMarketSkills[0].count) * 100 : 0;
                }),
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1',
                borderWidth: 3,
                pointBackgroundColor: '#6366f1',
            },
            {
                label: 'Your Mastery',
                data: marketSkillLabels.map(label => {
                    const skill = label.toLowerCase();
                    const hasSkill = mySkills.some(s => s.includes(skill) || skill.includes(s));
                    return hasSkill ? 100 : 15;
                }),
                backgroundColor: 'rgba(16, 185, 129, 0.4)',
                borderColor: '#10b981',
                borderWidth: 3,
                pointBackgroundColor: '#10b981',
            }
        ]
    };

    const barData = {
        labels: marketSkillLabels.map(l => l.toUpperCase()),
        datasets: [{
            label: 'Gap',
            data: marketSkillLabels.map(label => {
                const skill = label.toLowerCase();
                const hasSkill = mySkills.some(s => s.includes(skill) || skill.includes(s));
                return hasSkill ? 0 : 70;
            }),
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderColor: '#ef4444',
            borderWidth: 1,
            borderRadius: 8
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    font: { size: 9, weight: 'bold' },
                    color: '#94a3b8'
                }
            },
            tooltip: { cornerRadius: 12, padding: 12 }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            {/* Charts Column */}
            <div className="space-y-6">
                <div className="bg-[var(--bg-card)]/60 backdrop-blur-md p-8 rounded-3xl border border-[var(--border-main)] h-80 relative overflow-hidden shadow-[var(--shadow-md)]">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-3">
                        <Rocket size={14} className="text-[var(--accent)]" />
                        <span className="italic">Skill Alignment</span>
                    </h3>
                    <Radar data={radarData} options={{
                        ...commonOptions,
                        scales: {
                            r: {
                                ticks: { display: false },
                                grid: { color: 'rgba(255,255,255,0.05)' },
                                pointLabels: { font: { size: 9, weight: 'bold' }, color: '#64748b' }
                            }
                        }
                    }} />
                </div>
                <div className="bg-[var(--bg-card)]/60 backdrop-blur-md p-8 rounded-3xl border border-[var(--border-main)] h-64 shadow-[var(--shadow-md)]">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-3">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="italic">Skill Gaps</span>
                    </h3>
                    <Bar data={barData} options={{
                        ...commonOptions,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { display: false },
                            x: {
                                grid: { display: false },
                                ticks: { font: { size: 9, weight: 'bold' }, color: '#64748b' }
                            }
                        }
                    }} />
                </div>
            </div>

            {/* Recommendations Column */}
            <div className="bg-[var(--bg-card)] p-8 rounded-3xl shadow-[var(--shadow-lg)] relative overflow-hidden border border-[var(--border-main)]">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
                    <Zap size={200} className="translate-x-12 -translate-y-12" />
                </div>
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-8 flex items-center gap-3">
                    <BookOpen size={14} />
                    <span className="italic">Recommended Courses</span>
                </h3>
                <div className="space-y-3 relative z-10">
                    {recommendations.slice(0, 4).map((rec, i) => (
                        <a
                            href={`https://www.coursera.org/courses?query=${encodeURIComponent(rec.skill)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={i}
                            className="bg-[var(--bg-main)]/50 border border-[var(--border-main)] p-4 rounded-2xl flex items-center gap-4 hover:bg-[var(--accent)]/10 transition-all group cursor-pointer"
                        >
                            <div className={clsx(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0",
                                rec.priority === 'CRITICAL' ? "bg-red-500 text-white" : "bg-[var(--accent)] text-white"
                            )}>
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-[var(--accent)] uppercase mb-0.5">{rec.skill}</p>
                                <p className="text-xs text-[var(--text-main)]/80 font-medium leading-tight truncate">{rec.action}</p>
                            </div>
                            <ArrowRight size={14} className="text-[var(--text-muted)] opacity-30 group-hover:opacity-100 group-hover:text-[var(--text-bright)] shrink-0 transition-all group-hover:translate-x-1" />
                        </a>
                    ))}
                    {missingSkills.length > 4 && (
                        <div className="pt-4 flex flex-wrap gap-2">
                            {missingSkills.slice(4, 10).map(s => (
                                <a
                                    href={`https://www.coursera.org/courses?query=${encodeURIComponent(s)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={s}
                                    className="px-3 py-1 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-full text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tighter hover:bg-[var(--bg-secondary)] hover:text-indigo-400 transition-all"
                                >
                                    +{s}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard ---
const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardApi.getStudentDashboard()
            .then(res => setData(res.data))
            .catch(err => console.error('Failed to fetch dashboard', err))
            .finally(() => setLoading(false));
    }, []);

    const getDisplayStrength = () => {
        if (!data) return 0;
        if (data.profileStrength && data.profileStrength > 0) return data.profileStrength;
        const sections = [
            { met: !!data.department, weight: 15 },
            { met: !!data.cgpa, weight: 15 },
            { met: data.skills?.length > 0, weight: 15 },
            { met: !!data.bio, weight: 15 },
            { met: data.education?.length > 0, weight: 15 },
            { met: data.projects?.length > 0, weight: 15 },
            { met: data.certifications?.length > 0, weight: 5 },
            { met: data.achievements?.length > 0, weight: 5 }
        ];
        return Math.round(sections.reduce((acc, s) => acc + (s.met ? s.weight : 0), 0));
    };

    const handleShare = async () => {
        if (!data) return;
        const profileUrl = `${window.location.origin}/portfolio/${data.userId || data._id}`;
        const shareData = {
            title: `Professional Portfolio`,
            text: `Check out my professional dashboard on SPIMS+!`,
            url: profileUrl
        };
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Share failed', err);
            }
        }
        try {
            await navigator.clipboard.writeText(profileUrl);
            toast.success('Portfolio link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
        </div>
    );

    if (!data) return <div className="text-[var(--text-bright)] p-10">Failed to load dashboard data.</div>;

    const stats = [
        { label: 'Career Explorations', icon: Search, value: data.totalApplications, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Advanced Evaluations', icon: Clock, value: data.shortlistedCount, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { label: 'Engagements Secured', icon: Trophy, value: data.offersCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    ];

    return (
        <div className="relative min-h-screen space-y-8 pb-20">

            {/* Ambient background blobs — dark-theme safe */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-indigo-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-blue-900/15 rounded-full blur-[100px]" />
                <div className="absolute -bottom-32 left-1/3 w-[40rem] h-[40rem] bg-slate-800/30 rounded-full blur-[120px]" />
            </div>

            {/* ── Hero Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="bg-[var(--bg-card)] rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-[var(--shadow-lg)] border border-[var(--border-main)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-[var(--text-muted)]">
                        <LayoutDashboard size={220} />
                    </div>
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-6 flex-1">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 bg-indigo-500/15 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                    Student Dashboard
                                </span>
                                {getDisplayStrength() < 50 ? (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-400/20 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Updating insights...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-400/20 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                                        <span className="text-xs font-bold text-indigo-500">Live Updates Active</span>
                                    </div>
                                )}
                            </div>

                            {/* Career Paths */}
                            {data.profile?.careerPaths && data.profile.careerPaths.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center pr-2">
                                        <Target size={12} className="mr-1.5 text-indigo-500" /> Career Tracks:
                                    </span>
                                    {data.profile.careerPaths.map((path, idx) => (
                                        <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-main)] px-3 py-1.5 rounded-xl text-[10px] font-bold text-[var(--text-main)] flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {path}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Welcome + Status */}
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-black text-[var(--text-bright)] tracking-tight">
                                    Welcome Back, <span className="text-[var(--accent)]">{data.name?.split(' ')[0]}</span>
                                </h1>
                                <p className="text-[var(--text-muted)] text-base font-medium flex flex-wrap items-center gap-2">
                                    Placement Status:
                                    <span className={clsx(
                                        "font-black uppercase px-3 py-1 rounded-xl text-sm tracking-tight transition-all",
                                        data.placementStatus?.startsWith('PLACED') ? "bg-emerald-500 text-white" :
                                        data.placementStatus?.startsWith('OFFERED') ? "bg-blue-500 text-white" :
                                        data.placementStatus?.startsWith('SHORTLISTED') ? "bg-amber-500 text-white" :
                                        data.placementStatus?.startsWith('INTERVIEWING') ? "bg-purple-500 text-white" :
                                        "bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-main)]"
                                    )}>
                                        {data.placementStatus?.replace(/_/g, ' ')}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Profile Strength Card */}
                        <div className="shrink-0">
                            <div className="p-6 bg-[var(--bg-secondary)] backdrop-blur-2xl rounded-2xl border border-[var(--border-main)] shadow-[var(--shadow-md)] min-w-[200px]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-2">Profile Strength</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-[var(--text-bright)] tracking-tighter">{getDisplayStrength()}%</span>
                                    <span className="text-xs font-bold text-[var(--accent)] uppercase">Score</span>
                                </div>
                                <div className="mt-4 w-full h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--accent)] to-indigo-400 transition-all duration-1000"
                                        style={{ width: `${getDisplayStrength()}%` }}
                                    />
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="mt-5 w-full py-2.5 bg-[var(--bg-main)] hover:bg-[var(--border-main)] border border-[var(--border-main)] rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-all"
                                >
                                    <Share2 size={13} />
                                    Share Portfolio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        className={clsx(
                            "bg-[var(--bg-card)] border rounded-3xl p-8 flex items-center gap-6 hover:-translate-y-1 transition-all duration-500 shadow-[var(--shadow-lg)]",
                            stat.border
                        )}
                    >
                        <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", stat.bg)}>
                            <stat.icon size={30} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-4xl font-black text-[var(--text-bright)] tracking-tighter tabular-nums">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── AI Growth Blueprint ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <GrowthBlueprint profile={data.profile} />
            </motion.div>

            {/* ── Career Insights ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h2 className="text-2xl font-black text-[var(--text-bright)] tracking-tight flex items-center gap-3 uppercase italic">
                            <Zap className="text-[var(--accent)]" size={26} /> Career Insights
                        </h2>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Skill Analysis</p>
                    </div>
                    <span className="hidden md:flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
                    </span>
                </div>

                <div className="bg-[var(--bg-card)]/80 border border-[var(--border-main)] rounded-3xl overflow-hidden shadow-[var(--shadow-lg)]">
                    <MarketIntelligence />
                </div>
            </motion.div>

            {/* ── Recommended Jobs + Activity Feed ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                {/* Recommended Jobs */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="lg:col-span-3"
                >
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl shadow-[var(--shadow-lg)] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-bright)] uppercase italic tracking-tight flex items-center gap-3">
                                    <Sparkles size={22} className="text-[var(--accent)]" /> Recommended Jobs
                                </h2>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Suggested for you</p>
                            </div>
                            <div className="bg-indigo-600/20 text-indigo-400 text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-indigo-500/30">
                                Top Match
                            </div>
                        </div>

                        <div className="p-6">
                            {data.recommendations && data.recommendations.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {data.recommendations.map((job, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 6 }}
                                            className="p-6 bg-[var(--bg-main)]/50 hover:bg-[var(--bg-card)] rounded-2xl transition-all cursor-pointer group/card border border-[var(--border-main)] hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-md)]"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-lg font-black text-[var(--text-bright)] group-hover/card:text-[var(--accent)] transition-colors uppercase tracking-tight italic">
                                                    {job.title}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                                        {job.matchPercentage}% Match
                                                    </div>
                                                    <ChevronRight size={18} className="text-[var(--text-muted)] opacity-50 group-hover/card:opacity-100 group-hover/card:text-indigo-400 group-hover/card:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)] font-bold mb-3 flex items-center gap-2">
                                                <Briefcase size={14} className="text-[var(--accent)]" /> {job.company}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed line-clamp-2 italic">
                                                "{job.explanation}"
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (data.isCaughtUp || data.hasNoJobs || data.profileStrength > 60) ? (
                                <div className="py-16 text-center space-y-6">
                                    <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-3xl flex items-center justify-center mx-auto border border-[var(--accent)]/20 border-dashed">
                                        <TrendingUp size={36} className="text-[var(--accent)]" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-[var(--text-bright)] uppercase italic tracking-tight">Looking for more roles</h4>
                                        <p className="text-sm text-[var(--text-muted)] font-bold uppercase tracking-widest max-w-xs mx-auto mt-2 leading-relaxed">
                                            {data.isCaughtUp
                                                ? "Applied to all suggested jobs. Scanning for new ones."
                                                : "Scanning the market for roles that match your profile."}
                                        </p>
                                    </div>
                                    <Link
                                        to="/student/jobs"
                                        className="inline-flex items-center gap-3 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30"
                                    >
                                        <Search size={14} /> View All Jobs
                                    </Link>
                                </div>
                            ) : (
                                <div className="py-16 text-center space-y-6">
                                    <div className="w-20 h-20 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center mx-auto border border-[var(--border-main)]">
                                        <Sparkles size={36} className="text-[var(--accent)] opacity-50" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-[var(--text-bright)] uppercase italic tracking-tight">More Info Needed</h4>
                                        <p className="text-sm text-[var(--text-muted)] font-bold uppercase tracking-widest max-w-xs mx-auto mt-2 leading-relaxed">
                                            Complete your profile to get personalized job suggestions.
                                        </p>
                                    </div>
                                    <Link
                                        to="/student/profile"
                                        className="inline-flex items-center gap-3 px-8 py-3.5 bg-[var(--bg-main)] text-[var(--text-bright)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all shadow-[var(--shadow-md)]"
                                    >
                                        Complete Profile
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="lg:col-span-2 space-y-5"
                >
                    <div className="flex items-center gap-4 px-1">
                        <div className="p-3 bg-[var(--accent)] rounded-2xl shadow-[var(--shadow-md)] shadow-[var(--accent)]/30">
                            <Clock size={22} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-[var(--text-bright)] tracking-tight uppercase italic">Recent Activity</h2>
                    </div>

                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-3xl max-h-[800px] overflow-y-auto space-y-6 shadow-[var(--shadow-lg)]
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-[var(--bg-main)]
                        [&::-webkit-scrollbar-thumb]:bg-[var(--border-main)]
                        [&::-webkit-scrollbar-thumb]:rounded-full">

                        {/* Timeline line */}
                        <div className="absolute left-12 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-[var(--border-main)] to-transparent pointer-events-none hidden" />

                        {data.timeline && data.timeline.length > 0 ? (
                            <div className="space-y-6">
                                {data.timeline.map((event, i) => {
                                    const statusConfigs = {
                                        'Application Submitted': { icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                                        'Approved by Faculty': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                                        'Shortlisted for Interview': { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                                        'Offer Letter Released': { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                                        'Offer Accepted - Hired!': { icon: Rocket, color: 'text-emerald-500', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
                                        'Changes requested by Faculty': { icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
                                    };
                                    const config = statusConfigs[event.event] || { icon: Target, color: 'text-[var(--text-muted)]', bg: 'bg-[var(--bg-secondary)]', border: 'border-[var(--border-main)]' };
                                    const Icon = config.icon;

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 16 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            className="flex gap-4"
                                        >
                                            <div className={clsx(
                                                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border",
                                                config.bg, config.color, config.border
                                            )}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <h4 className="text-sm font-black text-[var(--text-bright)] italic tracking-tight">{event.event}</h4>
                                                <p className="text-[10px] font-black uppercase text-[var(--accent)] tracking-widest">{event.company}</p>
                                                {event.notes && (
                                                    <div className="mt-2 p-3 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-xl text-xs text-[var(--text-muted)] font-medium italic leading-relaxed">
                                                        "{event.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-16 text-center space-y-4">
                                <div className="w-14 h-14 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mx-auto border border-[var(--border-main)]">
                                    <Clock size={24} className="text-[var(--text-muted)] opacity-50" />
                                </div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No recent activity found.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentDashboard;
