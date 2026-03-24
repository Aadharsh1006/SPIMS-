// frontend/src/pages/tpo/TPOStudents.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, UserX, FileText, Quote, Zap, Code, X } from 'lucide-react';
import { tpoApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const TPOStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('ALL');
    const [dossierStudent, setDossierStudent] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [skillFilter, setSkillFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredStudents.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredStudents.map(s => s._id));
        }
    };

    const handleBulkVerify = async (status) => {
        try {
            await tpoApi.bulkVerify(selectedIds, status);
            toast.success(`Successfully updated ${selectedIds.length} students`);
            setSelectedIds([]);
            loadStudents();
        } catch (err) {
            toast.error('Bulk verification failed');
        }
    };

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
            { met: profile.achievements?.length > 0, weight: 5 },
        ];
        return Math.round(sections.reduce((acc, s) => acc + (s.met ? s.weight : 0), 0));
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const res = await tpoApi.getStudents();
            setStudents(res.data.filter(u => u.role === 'STUDENT'));
        } catch (err) {
            console.error('Failed to load students', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            await tpoApi.verifyStudent(id, status);
            toast.success('Student status updated successfully');
            loadStudents();
        } catch (err) {
            toast.error('Failed to update student status');
        }
    };

    const departments = ['ALL', ...new Set(students.map(s => s.profile?.department).filter(Boolean))];

    const filteredStudents = students
        .filter(s => {
            const matchesSearch =
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.profile?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = selectedDept === 'ALL' || s.profile?.department === selectedDept;
            const matchesSkill = !skillFilter || s.profile?.skills?.some(skill =>
                skill.toLowerCase().includes(skillFilter.toLowerCase())
            );
            return matchesSearch && matchesDept && matchesSkill;
        })
        .sort((a, b) => {
            if (sortBy === 'cgpa_desc') return (b.profile?.cgpa || 0) - (a.profile?.cgpa || 0);
            if (sortBy === 'cgpa_asc') return (a.profile?.cgpa || 0) - (b.profile?.cgpa || 0);
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            return 0;
        });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-indigo-500 rounded-lg animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Gathering Candidate Intelligence...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic">
                            Candidate <span className="text-indigo-400">Inventory</span>
                        </h1>
                        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60 italic">Manage and verify student personas for precision placement.</p>
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20 animate-in zoom-in duration-300">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mr-2">{selectedIds.length} Selected</span>
                            <button
                                onClick={() => handleBulkVerify(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Approve All
                            </button>
                            <button
                                onClick={() => handleBulkVerify(false)}
                                className="px-4 py-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                            >
                                Revoke All
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform" size={16} />
                        <input
                            type="text"
                            placeholder="Scan by name/ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--bg-main)] border border-[var(--border-main)] pl-12 pr-6 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-xs font-black uppercase tracking-tight text-[var(--text-bright)] placeholder:text-[var(--text-muted)] placeholder:opacity-30 transition-all shadow-[var(--shadow-sm)] italic"
                        />
                    </div>
                    <div className="relative group">
                        <Code className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/60" size={16} />
                        <input
                            type="text"
                            placeholder="Skill filter..."
                            value={skillFilter}
                            onChange={(e) => setSkillFilter(e.target.value)}
                            className="bg-[var(--bg-main)] border border-[var(--border-main)] pl-12 pr-6 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 w-48 text-xs font-black uppercase tracking-tight text-[var(--text-bright)] placeholder:text-[var(--text-muted)] placeholder:opacity-30 transition-all shadow-[var(--shadow-sm)] italic"
                        />
                    </div>
                    <div className="relative group">
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="bg-[var(--bg-main)] border border-[var(--border-main)] pl-6 pr-12 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] cursor-pointer shadow-[var(--shadow-sm)] italic w-44"
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept === 'ALL' ? 'All Matrices' : `${dept} UNIT`}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500/60 pointer-events-none" size={16} />
                    </div>
                    <div className="relative group">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-[var(--bg-main)] border border-[var(--border-main)] pl-6 pr-12 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] cursor-pointer shadow-[var(--shadow-sm)] italic w-52"
                        >
                            <option value="name">Sort: Persona A-Z</option>
                            <option value="cgpa_desc">Sort: Elite CGPA</option>
                            <option value="cgpa_asc">Sort: Entry CGPA</option>
                        </select>
                        <Zap className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </header>

            {/* Table */}
            <div className="bg-[var(--bg-card)] rounded-[3rem] shadow-[var(--shadow-lg)] border border-[var(--border-main)] overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-main)]/50 border-b border-[var(--border-main)]">
                            <tr>
                                <th className="p-8 w-14">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-[var(--border-main)] text-indigo-600 focus:ring-indigo-500 bg-[var(--bg-main)] shadow-inner cursor-pointer"
                                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic opacity-50">Candidate Descriptor</th>
                                <th className="p-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic opacity-50">Structural Unit</th>
                                <th className="p-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic opacity-50">Competency Matrix</th>
                                <th className="p-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic opacity-50 text-right">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-main)]/50">
                            {filteredStudents.map(s => (
                                <tr key={s._id} className={clsx('hover:bg-[var(--bg-main)]/40 transition-all duration-500 group/row', selectedIds.includes(s._id) && 'bg-indigo-500/5')}>
                                    <td className="p-8">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-[var(--border-main)] text-indigo-600 focus:ring-indigo-500 bg-[var(--bg-main)] shadow-inner cursor-pointer"
                                            checked={selectedIds.includes(s._id)}
                                            onChange={() => toggleSelect(s._id)}
                                        />
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 uppercase text-sm shadow-[var(--shadow-sm)] group-hover/row:scale-110 group-hover/row:rotate-3 transition-all duration-500">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-[var(--text-bright)] group-hover/row:text-indigo-400 transition-colors uppercase tracking-tight italic text-base">{s.name}</div>
                                                <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-1 opacity-50 italic">{s.profile?.rollNumber || 'UNDEF_ID'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-[0.2em] italic">{s.profile?.department || 'Cross-Functional'}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] font-black italic lowercase mt-1 opacity-50">{s.email}</p>
                                    </td>
                                    <td className="p-8">
                                        <div className="space-y-4 w-52">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-40 italic">Academic</div>
                                                <div className="flex-1 h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)] shadow-inner">
                                                    <div className="h-full bg-[var(--text-muted)] opacity-30 rounded-full" style={{ width: `${(s.profile?.cgpa || 0) * 10}%` }} />
                                                </div>
                                                <span className="font-black text-[var(--text-bright)] text-[10px] w-8 text-right italic">{(s.profile?.cgpa || 0).toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] italic">Readiness</div>
                                                <div className="flex-1 h-1.5 bg-indigo-500/5 rounded-full overflow-hidden border border-indigo-500/10 shadow-inner">
                                                    <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${calculateProfileStrength(s.profile)}%` }} />
                                                </div>
                                                <span className="font-black text-indigo-400 text-[10px] w-8 text-right italic">{calculateProfileStrength(s.profile)}%</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">Protocol</div>
                                                <div className="flex-1 h-1.5 bg-emerald-500/5 rounded-full overflow-hidden border border-emerald-500/10 shadow-inner">
                                                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${s.profile?.atsScore || 0}%` }} />
                                                </div>
                                                <span className="font-black text-emerald-400 text-[10px] w-8 text-right italic">{s.profile?.atsScore || 0}%</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => setDossierStudent(s)}
                                                className="inline-flex items-center gap-3 p-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] bg-[var(--bg-main)] hover:bg-indigo-500/10 hover:text-indigo-400 border border-[var(--border-main)] hover:border-indigo-500/30 transition-all shadow-[var(--shadow-sm)] italic"
                                            >
                                                <FileText size={16} /> Dossier
                                            </button>
                                            <button
                                                onClick={() => handleVerify(s._id, !s.isActive)}
                                                className={clsx(
                                                    'inline-flex items-center gap-3 p-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 italic',
                                                    s.isActive
                                                        ? 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 border border-[var(--border-main)] hover:border-red-500/30'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20 border border-white/10'
                                                )}
                                            >
                                                {s.isActive ? <><UserX size={16} /> De-Matrix</> : <><ShieldCheck size={16} /> Synchronize</>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredStudents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 opacity-30 select-none">
                        <UserX size={48} className="text-[var(--text-muted)] mb-6" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">Candidate pattern not recognized within current filter parameters.</p>
                    </div>
                )}
            </div>

            {/* Student Dossier Modal */}
            {dossierStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-[var(--bg-main)]/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3.5rem] w-full max-w-4xl max-h-full overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-transparent to-indigo-600 opacity-20" />
                        
                        {/* Modal Header */}
                        <div className="p-10 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-main)]/30">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-600/30 border border-white/10 italic">
                                    {dossierStudent.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic">Candidate Dossier</h2>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 italic shadow-indigo-500/20">
                                        SECURE_ID: {dossierStudent.profile?.rollNumber || 'UNDEF_HEX'} • {dossierStudent.profile?.department} MATRIX
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDossierStudent(null)}
                                className="w-14 h-14 bg-[var(--bg-main)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 rounded-[1.5rem] border border-[var(--border-main)] flex items-center justify-center transition-all duration-300 shadow-[var(--shadow-sm)] active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-gradient-to-b from-[var(--bg-main)]/20 to-transparent">
                            {/* Recruiter Pitch */}
                            {dossierStudent.profile?.recruiterPitch ? (
                                <div className="bg-[var(--bg-main)] border border-indigo-500/20 rounded-[2.5rem] p-8 shadow-[var(--shadow-inner)] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Quote size={80} className="rotate-12" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                                        Strategic Summary
                                    </h3>
                                    <p className="text-[var(--text-bright)] font-bold italic leading-[1.8] text-sm relative z-10">
                                        "{dossierStudent.profile.recruiterPitch}"
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-[var(--bg-main)] border border-[var(--border-main)] text-center p-12 rounded-[2.5rem] text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.3em] italic opacity-30 shadow-inner">
                                    Candidate executive summary payload not yet generated.
                                </div>
                            )}

                            {/* Skills */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 flex items-center gap-3 italic opacity-60">
                                    <Zap size={16} className="text-indigo-400" /> Competency Matrix
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {dossierStudent.profile?.skills?.length
                                        ? dossierStudent.profile.skills.map(skill => (
                                            <span key={skill} className="px-5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-bright)] rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] shadow-[var(--shadow-sm)] hover:border-indigo-500/50 transition-all cursor-default italic">
                                                {skill}
                                            </span>
                                        ))
                                        : <div className="text-[var(--text-muted)] italic text-sm opacity-30">Skills matrix unpopulated.</div>
                                    }
                                </div>
                            </div>

                            {/* Projects */}
                            <div className="space-y-6 pb-10">
                                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 flex items-center gap-3 italic opacity-60">
                                    <Code size={16} className="text-indigo-400" /> Verified Project Architectures
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dossierStudent.profile?.projects?.length > 0
                                        ? dossierStudent.profile.projects.map((proj, i) => (
                                            <div key={i} className="bg-[var(--bg-main)] border border-[var(--border-main)] p-7 rounded-[2rem] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-500 group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-black text-[var(--text-bright)] uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">{proj.title}</h4>
                                                    {proj.aiAudit?.isVerified && (
                                                        <div className="flex items-center gap-2 p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                            <ShieldCheck size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-[var(--text-muted)] line-clamp-3 italic leading-relaxed font-bold opacity-60">{proj.description}</p>
                                                {proj.aiAudit?.isVerified && (
                                                    <div className="mt-6 pt-6 border-t border-[var(--border-main)] flex flex-col gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">System Token</span>
                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{proj.aiAudit.verificationToken?.substring(0, 8)}...</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Complexity Delta</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-1 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-main)]">
                                                                    <div className="h-full bg-indigo-500" style={{ width: `${proj.aiAudit.complexityScore}%` }} />
                                                                </div>
                                                                <span className="text-[9px] font-black text-indigo-400 italic">{proj.aiAudit.complexityScore}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                        : (
                                            <div className="col-span-2 flex flex-col items-center justify-center p-16 border-2 border-dashed border-[var(--border-main)] rounded-[3rem] opacity-30 select-none">
                                                <Code size={40} className="mb-4" />
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] italic text-center">No verified technical architectures found in project registry.</p>
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

export default TPOStudents;
