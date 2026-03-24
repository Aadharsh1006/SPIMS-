// frontend/src/pages/alumni/AlumniNetwork.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, MessageSquare, Zap, Users, X, Quote, Code, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const AlumniNetwork = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSkill, setFilterSkill] = useState('');
    const [dossierStudent, setDossierStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await usersApi.getStudents();
                const data = response.data || [];
                const activeStudents = Array.isArray(data) ? data.filter(s => s.isActive !== false) : [];
                setStudents(activeStudents);
            } catch (error) {
                console.error('Alumni Network: Failed to fetch students', error);
                toast.error('Failed to load student directory');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.profile?.department?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkill =
            filterSkill === '' ||
            (student.profile?.skills || []).some(s => s.toLowerCase().includes(filterSkill.toLowerCase()));
        return matchesSearch && matchesSkill;
    });

    const handleMessage = () => {
        navigate('/alumni/messages');
        toast.success('Find the student in your channels to start a conversation');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                <div className="relative">
                    <div className="h-16 w-16 rounded-2xl border-4 border-cyan-500/10 border-t-cyan-500 animate-spin shadow-[var(--shadow-md)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-6 w-6 bg-cyan-500 rounded-lg animate-pulse"></div>
                    </div>
                </div>
                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] animate-pulse italic">Accessing Matrix Directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">

            {/* Header */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-10 text-[var(--text-bright)] relative overflow-hidden shadow-[var(--shadow-xl)] group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 group-hover:text-cyan-500 transition-all duration-700">
                    <Users size={220} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Talent Directory
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">Live Feed</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-[var(--text-bright)] tracking-tighter leading-none uppercase italic mb-4">
                        Matrix <span className="text-cyan-400">Directory</span>
                    </h1>
                    <p className="text-[var(--text-muted)] font-bold max-w-xl text-sm md:text-base italic opacity-80 leading-relaxed">
                        Discover current students, review their portfolios, and proactively offer mentorship or referrals to shape the next generation.
                    </p>
                    <div className="mt-8 flex items-center gap-2">
                        <div className="h-0.5 w-12 bg-cyan-500"></div>
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] italic">
                            {filteredStudents.length} Active Nodes Synchronized
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-cyan-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or department..."
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[1.5rem] py-4 pl-14 pr-6 text-sm text-[var(--text-bright)] focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] italic shadow-[var(--shadow-sm)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-80 group">
                    <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Filter by skill..."
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[1.5rem] py-4 pl-14 pr-6 text-sm text-[var(--text-bright)] focus:ring-2 focus:ring-amber-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] italic shadow-[var(--shadow-sm)]"
                        value={filterSkill}
                        onChange={(e) => setFilterSkill(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                        <div
                            key={student._id}
                            className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] p-8 flex flex-col hover:border-cyan-500/40 transition-all shadow-[var(--shadow-xl)] group/card relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:scale-110 group-hover/card:text-cyan-500 transition-all duration-700 pointer-events-none">
                                <GraduationCap size={120} />
                            </div>
                            
                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-16 h-16 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center text-cyan-400 border border-[var(--border-main)] font-black text-2xl shadow-[var(--shadow-md)] shrink-0 group-hover/card:rotate-6 transition-transform">
                                        {student.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[var(--text-bright)] font-black text-lg truncate uppercase italic leading-tight group-hover/card:text-cyan-400 transition-colors">{student.name}</h3>
                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest truncate mt-1 italic opacity-60">
                                            {student.profile?.department || 'Unassigned Sector'}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 flex items-center gap-2 shrink-0 ml-3">
                                    <ShieldCheck size={14} className="text-cyan-400" />
                                    <span className="text-[9px] font-black text-cyan-400 uppercase italic">
                                        {student.profile?.year || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 relative z-10">
                                <div>
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-3 italic opacity-50">Technical Stack</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(student.profile?.skills || []).slice(0, 4).map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-lg text-[9px] font-black text-[var(--text-bright)] uppercase tracking-wider italic">
                                                {skill}
                                            </span>
                                        ))}
                                        {student.profile?.skills?.length > 4 && (
                                            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[9px] font-black text-cyan-400 uppercase italic">
                                                +{student.profile.skills.length - 4}
                                            </span>
                                        )}
                                        {!(student.profile?.skills?.length > 0) && (
                                            <span className="text-[10px] text-[var(--text-muted)] italic font-bold opacity-30 uppercase tracking-widest">No spectral data detected</span>
                                        )}
                                    </div>
                                </div>

                                {student.profile?.careerPaths?.length > 0 && (
                                    <div className="p-4 bg-[var(--bg-main)]/30 rounded-2xl border border-[var(--border-main)]">
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2 italic opacity-50">Career Trajectory</p>
                                        <p className="text-xs text-cyan-400 font-black uppercase italic tracking-tight">
                                            {student.profile.careerPaths[0]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 mt-8 border-t border-[var(--border-main)] flex gap-4 relative z-10">
                                <button
                                    onClick={() => setDossierStudent(student)}
                                    className="flex-1 flex items-center justify-center gap-3 bg-[var(--bg-main)] hover:bg-cyan-500/10 text-[var(--text-bright)] hover:text-cyan-400 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--border-main)] hover:border-cyan-500/40 active:scale-95 italic"
                                >
                                    <FileText size={16} /> Details
                                </button>
                                <button
                                    onClick={() => handleMessage(student._id)}
                                    className="flex-1 flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-cyan-600/20 active:scale-95 italic group/btn"
                                >
                                    <MessageSquare size={16} /> Message
                                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center border-4 border-dashed border-[var(--border-main)] rounded-[3rem] bg-[var(--bg-main)]/10">
                        <div className="w-20 h-20 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center mx-auto mb-8 text-[var(--text-muted)] border border-[var(--border-main)] opacity-30 shadow-[var(--shadow-sm)]">
                            <Users size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic mb-3">No Nodes Detected</h3>
                        <p className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-[0.2em] italic max-w-xs mx-auto opacity-60">Try recalibrating your search parameters or skill filters.</p>
                    </div>
                )}
            </div>
            
            {/* Student Dossier Modal */}
            {dossierStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-[var(--shadow-2xl)] relative">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-cyan-500">
                            <Quote size={200} />
                        </div>
                        
                        {/* Modal Header */}
                        <div className="p-10 border-b border-[var(--border-main)] flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-cyan-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl italic shadow-xl shadow-cyan-600/30">
                                    {dossierStudent.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[8px] font-black uppercase tracking-widest text-cyan-400 italic">Verified Identity</span>
                                        <span className="px-2 py-0.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-md text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">{dossierStudent.profile?.year || 'N/A'} Academic Cycle</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic leading-none">{dossierStudent.name}</h2>
                                    <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] mt-2 italic opacity-80">
                                        {dossierStudent.profile?.department} Specialist
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDossierStudent(null)}
                                className="w-14 h-14 bg-[var(--bg-main)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 rounded-2xl flex items-center justify-center border border-[var(--border-main)] hover:border-red-500/20 transition-all active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-[var(--bg-main)]/20 text-left relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-main) transparent' }}>
                            {/* Student Pitch */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] p-8 relative overflow-hidden shadow-[var(--shadow-sm)] group/pitch">
                                <div className="absolute top-0 right-0 p-6 opacity-5 text-cyan-500 rotate-12 transition-transform group-hover/pitch:rotate-0">
                                    <Quote size={80} />
                                </div>
                                <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                                    <Quote size={14} className="opacity-50" /> Dossier Summary
                                </h3>
                                <p className="text-[var(--text-bright)] font-bold italic leading-relaxed text-sm md:text-base opacity-90">
                                    {dossierStudent.profile?.recruiterPitch ? `"${dossierStudent.profile.recruiterPitch}"` : "Dossier summary pending synchronization with candidate profile."}
                                </p>
                            </div>

                            {/* Skills */}
                            <div>
                                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic opacity-60">
                                    <Zap size={14} className="text-amber-400" /> Talent Spectrum
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {dossierStudent.profile?.skills?.length
                                        ? dossierStudent.profile.skills.map(skill => (
                                            <span key={skill} className="px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-bright)] rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-[var(--shadow-sm)] hover:border-cyan-500/30 transition-colors">
                                                {skill}
                                            </span>
                                        ))
                                        : <span className="text-[var(--text-muted)] italic font-bold text-xs uppercase opacity-30 tracking-widest">No spectrum data available</span>
                                    }
                                </div>
                            </div>

                            {/* Projects */}
                            <div className="pb-6">
                                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic opacity-60">
                                    <Code size={14} className="text-indigo-400" /> Technical Portfolio
                                </h3>
                                <div className="space-y-6">
                                    {dossierStudent.profile?.projects?.length > 0
                                        ? dossierStudent.profile.projects.map((proj, i) => (
                                            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2rem] shadow-[var(--shadow-md)] hover:border-indigo-500/30 transition-all group/proj">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-black text-[var(--text-bright)] text-xl italic uppercase tracking-tight group-hover/proj:text-indigo-400 transition-colors">{proj.title}</h4>
                                                    {proj.aiAudit?.isVerified && (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 shadow-sm animate-pulse">
                                                            <ShieldCheck size={14} />
                                                            <span className="text-[8px] font-black uppercase tracking-widest italic">Core Verified</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-[var(--text-muted)] font-bold italic leading-relaxed opacity-80">{proj.description}</p>
                                                {proj.aiAudit?.isVerified && (
                                                    <div className="mt-6 pt-6 border-t border-[var(--border-main)] flex flex-wrap items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Artifact Hash</span>
                                                            <span className="text-[9px] font-black text-[var(--text-bright)] font-mono bg-[var(--bg-main)] px-3 py-1 rounded-lg border border-[var(--border-main)]">
                                                                {proj.aiAudit.verificationToken?.substring(0, 24)}...
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Complexity Matrix</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-24 h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)]">
                                                                    <div 
                                                                        className="h-full bg-indigo-500 transition-all duration-1000" 
                                                                        style={{ width: `${proj.aiAudit.complexityScore}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-black text-indigo-400 italic">
                                                                    {proj.aiAudit.complexityScore}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                        : (
                                            <div className="text-center py-12 bg-[var(--bg-main)]/50 border-2 border-dashed border-[var(--border-main)] rounded-[2.5rem] group/empty">
                                                <Code size={40} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20 group-hover/empty:scale-110 transition-transform" />
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic opacity-40">No verified artifacts in technical repository</p>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumniNetwork;
