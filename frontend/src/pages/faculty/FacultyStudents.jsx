// frontend/src/pages/faculty/FacultyStudents.jsx
import React, { useState, useEffect } from 'react';
import { tpoApi, analyticsApi } from '../../api/api';
import {
    Users, GraduationCap, Mail, Star, Search, ExternalLink, X,
    TrendingUp, Briefcase, CheckCircle, Clock, ShieldCheck, Zap, Quote
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const FacultyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [perfLoading, setPerfLoading] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [skillFilter, setSkillFilter] = useState('');

    const calculateProfileStrength = (profile) => {
        if (!profile) return 0;
        if (profile.profileStrength && profile.profileStrength > 0) return profile.profileStrength;
        const sections = [
            { met: !!profile.department, weight: 15 },
            { met: !!profile.cgpa, weight: 15 },
            { met: profile.skills?.length > 0, weight: 15 },
            { met: !!profile.bio, weight: 15 },
            { met: profile.education?.length > 0, weight: 15 },
            { met: profile.projects?.length > 0, weight: 15 },
            { met: profile.certifications?.length > 0, weight: 5 },
            { met: profile.achievements?.length > 0, weight: 5 }
        ];
        return Math.round(sections.reduce((acc, s) => acc + (s.met ? s.weight : 0), 0));
    };

    const fetchStudents = async () => {
        try {
            const { data } = await tpoApi.getStudents();
            setStudents(data);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const fetchPerformance = async (studentId) => {
        setPerfLoading(true);
        try {
            const { data } = await analyticsApi.getStudentPerformance(studentId);
            setPerformance(data);
        } catch (error) {
            toast.error('Failed to load performance metrics');
        } finally {
            setPerfLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleViewPerformance = (student) => {
        setSelectedStudent(student);
        fetchPerformance(student._id);
    };

    const filteredStudents = students
        .filter(s => {
            const matchesSearch =
                s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.profile?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSkill = !skillFilter || s.profile?.skills?.some(skill =>
                skill.toLowerCase().includes(skillFilter.toLowerCase())
            );
            return matchesSearch && matchesSkill;
        })
        .sort((a, b) => {
            if (sortBy === 'cgpa_desc') return (b.profile?.cgpa || 0) - (a.profile?.cgpa || 0);
            if (sortBy === 'cgpa_asc') return (a.profile?.cgpa || 0) - (b.profile?.cgpa || 0);
            return (a.name || '').localeCompare(b.name || '');
        });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-3xl shadow-[var(--shadow-md)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-bright)] tracking-tight uppercase italic">
                            My <span className="text-indigo-400">Students</span>
                        </h1>
                        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60 italic">View and assess student performance metrics.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 md:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                            <input
                                type="text"
                                placeholder="Search name, roll..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                            />
                        </div>
                        <div className="relative flex-1 md:w-44">
                            <input
                                type="text"
                                placeholder="Filter by skill..."
                                value={skillFilter}
                                onChange={(e) => setSkillFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-bright)] focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-black uppercase tracking-widest cursor-pointer"
                        >
                            <option value="name">Sort: Name</option>
                            <option value="cgpa_desc">Highest CGPA</option>
                            <option value="cgpa_asc">Lowest CGPA</option>
                        </select>
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <Users size={13} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{filteredStudents.length} Students</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredStudents.map(student => (
                    <div key={student._id} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2rem] p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-[var(--shadow-md)]">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-500">
                            <GraduationCap size={70} />
                        </div>

                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-black text-lg border border-indigo-500/20 shrink-0">
                                {student.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black text-[var(--text-bright)] tracking-tight uppercase truncate italic">{student.name}</h3>
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest truncate opacity-60 italic">
                                    {student.profile?.department || 'Unassigned'} • {student.profile?.rollNumber || 'No Roll'}
                                </p>
                                <a href={`mailto:${student.email}`} className="inline-flex items-center gap-2 mt-2 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                                    <Mail size={12} /> <span className="truncate">{student.email}</span>
                                </a>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            {[
                                { icon: Star, iconColor: 'text-amber-400', label: 'CGPA', value: student.profile?.cgpa || 'N/A', valueColor: 'text-[var(--text-bright)]' },
                                { icon: TrendingUp, iconColor: 'text-emerald-400', label: 'Readiness', value: `${calculateProfileStrength(student.profile)}%`, valueColor: 'text-emerald-400' },
                                { icon: Zap, iconColor: 'text-indigo-400', label: 'ATS Score', value: `${student.profile?.atsScore || 0}%`, valueColor: 'text-indigo-400' },
                            ].map(({ icon: Icon, iconColor, label, value, valueColor }) => (
                                <div key={label} className="flex items-center justify-between px-4 py-3 bg-[var(--bg-main)]/50 rounded-2xl border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                    <div className="flex items-center gap-3 text-[var(--text-muted)]">
                                        <Icon size={14} className={iconColor} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{label}</span>
                                    </div>
                                    <span className={clsx("text-base font-black italic", valueColor)}>{value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {(student.profile?.skills || []).slice(0, 3).map(skill => (
                                <span key={skill} className="px-3 py-1 bg-[var(--bg-main)] text-[var(--text-muted)] rounded-lg text-[9px] font-black uppercase tracking-widest border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                    {skill}
                                </span>
                            ))}
                            {student.profile?.skills?.length > 3 && (
                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 shadow-[var(--shadow-sm)]">
                                    +{student.profile.skills.length - 3}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => handleViewPerformance(student)}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3 italic group/btn"
                        >
                            View Performance <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-20 text-center shadow-[var(--shadow-lg)]">
                    <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)] border border-[var(--border-main)] shadow-[var(--shadow-md)] opacity-50">
                        <Users size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">No Candidates Found</h3>
                    <p className="text-[var(--text-muted)] mt-2 text-[10px] font-black uppercase tracking-widest opacity-60">No student personas match your current search parameters.</p>
                </div>
            )}

            {/* Performance Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)]/80 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] w-full max-w-5xl max-h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in duration-300">
                        {/* Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

                        {/* Modal Header */}
                        <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2rem] flex items-center justify-center text-[var(--text-bright)] border border-[var(--border-main)] font-black text-3xl italic shadow-[var(--shadow-md)] group-hover:scale-110 transition-transform">
                                        {selectedStudent.name?.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center border-4 border-[var(--bg-card)] shadow-[var(--shadow-sm)]">
                                        <TrendingUp size={14} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic">{selectedStudent.name}</h2>
                                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic opacity-80">{selectedStudent.profile?.department || 'Unassigned'} • {selectedStudent.profile?.rollNumber || 'No Roll'}</p>
                                    <div className="flex gap-4 mt-4">
                                        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest bg-[var(--bg-main)]/50 px-3 py-1.5 rounded-xl border border-[var(--border-main)] shadow-[var(--shadow-sm)] italic">
                                            <Mail size={12} className="text-indigo-400" /> {selectedStudent.email}
                                        </span>
                                        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest bg-[var(--bg-main)]/50 px-3 py-1.5 rounded-xl border border-[var(--border-main)] shadow-[var(--shadow-sm)] italic">
                                            <Star size={12} className="text-amber-400" /> CGPA: {selectedStudent.profile?.cgpa || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedStudent(null); setPerformance(null); }}
                                className="w-12 h-12 bg-[var(--bg-main)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-bright)] rounded-2xl flex items-center justify-center transition-all border border-[var(--border-main)] shadow-[var(--shadow-sm)] active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f133 transparent' }}>
                            {perfLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-16 h-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Gathering Candidate Intelligence...</p>
                                </div>
                            ) : performance ? (
                                <div className="space-y-6">
                                    {/* Score Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                icon: TrendingUp, iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-400',
                                                label: 'Readiness Score',
                                                value: `${calculateProfileStrength(selectedStudent.profile)}%`,
                                                bar: calculateProfileStrength(selectedStudent.profile),
                                                barColor: 'bg-indigo-500'
                                            },
                                            {
                                                icon: Briefcase, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400',
                                                label: 'Applications',
                                                value: performance.summary.total,
                                                sub: 'Sent'
                                            },
                                            {
                                                icon: CheckCircle, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400',
                                                label: 'Career Phase',
                                                value: performance.summary.placed ? 'Hired' :
                                                    performance.summary.shortlisted > 0 ? 'Interviewing' : 'Seeking',
                                                valueColor: performance.summary.placed ? 'text-emerald-400' :
                                                    performance.summary.shortlisted > 0 ? 'text-amber-400' : 'text-[var(--text-muted)]'
                                            }
                                        ].map((card, i) => (
                                            <div key={i} className="bg-[var(--bg-main)]/50 border border-[var(--border-main)] p-6 rounded-[2rem] shadow-[var(--shadow-sm)] hover:border-indigo-500/20 transition-all group/stat">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover/stat:scale-110 shadow-[var(--shadow-sm)]", card.iconBg, card.iconColor, 'border-current/20')}>
                                                        <card.icon size={20} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic">{card.label}</p>
                                                </div>
                                                <p className={clsx("text-4xl font-black tracking-tighter uppercase italic", card.valueColor || 'text-[var(--text-bright)]')}>{card.value}</p>
                                                {card.bar !== undefined && (
                                                    <div className="w-full h-2 bg-[var(--bg-card)] rounded-full mt-4 overflow-hidden border border-[var(--border-main)] shadow-inner">
                                                        <div className={clsx("h-full rounded-full transition-all duration-1000", card.barColor)} style={{ width: `${card.bar}%` }} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Recruiter Pitch */}
                                    {selectedStudent.profile?.recruiterPitch && (
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] p-8 flex gap-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700" />
                                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0 shadow-[var(--shadow-sm)] group-hover:scale-110 transition-transform">
                                                <Quote size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 italic">Professional Persona Pitch</h3>
                                                <p className="text-[var(--text-bright)] italic font-medium leading-relaxed text-base">
                                                    "{selectedStudent.profile.recruiterPitch}"
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects + Timeline */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Projects */}
                                        <div className="bg-[var(--bg-main)]/30 p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                            <h3 className="text-[10px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                                                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-[var(--shadow-sm)]">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                Candidate Innovations
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedStudent.profile?.projects?.length > 0 ? (
                                                    selectedStudent.profile.projects.map((proj, i) => (
                                                        <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-indigo-500/40 p-6 rounded-2xl transition-all shadow-[var(--shadow-sm)] group/project">
                                                            <h4 className="text-[var(--text-bright)] font-black text-sm uppercase tracking-tight italic group-hover/project:text-indigo-400 transition-colors">{proj.title}</h4>
                                                            <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium leading-relaxed line-clamp-2">{proj.description}</p>
                                                            {proj.aiAudit?.isVerified && (
                                                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl shadow-[var(--shadow-sm)]">
                                                                    <ShieldCheck size={12} className="text-emerald-400" />
                                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                                                        AI Audited: {proj.aiAudit.verificationToken?.substring(0, 8)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No Projects Uploaded</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Application Timeline */}
                                        <div className="bg-[var(--bg-main)]/30 p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                            <h3 className="text-[10px] font-black text-[var(--text-bright)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                                                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-[var(--shadow-sm)]">
                                                    <Clock size={18} />
                                                </div>
                                                Career Progression
                                            </h3>
                                            <div className="space-y-4">
                                                {performance.applications.length > 0 ? (
                                                    performance.applications.map((app, i) => (
                                                        <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-2xl flex items-center justify-between gap-4 shadow-[var(--shadow-sm)] hover:border-indigo-500/20 transition-all group/app">
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className="w-12 h-12 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] font-black text-lg border border-[var(--border-main)] shrink-0 shadow-[var(--shadow-sm)] group-hover/app:scale-110 transition-transform italic">
                                                                    {app.company?.charAt(0) || '?'}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-black text-[var(--text-bright)] uppercase tracking-tight truncate italic group-hover/app:text-indigo-400 transition-colors">{app.jobTitle || 'Removed Job'}</p>
                                                                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest truncate opacity-60 mt-1 italic">{app.company || 'Unknown'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <span className={clsx(
                                                                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-[var(--shadow-sm)]",
                                                                    app.status === 'OFFER_ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                        app.status === 'FACULTY_APPROVED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                                            'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-main)]'
                                                                )}>
                                                                    {app.status?.replace(/_/g, ' ')}
                                                                </span>
                                                                <p className="text-[8px] text-[var(--text-muted)] font-black mt-2 uppercase tracking-widest opacity-40 italic">{new Date(app.updatedAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No Applications Yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-600 text-sm font-bold uppercase tracking-widest">
                                    No performance data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyStudents;
