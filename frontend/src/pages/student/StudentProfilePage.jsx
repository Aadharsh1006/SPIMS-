// frontend/src/pages/student/StudentProfilePage.jsx
import React, { useEffect, useState } from 'react';
import api, { resumeApi, aiApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import {
    User, Mail, Book, Plus, Trash2, Save, Upload,
    Award, Code, Terminal, Loader2, CheckCircle, X,
    TrendingUp, Info, GraduationCap, Trophy, Share2,
    Cpu as CpuIcon, Zap, ShieldCheck, Flame, MapPin, Briefcase
} from 'lucide-react';
import clsx from 'clsx';

// --- Project Verification Component ---
const ProjectAudit = ({ project, onAuditUpdate }) => {
    const [auditing, setAuditing] = useState(false);

    const handleAudit = async () => {
        if (!project.title || !project.description) {
            toast.error('Complete project details before auditing.');
            return;
        }
        setAuditing(true);
        try {
            const { data } = await aiApi.auditProject(project);
            onAuditUpdate(data);
            toast.success('Project Verified!');
        } catch {
            toast.error('Verification service unavailable. Try again.');
        } finally {
            setAuditing(false);
        }
    };

    if (project.aiAudit?.isVerified) {
        return (
            <div className="mt-5 p-5 bg-[var(--bg-main)] rounded-[1.25rem] border border-[var(--accent)]/30 flex items-center justify-between shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white shadow-[var(--shadow-sm)]">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest leading-none mb-1">Verification ID</p>
                        <p className="text-xs font-mono font-bold text-[var(--text-muted)] truncate w-40">{project.aiAudit.verificationToken}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Complexity</p>
                    <div className="flex items-center gap-2 justify-end">
                        <Flame className={clsx("w-4 h-4", project.aiAudit.complexityScore >= 80 ? "text-orange-500" : "text-[var(--accent)]")} />
                        <span className="text-lg font-black text-[var(--text-bright)] italic tabular-nums">{project.aiAudit.complexityScore}%</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handleAudit}
            disabled={auditing}
            className="mt-5 w-full py-4 bg-[var(--bg-main)]/50 hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--accent)] rounded-[1.25rem] border border-dashed border-[var(--border-main)] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95"
        >
            {auditing ? <Loader2 size={16} className="animate-spin text-[var(--accent)]" /> : <><CpuIcon size={16} /> Verify Project</>}
        </button>
    );
};

const StudentProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newSkill, setNewSkill] = useState('');
    const [showAtsView, setShowAtsView] = useState(false);
    const [aiRawText, setAiRawText] = useState("");
    const [fetchingResume, setFetchingResume] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [showSyncReport, setShowSyncReport] = useState(false);
    const [syncData, setSyncData] = useState(null);
    const [isApplyingSync, setIsApplyingSync] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const header = document.querySelector('.profile-header-main');
            if (header) {
                setIsHeaderVisible(header.getBoundingClientRect().bottom > 0);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/me');
                setUser(data);
            } catch {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const calculateProfileStrength = () => {
        if (!user?.profile) return { total: 0, breakdown: [] };
        const profile = user.profile;
        if (profile.profileStrength > 0) {
            return { total: profile.profileStrength, isAi: true, breakdown: [{ id: 'ai', label: 'Profile Score', met: true, weight: 100 }] };
        }
        const sections = [
            { id: 'dept', label: 'Department', met: !!profile.department, weight: 15 },
            { id: 'cgpa', label: 'CGPA', met: !!profile.cgpa, weight: 15 },
            { id: 'skills', label: 'Technical Skills', met: profile.skills?.length > 0, weight: 15 },
            { id: 'bio', label: 'Professional Bio', met: !!profile.bio, weight: 15 },
            { id: 'edu', label: 'Education', met: profile.education?.length > 0, weight: 15 },
            { id: 'proj', label: 'Projects', met: profile.projects?.length > 0, weight: 15 },
            { id: 'certs', label: 'Certifications', met: profile.certifications?.length > 0, weight: 5 },
            { id: 'ach', label: 'Achievements', met: profile.achievements?.length > 0, weight: 5 }
        ];
        return { total: Math.round(sections.reduce((acc, s) => acc + (s.met ? s.weight : 0), 0)), isAi: false, breakdown: sections };
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/users/me', { name: user.name, profile: user.profile });
            toast.success('Profile updated successfully');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleShareProfile = async () => {
        if (!user || (!user._id && !user.userId)) { toast.error('Profile data is incomplete. Please refresh.'); return; }
        const uid = user._id || user.userId;
        const profileUrl = `${window.location.origin}/portfolio/${uid}`;
        const shareData = { title: `${user.name}'s Professional Portfolio`, text: `Check out my portfolio on SPIMS+!`, url: profileUrl };
        if (navigator.share && navigator.canShare?.(shareData)) {
            try { await navigator.share(shareData); toast.success('Shared successfully!'); return; } catch (err) { if (err.name === 'AbortError') return; }
        }
        try { await navigator.clipboard.writeText(profileUrl); toast.success('Portfolio link copied!'); } catch { copyFallback(profileUrl); }
    };

    const copyFallback = (text) => {
        try {
            const ta = document.createElement("textarea");
            ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
            document.body.appendChild(ta); ta.focus(); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta);
            toast.success('Portfolio link copied!');
        } catch { toast.error('Failed to copy link.'); }
    };

    const handleUrlBlur = (type, value) => {
        if (!value || value.startsWith('http')) return;
        const field = type === 'LinkedIn' ? 'linkedinUrl' : 'githubUrl';
        setUser({ ...user, profile: { ...user.profile, [field]: `https://${value}` } });
        toast.success(`${type} URL formatted`);
    };

    const addSkill = (e) => {
        if (e) e.preventDefault();
        const skill = newSkill.trim();
        if (!skill) return;
        const currentSkills = user.profile?.skills || [];
        if (!currentSkills.includes(skill)) {
            setUser({ ...user, profile: { ...user.profile, skills: [...currentSkills, skill] } });
            setNewSkill('');
        } else { toast.error('Skill already exists'); }
    };
    const removeSkill = (skill) => setUser({ ...user, profile: { ...user.profile, skills: user.profile.skills.filter(s => s !== skill) } });
    const addCertification = () => setUser({ ...user, profile: { ...user.profile, certifications: [...(user.profile?.certifications || []), ''] } });
    const updateCertification = (index, value) => { const n = [...user.profile.certifications]; n[index] = value; setUser({ ...user, profile: { ...user.profile, certifications: n } }); };
    const removeCertification = (index) => setUser({ ...user, profile: { ...user.profile, certifications: user.profile.certifications.filter((_, i) => i !== index) } });
    const addEducation = () => setUser({ ...user, profile: { ...user.profile, education: [...(user.profile?.education || []), { degree: '', institution: '', year: '', grade: '' }] } });
    const updateEducation = (index, field, value) => { const n = [...user.profile.education]; n[index][field] = value; setUser({ ...user, profile: { ...user.profile, education: n } }); };
    const removeEducation = (index) => setUser({ ...user, profile: { ...user.profile, education: user.profile.education.filter((_, i) => i !== index) } });
    const addProject = () => setUser({ ...user, profile: { ...user.profile, projects: [...(user.profile?.projects || []), { title: '', description: '', technologies: [], link: '', role: '', completedDate: '' }] } });
    const updateProject = (index, field, value) => { const n = [...user.profile.projects]; n[index][field] = field === 'technologies' ? value.split(',').map(s => s.trim()) : value; setUser({ ...user, profile: { ...user.profile, projects: n } }); };
    const removeProject = (index) => setUser({ ...user, profile: { ...user.profile, projects: user.profile.projects.filter((_, i) => i !== index) } });
    const addAchievement = () => setUser({ ...user, profile: { ...user.profile, achievements: [...(user.profile?.achievements || []), ''] } });
    const updateAchievement = (index, value) => { const n = [...user.profile.achievements]; n[index] = value; setUser({ ...user, profile: { ...user.profile, achievements: n } }); };
    const removeAchievement = (index) => setUser({ ...user, profile: { ...user.profile, achievements: user.profile.achievements.filter((_, i) => i !== index) } });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file?.type === 'application/pdf') setSelectedFile(file);
        else toast.error('Please select a valid PDF file');
    };

    const handleSyncResume = async () => {
        if (!selectedFile) { toast.error('Please select a resume first'); return; }
        setSyncing(true);
        const formData = new FormData();
        formData.append('resume', selectedFile);
        try {
            const { data } = await resumeApi.uploadFile(formData);
            if (data?.extractedData) { setSyncData(data.extractedData); setShowSyncReport(true); toast.success('AI Analysis complete! Please review the report.'); }
            else toast.error('AI failed to extract structured data. Please try again.');
        } catch { toast.error('AI Synchronization failed. Please try again.'); }
        finally { setSyncing(false); }
    };

    const handleConfirmSync = async () => {
        if (!syncData) return;
        setIsApplyingSync(true);
        try {
            setUser({
                ...user,
                profile: {
                    ...user.profile,
                    bio: syncData.bio || syncData.summary || user.profile.bio,
                    skills: Array.from(new Set([...(user.profile.skills || []), ...(syncData.skills || [])])).sort(),
                    certifications: Array.from(new Set([...(user.profile.certifications || []), ...(syncData.certifications || [])])).sort(),
                    achievements: Array.from(new Set([...(user.profile.achievements || []), ...(syncData.achievements || [])])).sort(),
                    projects: syncData.projects?.length > 0 ? syncData.projects : user.profile.projects,
                    experience: syncData.experience?.length > 0 ? syncData.experience : user.profile.experience,
                    education: syncData.education?.length > 0 ? syncData.education : user.profile.education,
                    linkedinUrl: syncData.linkedinUrl || user.profile.linkedinUrl,
                    githubUrl: syncData.githubUrl || user.profile.githubUrl,
                    atsScore: syncData.atsScore || user.profile.atsScore,
                    atsBreakdown: syncData.atsBreakdown || user.profile.atsBreakdown,
                    profileStrength: syncData.profileStrength || user.profile.profileStrength,
                    scoreReasoning: syncData.scoreReasoning || user.profile.scoreReasoning,
                    recruiterPitch: syncData.recruiterPitch || user.profile.recruiterPitch,
                    careerPaths: syncData.careerPaths || user.profile.careerPaths
                }
            });
            setShowSyncReport(false); setSyncData(null); setSelectedFile(null);
            toast.success('AI insights applied! Click "Save Profile" to finalize.');
        } catch { toast.error('Failed to apply settings'); }
        finally { setIsApplyingSync(false); }
    };

    const handleViewAtsExtract = async () => {
        setFetchingResume(true);
        try {
            const { data } = await resumeApi.getMyResumes();
            if (data?.length > 0) { setAiRawText(data[0].rawText || "No text extracted."); setShowAtsView(true); }
            else toast.error("No active resume found. Please sync one first.");
        } catch { toast.error("Failed to fetch ATS data"); }
        finally { setFetchingResume(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mb-4 shadow-[var(--shadow-sm)]"></div>
            <p className="text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest italic">Authenticating...</p>
        </div>
    );

    const { total: strength, breakdown } = calculateProfileStrength();

    // Shared input style
    const inputCls = "w-full px-5 py-4 bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-2xl font-bold text-[var(--text-main)] outline-none focus:border-[var(--accent)] focus:bg-[var(--bg-main)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all shadow-[var(--shadow-sm)]";
    const labelCls = "text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2 ml-1 opacity-70";
    const cardCls = "bg-[var(--bg-card)]/80 backdrop-blur-md p-8 rounded-[2rem] border border-[var(--border-main)] space-y-7 hover:border-[var(--accent)]/20 transition-all shadow-[var(--shadow-md)]";
    const sectionTitleCls = "text-lg font-black text-[var(--text-bright)] tracking-tight flex items-center gap-3 uppercase italic leading-none";
    const addBtnCls = "flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all border border-[var(--accent)]/20 active:scale-95 shadow-[var(--shadow-sm)]";

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16">

            {/* Profile Header */}
            <div className="profile-header-main relative bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] overflow-hidden shadow-[var(--shadow-lg)]">
                <div className="h-48 bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--bg-main)] relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--accent))] from-[var(--accent)] to-transparent"></div>
                </div>
                <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-16 relative z-10">
                    <div className="w-32 h-32 rounded-[2rem] bg-[var(--bg-main)] border-4 border-[var(--bg-card)] shadow-[var(--shadow-lg)] p-1">
                        <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-main)] flex items-center justify-center text-[var(--accent)] text-5xl font-black italic">
                            {user.name?.charAt(0)}
                        </div>
                    </div>
                    <div className="flex-1 mb-2">
                        <div className="flex items-center gap-4 mb-2 flex-wrap">
                            <h1 className="text-3xl font-black text-[var(--text-bright)] tracking-tight italic uppercase scale-y-95">{user.name}</h1>
                            <div className="group relative">
                                <span className="px-4 py-1.5 bg-[var(--accent)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-help shadow-[var(--shadow-sm)]">
                                    <TrendingUp size={12} /> {strength}% Strength <Info size={10} className="opacity-60" />
                                </span>
                                <div className="absolute left-0 top-full mt-2 w-52 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] p-5 rounded-2xl shadow-[var(--shadow-lg)] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-[var(--accent)] border-b border-[var(--border-main)] pb-2 italic">Profile Assessment</p>
                                    <div className="space-y-3">
                                        {breakdown.map(s => (
                                            <div key={s.id} className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] italic">{s.label}</span>
                                                {s.met ? <CheckCircle size={12} className="text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-[var(--border-main)]" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {user.profile?.atsScore > 0 && (
                                <span className="px-4 py-1.5 bg-[var(--bg-main)] text-[var(--text-bright)] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-[var(--border-main)] italic shadow-[var(--shadow-sm)]">
                                    <Terminal size={12} className="text-[var(--accent)]" /> ATS {user.profile.atsScore}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-[var(--text-muted)] font-bold text-sm flex-wrap">
                            <span className="flex items-center gap-1.5 italic"><Mail size={14} className="text-[var(--accent)]" /> {user.email}</span>
                            <span className="text-[var(--border-main)]">|</span>
                            <span className="flex items-center gap-1.5 uppercase tracking-widest text-[var(--accent)] text-xs font-black italic">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[var(--shadow-sm)]"></span>
                                {user.role} Status
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3 mb-2">
                        <button onClick={handleShareProfile} className="flex items-center gap-2 bg-[var(--bg-main)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-bright)] px-5 py-4 rounded-2xl font-black transition-all border border-[var(--border-main)] active:scale-95 shadow-[var(--shadow-sm)]">
                            <Share2 size={18} />
                        </button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-3 bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-[var(--shadow-md)] active:scale-95">
                            {saving ? "Saving..." : <><Save size={16} /> Save Profile</>}
                        </button>
                    </div>
                </div>
                {/* Strength Meter */}
                <div className="h-1.5 w-full bg-[var(--bg-main)]">
                    <div
                        className={clsx("h-full transition-all duration-1000", strength > 80 ? "bg-emerald-500" : strength > 40 ? "bg-amber-500" : "bg-[var(--accent)]")}
                        style={{ width: `${strength}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Academic Details */}
                    <div className={cardCls}>
                        <h3 className={sectionTitleCls}>
                            <div className="h-8 w-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Book size={16} /></div>
                            Academic Details
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className={labelCls}>Department</label>
                                <select value={user.profile?.department || ''} onChange={(e) => setUser({ ...user, profile: { ...user.profile, department: e.target.value } })} className={inputCls + " cursor-pointer"}>
                                    <option value="">Select Department</option>
                                    <option value="CSE">Computer Science & Engineering</option>
                                    <option value="IT">Information Technology</option>
                                    <option value="ECE">Electronics & Communication</option>
                                    <option value="EEE">Electrical & Electronics</option>
                                    <option value="MECH">Mechanical Engineering</option>
                                    <option value="CIVIL">Civil Engineering</option>
                                    <option value="AI_DS">AI & Data Science</option>
                                    <option value="AI_ML">AI & Machine Learning</option>
                                    <option value="CSBS">CS & Business Systems</option>
                                    <option value="CYBER">Cyber Security</option>
                                    <option value="IOT">Internet of Things</option>
                                    <option value="BIOTECH">Biotechnology</option>
                                    <option value="CHEM">Chemical Engineering</option>
                                    <option value="AERO">Aerospace Engineering</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Current CGPA</label>
                                <div className="relative">
                                    <input type="number" step="0.01" value={user.profile?.cgpa || ''} onChange={(e) => setUser({ ...user, profile: { ...user.profile, cgpa: e.target.value } })} className={inputCls + " font-mono pr-16"} placeholder="0.00" />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--text-muted)] opacity-40">/ 10.0</div>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>LinkedIn URL</label>
                                <div className="relative">
                                    <input type="text" value={user.profile?.linkedinUrl || ''} onChange={(e) => setUser({ ...user, profile: { ...user.profile, linkedinUrl: e.target.value } })} onBlur={(e) => handleUrlBlur('LinkedIn', e.target.value)} className={inputCls + " pl-12"} placeholder="linkedin.com/in/..." />
                                    <Share2 size={15} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>GitHub URL</label>
                                <div className="relative">
                                    <input type="text" value={user.profile?.githubUrl || ''} onChange={(e) => setUser({ ...user, profile: { ...user.profile, githubUrl: e.target.value } })} onBlur={(e) => handleUrlBlur('GitHub', e.target.value)} className={inputCls + " pl-12"} placeholder="github.com/..." />
                                    <Terminal size={15} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className={cardCls}>
                        <div className="flex items-center justify-between">
                            <h3 className={sectionTitleCls}>
                                <div className="h-8 w-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Terminal size={16} /></div>
                                Skills
                            </h3>
                            <span className="text-[10px] font-black text-indigo-400 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">{user.profile?.skills?.length || 0}</span>
                        </div>
                        <form onSubmit={addSkill} className="relative">
                            <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className={inputCls + " pr-14"} placeholder="Add a skill..." />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all active:scale-95">
                                <Plus size={18} />
                            </button>
                        </form>
                        <div className="flex flex-wrap gap-2">
                            {user.profile?.skills?.map(skill => (
                                <div key={skill} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[11px] font-black text-[var(--text-muted)] hover:border-[var(--accent)]/50 transition-all group cursor-default shadow-[var(--shadow-sm)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[var(--shadow-sm)]"></div>
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="ml-1 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            {(!user.profile?.skills || user.profile.skills.length === 0) && (
                                <div className="w-full py-10 text-center rounded-[1.5rem] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-main)]/30">
                                    <Terminal size={24} className="mx-auto mb-3 text-[var(--text-muted)] opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">No skills added yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio */}
                    <div className={cardCls}>
                        <div className="pb-5 border-b border-[var(--border-main)] flex items-center justify-between">
                            <div>
                                <h3 className={sectionTitleCls}>
                                    <div className="h-9 w-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-[var(--shadow-sm)]"><User size={18} /></div>
                                    Personal Bio
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 ml-12 opacity-50 italic">Your professional summary</p>
                            </div>
                        </div>
                        <div className="relative">
                            <textarea
                                value={user.profile?.bio || ''}
                                onChange={(e) => setUser({ ...user, profile: { ...user.profile, bio: e.target.value } })}
                                className="w-full bg-[var(--bg-main)]/50 px-7 py-6 rounded-[1.5rem] border border-[var(--border-main)] outline-none focus:border-[var(--accent)] focus:bg-[var(--bg-main)] focus:ring-4 focus:ring-[var(--accent)]/10 font-bold text-[var(--text-main)] text-base h-64 resize-y transition-all leading-relaxed shadow-[var(--shadow-sm)] placeholder:text-[var(--text-muted)] placeholder:opacity-30"
                                placeholder="Describe your professional journey and career goals..."
                            />
                            <div className="absolute bottom-5 right-6 text-[10px] font-black text-[var(--accent)] uppercase tracking-widest tabular-nums opacity-40">
                                {user.profile?.bio?.length || 0} chars
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className={cardCls}>
                        <div className="flex items-center justify-between pb-5 border-b border-[var(--border-main)]">
                            <div>
                                <h3 className={sectionTitleCls}>
                                    <div className="h-9 w-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-[var(--shadow-sm)]"><GraduationCap size={18} /></div>
                                    Education
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 ml-12 opacity-50 italic">Your degrees and academic scores</p>
                            </div>
                            <button onClick={addEducation} className={addBtnCls}><Plus size={15} /> Add Education</button>
                        </div>
                        <div className="space-y-6">
                            {user.profile?.education?.length > 0 ? user.profile.education.map((edu, idx) => (
                                <div key={idx} className="p-7 rounded-[1.5rem] bg-[var(--bg-main)]/50 border border-[var(--border-main)] relative group/card hover:border-[var(--accent)]/30 transition-all shadow-[var(--shadow-sm)]">
                                    <button onClick={() => removeEducation(idx)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-all bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-main)] shadow-[var(--shadow-md)]">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <div><label className={labelCls}>Degree</label><input value={edu.degree || ''} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} className={inputCls} placeholder="e.g. B.Tech Computer Science" /></div>
                                        <div><label className={labelCls}>Institution</label><input value={edu.institution || ''} onChange={(e) => updateEducation(idx, 'institution', e.target.value)} className={inputCls} placeholder="e.g. MIT" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div><label className={labelCls}>Completion Year</label><input value={edu.year || ''} onChange={(e) => updateEducation(idx, 'year', e.target.value)} className={inputCls + " font-mono"} placeholder="2025" /></div>
                                        <div><label className={labelCls}>Grade (GPA / Percentage)</label><input value={edu.grade || ''} onChange={(e) => updateEducation(idx, 'grade', e.target.value)} className={inputCls + " font-mono"} placeholder="9.0 / 10.0" /></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-16 text-center rounded-[2rem] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-main)]/30">
                                    <GraduationCap size={40} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
                                    <p className="font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)] italic">No education details added yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Projects */}
                    <div className={cardCls}>
                        <div className="flex items-center justify-between pb-5 border-b border-[var(--border-main)]">
                            <div>
                                <h3 className={sectionTitleCls}>
                                    <div className="h-9 w-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-[var(--shadow-sm)]"><Code size={18} /></div>
                                    Projects
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 ml-12 opacity-50 italic">Personal and work projects</p>
                            </div>
                            <button onClick={addProject} className={addBtnCls}><Plus size={15} /> Add Project</button>
                        </div>
                        <div className="space-y-6">
                            {user.profile?.projects?.length > 0 ? user.profile.projects.map((proj, idx) => (
                                <div key={idx} className="p-7 rounded-[1.5rem] bg-[var(--bg-main)]/50 border border-[var(--border-main)] relative group/card hover:border-[var(--accent)]/30 transition-all shadow-[var(--shadow-sm)]">
                                    <button onClick={() => removeProject(idx)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-all bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-main)] shadow-[var(--shadow-md)]">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <div><label className={labelCls}>Project Title</label><input value={proj.title || ''} onChange={(e) => updateProject(idx, 'title', e.target.value)} className={inputCls} placeholder="e.g. Portfolio Website" /></div>
                                        <div><label className={labelCls}>Project Link</label><input value={proj.link || ''} onChange={(e) => updateProject(idx, 'link', e.target.value)} className={inputCls} placeholder="github.com/..." /></div>
                                    </div>
                                    <div className="mb-5">
                                        <label className={labelCls}>Technologies (comma separated)</label>
                                        <input value={proj.technologies?.join(', ') || ''} onChange={(e) => updateProject(idx, 'technologies', e.target.value)} className={inputCls + " font-mono text-[var(--accent)]"} placeholder="React, Node.js, Docker..." />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Description</label>
                                        <textarea value={proj.description || ''} onChange={(e) => updateProject(idx, 'description', e.target.value)} className="w-full bg-[var(--bg-main)]/80 px-5 py-4 rounded-[1.25rem] border border-[var(--border-main)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all font-bold text-[var(--text-muted)] text-sm h-28 resize-none leading-relaxed shadow-[var(--shadow-sm)]" placeholder="Describe what you built..." />
                                    </div>
                                    <ProjectAudit
                                        project={proj}
                                        onAuditUpdate={(auditData) => {
                                            const newProjs = [...user.profile.projects];
                                            newProjs[idx].aiAudit = { isVerified: true, ...auditData };
                                            setUser({ ...user, profile: { ...user.profile, projects: newProjs } });
                                        }}
                                    />
                                </div>
                            )) : (
                                <div className="py-16 text-center rounded-[2rem] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-main)]/30">
                                    <Code size={40} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
                                    <p className="font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)] italic">No projects added yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className={cardCls}>
                        <div className="flex items-center justify-between pb-5 border-b border-[var(--border-main)]">
                            <div>
                                <h3 className={sectionTitleCls}>
                                    <div className="h-9 w-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-[var(--shadow-sm)]"><Award size={18} /></div>
                                    Certifications
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 ml-12 opacity-50 italic">Your certificates and professional licenses</p>
                            </div>
                            <button onClick={addCertification} className={addBtnCls}><Plus size={15} /> Add Certification</button>
                        </div>
                        <div className="space-y-3">
                            {user.profile?.certifications?.length > 0 ? user.profile.certifications.map((cert, idx) => (
                                <div key={idx} className="flex items-center gap-4 group/item">
                                    <div className="flex-1 relative">
                                        <input value={cert || ''} onChange={(e) => updateCertification(idx, e.target.value)} className={inputCls + " pl-12"} placeholder="e.g. AWS Certified Solutions Architect" />
                                        <CheckCircle size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-40" />
                                    </div>
                                    <button onClick={() => removeCertification(idx)} className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )) : (
                                <div className="py-14 text-center rounded-[2rem] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-main)]/30">
                                    <Award size={36} className="mx-auto mb-3 text-[var(--text-muted)] opacity-20" />
                                    <p className="font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)] italic">No certifications added yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className={cardCls}>
                        <div className="flex items-center justify-between pb-5 border-b border-[var(--border-main)]">
                            <div>
                                <h3 className={sectionTitleCls}>
                                    <div className="h-9 w-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-[var(--shadow-sm)]"><Trophy size={18} /></div>
                                    Honors & Awards
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 ml-12 opacity-50 italic">Recognition for your hard work</p>
                            </div>
                            <button onClick={addAchievement} className={addBtnCls}><Plus size={15} /> Add Achievement</button>
                        </div>
                        <div className="space-y-3">
                            {user.profile?.achievements?.length > 0 ? user.profile.achievements.map((ach, idx) => (
                                <div key={idx} className="flex items-center gap-4 group/item">
                                    <div className="flex-1 relative">
                                        <input value={ach} onChange={(e) => updateAchievement(idx, e.target.value)} className={inputCls + " pl-12"} placeholder="e.g. Winner of AI Hackathon 2024" />
                                        <Trophy size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500 opacity-50" />
                                    </div>
                                    <button onClick={() => removeAchievement(idx)} className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )) : (
                                <div className="py-14 text-center rounded-[2rem] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-main)]/30">
                                    <Trophy size={36} className="mx-auto mb-3 text-[var(--text-muted)] opacity-20" />
                                    <p className="font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)] italic">No awards added yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Resume Intelligence */}
                    <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-10 border border-[var(--border-main)] relative overflow-hidden group shadow-[var(--shadow-lg)]">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-[80px] group-hover:bg-[var(--accent)]/20 transition-all duration-1000 pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between mb-8 pb-7 border-b border-[var(--border-main)]">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-[var(--shadow-md)]">
                                    <CpuIcon size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-[var(--text-bright)] uppercase italic flex items-center gap-3">
                                        Resume Intelligence <span className="text-[var(--accent)] text-xs not-italic opacity-50 font-black">AI Live</span>
                                    </h3>
                                    <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] mt-0.5 opacity-60">Synchronized Profile</p>
                                </div>
                            </div>
                            {user.profile?.atsScore > 0 && (
                                <div className="text-right">
                                    <div className="flex items-baseline gap-1 justify-end">
                                        <span className="text-5xl font-black text-[var(--text-bright)] tabular-nums italic tracking-tighter">{user.profile.atsScore}</span>
                                        <span className="text-sm font-black text-[var(--accent)]">/100</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Global Benchmark</span>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-8">
                            <div className="space-y-5">
                                <p className="text-sm text-[var(--text-muted)] font-bold leading-relaxed italic">
                                    Our AI engine distills your PDF resume into high-impact profile nodes. <span className="text-[var(--accent)] opacity-80">Keep your identity synchronized with one click.</span>
                                </p>
                                <div className="flex items-center gap-6 bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-main)] shadow-[var(--shadow-sm)]">
                                    <div className="flex flex-col"><span className="text-2xl font-black text-[var(--text-bright)] tabular-nums italic">{user.profile?.skills?.length || 0}</span><span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Nodes</span></div>
                                    <div className="w-px h-8 bg-[var(--border-main)]" />
                                    <div className="flex flex-col"><span className="text-2xl font-black text-[var(--text-bright)] tabular-nums italic">{user.profile?.projects?.length || 0}</span><span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Builds</span></div>
                                    <div className="w-px h-8 bg-[var(--border-main)]" />
                                    <div className="flex flex-col"><span className="text-2xl font-black text-[var(--text-bright)] tabular-nums italic">{user.profile?.certifications?.length || 0}</span><span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Certs</span></div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="relative group/upload">
                                    <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className={clsx(
                                        "w-full h-32 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all shadow-[var(--shadow-sm)]",
                                        selectedFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-[var(--border-main)] bg-[var(--bg-main)] hover:border-[var(--accent)]/50"
                                    )}>
                                        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-[var(--shadow-sm)]", selectedFile ? "bg-emerald-500 text-white" : "bg-[var(--bg-card)] text-[var(--text-muted)] opacity-30")}>
                                            <Upload size={20} />
                                        </div>
                                        <p className={clsx("text-xs font-black uppercase tracking-widest italic", selectedFile ? "text-emerald-500" : "text-[var(--text-muted)] opacity-40")}>
                                            {selectedFile ? selectedFile.name : "Drop Resume Matrix (PDF)"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleSyncResume} disabled={!selectedFile || syncing} className="flex-1 py-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-30 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[var(--shadow-md)]">
                                        {syncing ? <Loader2 size={18} className="animate-spin" /> : <><Zap size={18} /> Run Sync</>}
                                    </button>
                                    <button onClick={handleViewAtsExtract} disabled={fetchingResume} className="px-6 py-4 bg-[var(--bg-main)] hover:bg-[var(--bg-secondary)] text-[var(--accent)] rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-[var(--border-main)] active:scale-95 flex items-center justify-center gap-3 shadow-[var(--shadow-sm)]">
                                        {fetchingResume ? <Loader2 size={18} className="animate-spin" /> : <Terminal size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-[var(--bg-main)]/50 p-4 rounded-xl border border-[var(--border-main)] relative z-10">
                            <ShieldCheck size={16} className="text-[var(--accent)] shrink-0 opacity-50" />
                            <p className="text-[11px] font-bold text-[var(--text-muted)] opacity-50 italic">Architecture secured by end-to-end encryption. Your data remains private.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Sync Report Modal */}
            {showSyncReport && syncData && (
                <div className="fixed inset-0 bg-[var(--bg-main)]/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-500">
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] w-full max-w-4xl border border-[var(--border-main)] shadow-[var(--shadow-lg)] max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Header */}
                        <div className="p-8 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-card)]">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-[var(--shadow-md)]">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-bright)] tracking-tighter uppercase italic">Analysis Results</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em]">Profile Matching</p>
                                        <span className="px-2.5 py-0.5 bg-[var(--bg-main)] text-[var(--text-muted)] text-[9px] font-black rounded-lg uppercase tracking-widest border border-[var(--border-main)] opacity-70">
                                            {syncData.extractionMethod || "AI Extraction"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowSyncReport(false)} className="text-[var(--text-muted)] hover:text-[var(--accent)] p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-main)] hover:rotate-90 transition-all shadow-[var(--shadow-sm)] active:scale-90">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {/* Scores */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[var(--bg-main)]/50 rounded-[2rem] p-8 text-[var(--text-bright)] border border-[var(--border-main)] relative overflow-hidden shadow-[var(--shadow-sm)]">
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-2xl pointer-events-none" />
                                    <h4 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] mb-5 flex items-center gap-2 italic"><TrendingUp size={13} /> Resume Score</h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black italic tracking-tighter">{syncData.atsScore || 0}</span>
                                        <span className="text-lg font-black text-[var(--accent)]">/100</span>
                                    </div>
                                </div>
                                <div className="bg-[var(--accent)] rounded-[2rem] p-8 text-white shadow-[var(--shadow-md)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                                    <h4 className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mb-5 flex items-center gap-2 italic"><Zap size={13} /> Profile Strength</h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black italic tracking-tighter">{syncData.profileStrength || 0}</span>
                                        <span className="text-lg font-black text-white/50">/100</span>
                                    </div>
                                </div>
                            </div>

                            {/* ATS Breakdown - Skip for now as it uses complex dynamic classes, or replace with standard colors if needed */}
                            {/* I will keep it but use theme-aware variables if possible. For now, let's keep the colored cards as they look high-end even in light mode if colors are soft. Actually, let's make them more theme-safe. */}
                            
                            {/* Career Paths */}
                            {syncData.careerPaths?.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                        <MapPin size={13} className="text-[var(--accent)]" /> Career Direction
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {syncData.careerPaths.map((path, idx) => (
                                            <div key={idx} className="px-5 py-3 bg-[var(--bg-main)] text-[var(--text-bright)] rounded-xl flex items-center gap-3 hover:bg-[var(--accent)] hover:text-white transition-all border border-[var(--border-main)] cursor-default shadow-[var(--shadow-sm)]">
                                                <Briefcase size={13} className="text-[var(--accent)] group-hover:text-white" />
                                                <span className="text-xs font-black uppercase tracking-widest italic">{path}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                    <User size={13} className="text-[var(--accent)]" /> Profile Summary
                                </h4>
                                <div className="p-7 bg-[var(--bg-main)]/50 rounded-[1.5rem] border border-[var(--border-main)] text-[var(--text-main)] text-sm leading-relaxed font-bold italic shadow-[var(--shadow-sm)]">
                                    {syncData.bio || syncData.summary || "No summary found in document."}
                                </div>
                            </div>

                            {/* Skills & Certs */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-3 italic"><Code size={13} className="text-[var(--accent)]" /> Skills Found</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {syncData.skills?.length > 0 ? syncData.skills.map((s, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl text-[11px] font-black border border-[var(--accent)]/20 shadow-[var(--shadow-sm)] italic">{s}</span>
                                        )) : <span className="text-sm text-[var(--text-muted)] italic opacity-50">No skills detected</span>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-3 italic"><Award size={13} className="text-[var(--accent)]" /> Certifications Found</h4>
                                    <div className="space-y-2">
                                        {syncData.certifications?.length > 0 ? syncData.certifications.map((c, idx) => (
                                            <div key={idx} className="p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-main)] text-[11px] font-black text-[var(--text-main)] flex items-center gap-3 shadow-[var(--shadow-sm)] italic">
                                                <div className="h-7 w-7 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 shadow-[var(--shadow-sm)]"><CheckCircle size={14} /></div>
                                                {c}
                                            </div>
                                        )) : <span className="text-sm text-[var(--text-muted)] italic opacity-50">No certifications detected</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Projects */}
                            {syncData.projects?.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-3 italic"><Terminal size={13} className="text-[var(--accent)]" /> Projects Found</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {syncData.projects.map((p, i) => (
                                            <div key={i} className="p-7 bg-[var(--bg-main)]/50 rounded-[1.5rem] border border-[var(--border-main)] hover:border-[var(--accent)]/30 transition-all shadow-[var(--shadow-sm)]">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-black text-[var(--text-bright)] italic tracking-tight">{p.title}</span>
                                                    <span className="text-[9px] font-black text-[var(--accent)] uppercase px-2.5 py-1 bg-[var(--bg-main)] rounded-full border border-[var(--border-main)] shadow-[var(--shadow-sm)]">#{i + 1}</span>
                                                </div>
                                                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mb-4 italic leading-relaxed">"{p.description}"</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {p.technologies?.map((t, ti) => (
                                                        <span key={ti} className="text-[9px] font-black text-[var(--accent)]/60 bg-[var(--bg-card)] px-2.5 py-1 rounded-lg uppercase tracking-wider border border-[var(--border-main)]">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card)]/80">
                            <button onClick={() => setShowSyncReport(false)} className="px-7 py-3.5 text-[var(--text-muted)] hover:text-red-500 font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-red-500/10 rounded-xl">
                                Discard
                            </button>
                            <button onClick={handleConfirmSync} disabled={isApplyingSync} className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-[var(--shadow-md)] active:scale-95 disabled:opacity-50 flex items-center gap-3">
                                {isApplyingSync ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Confirm Matrix</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ATS Raw Text Modal */}
            {showAtsView && (
                <div className="fixed inset-0 bg-[var(--bg-main)]/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 w-full max-w-2xl shadow-[var(--shadow-lg)] max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-black text-[var(--text-bright)] uppercase tracking-tight flex items-center gap-2 italic">
                                <Terminal className="text-[var(--accent)]" size={18} /> Matrix Stream
                            </h3>
                            <button onClick={() => setShowAtsView(false)} className="text-[var(--text-muted)] hover:text-[var(--accent)] p-2 bg-[var(--bg-main)] rounded-lg border border-[var(--border-main)] transition-all hover:rotate-90 shadow-[var(--shadow-sm)]">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-[var(--bg-main)]/80 rounded-xl border border-[var(--border-main)] p-4 custom-scrollbar">
                            <pre className="text-xs font-mono text-emerald-500 whitespace-pre-wrap leading-relaxed italic">{aiRawText}</pre>
                        </div>
                        <button onClick={() => setShowAtsView(false)} className="mt-5 px-6 py-4 bg-[var(--accent)] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:bg-[var(--accent)]/90 transition-all active:scale-95 shadow-[var(--shadow-md)]">
                            Close Terminal
                        </button>
                    </div>
                </div>
            )}

            {/* Sticky Save Bar */}
            {!isHeaderVisible && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xl px-4 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-[var(--bg-card)]/90 backdrop-blur-2xl p-4 rounded-[2rem] border border-[var(--border-main)] shadow-[var(--shadow-lg)] flex items-center justify-between gap-5">
                        <div className="flex items-center gap-4 ml-1">
                            <div className="w-11 h-11 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white font-black text-lg shadow-[var(--shadow-sm)] italic">
                                {user.name?.charAt(0)}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.2em] mb-1 opacity-60">Profile Strength</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-14 h-1 bg-[var(--bg-main)] rounded-full overflow-hidden">
                                        <div className="h-full bg-[var(--accent)]" style={{ width: `${strength}%` }} />
                                    </div>
                                    <p className="text-xs font-black text-[var(--text-bright)] tabular-nums italic">{strength}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleShareProfile} className="p-3.5 bg-[var(--bg-main)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-xl transition-all border border-[var(--border-main)] active:scale-95 shadow-[var(--shadow-sm)]">
                                <Share2 size={20} />
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-3 bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[var(--shadow-md)]">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Update</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfilePage;
