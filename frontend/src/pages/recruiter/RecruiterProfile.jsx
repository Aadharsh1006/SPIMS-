// frontend/src/pages/recruiter/RecruiterProfile.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/api';
import { Building2, User, Linkedin, Save, ShieldCheck, Mail, Briefcase, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RecruiterProfile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        company: user?.profile?.company || '',
        position: user?.profile?.position || '',
        linkedinUrl: user?.profile?.linkedinUrl || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await profileApi.updateProfile({
                name: formData.name,
                profile: {
                    ...user?.profile,
                    company: formData.company,
                    position: formData.position,
                    linkedinUrl: formData.linkedinUrl
                }
            });
            updateUser(data);
            toast.success('Professional profile synchronized');
        } catch {
            toast.error('Profile update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Hub */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-8 md:p-10 shadow-[var(--shadow-xl)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                    <User size={180} className="text-emerald-500" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[var(--shadow-sm)]">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">
                                    Identity <span className="text-emerald-400">Hub</span>
                                </h1>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-1 italic opacity-60">Verified Recruiter Profile</p>
                            </div>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm font-bold italic max-w-xl leading-relaxed">
                            Synchronizing professional credentials and corporate branding with the global talent matrix.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Neural Signature Card */}
                <div className="lg:col-span-1">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-10 rounded-[3rem] text-center shadow-[var(--shadow-xl)] relative overflow-hidden group/card transition-all hover:border-emerald-500/30 h-full flex flex-col justify-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 opacity-20 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover/card:bg-emerald-500/10 transition-all duration-700" />
                        
                        <div className="w-28 h-28 bg-[var(--bg-main)] border-2 border-[var(--border-main)] rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center text-emerald-400 text-5xl font-black shadow-[var(--shadow-lg)] group-hover/card:scale-110 group-hover/card:bg-emerald-500 group-hover/card:text-white group-hover/card:border-emerald-400/50 transition-all duration-700 italic relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                            <span className="relative z-10">{user?.name?.charAt(0)}</span>
                        </div>
                        
                        <h2 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic leading-none">{formData.name || 'Hiring Manager'}</h2>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mt-4 mx-auto">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic tracking-[0.2em]">Verified Professional</span>
                        </div>
                        
                        <div className="mt-10 pt-10 border-t border-[var(--border-main)] space-y-5 text-left relative z-10">
                            <div className="group/info">
                                <p className="text-[8px] font-black text-emerald-500/40 uppercase tracking-[0.3em] mb-2 ml-1 italic font-black">Electronic Mail</p>
                                <div className="flex items-center gap-4 bg-[var(--bg-main)] px-5 py-3 rounded-2xl border border-[var(--border-main)] group-hover/info:border-emerald-500/30 transition-all shadow-inner">
                                    <Mail size={14} className="text-emerald-500/60" />
                                    <span className="text-[11px] font-bold text-[var(--text-bright)] truncate flex-1 italic">{user?.email}</span>
                                </div>
                            </div>
                            <div className="group/info">
                                <p className="text-[8px] font-black text-emerald-500/40 uppercase tracking-[0.3em] mb-2 ml-1 italic font-black">Corporate Domain</p>
                                <div className="flex items-center gap-4 bg-[var(--bg-main)] px-5 py-3 rounded-2xl border border-[var(--border-main)] group-hover/info:border-emerald-500/30 transition-all shadow-inner">
                                    <Building2 size={14} className="text-emerald-500/60" />
                                    <span className="text-[11px] font-bold text-[var(--text-bright)] truncate flex-1 italic">{formData.company || 'Private Entity'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-10 md:p-12 rounded-[3.5rem] shadow-[var(--shadow-xl)] space-y-10 relative overflow-hidden h-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.3em] ml-2 italic">Full Name Identifier</label>
                                <div className="relative group/input">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-emerald-500 group-focus-within/input:scale-110 transition-all duration-300" size={18} />
                                    <input type="text" value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[1.5rem] py-5 pl-16 pr-8 text-sm text-[var(--text-bright)] font-black italic focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner placeholder:opacity-30"
                                        placeholder="Enter operator name..." />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.3em] ml-2 italic">Professional Seniority</label>
                                <div className="relative group/input">
                                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-emerald-500 group-focus-within/input:scale-110 transition-all duration-300" size={18} />
                                    <input type="text" value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[1.5rem] py-5 pl-16 pr-8 text-sm text-[var(--text-bright)] font-black italic focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner placeholder:opacity-30"
                                        placeholder="e.g. Lead HR Coordinator" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.3em] ml-2 italic">Company / Organization</label>
                                <div className="relative group/input">
                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-emerald-500 group-focus-within/input:scale-110 transition-all duration-300" size={18} />
                                    <input type="text" value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[1.5rem] py-5 pl-16 pr-8 text-sm text-[var(--text-bright)] font-black italic focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner placeholder:opacity-30"
                                        placeholder="Institutional domain..." />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.3em] ml-2 italic">LinkedIn Network Node</label>
                                <div className="relative group/input">
                                    <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-emerald-500 group-focus-within/input:scale-110 transition-all duration-300" size={18} />
                                    <input type="url" value={formData.linkedinUrl}
                                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[1.5rem] py-5 pl-16 pr-8 text-sm text-[var(--text-bright)] font-black italic focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner placeholder:opacity-30"
                                        placeholder="https://linkedin.com/in/..." />
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-[var(--border-main)] flex justify-end items-center gap-6 relative z-10">
                            <div className="hidden sm:block text-[9px] font-black text-emerald-500/40 uppercase tracking-[0.2em] italic max-w-xs text-right">
                                Encrypted synchronization with the global talent matrix will be initiated.
                            </div>
                            <button type="submit" disabled={loading}
                                className="flex items-center gap-4 px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-500/30 disabled:opacity-50 active:scale-95 group/btn italic border border-emerald-400/20 shrink-0">
                                <Zap size={18} className={`${loading ? 'animate-spin' : 'group-hover:scale-125 group-hover:rotate-12'} transition-transform fill-current`} />
                                {loading ? 'Processing...' : 'Sync Identity'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RecruiterProfile;
