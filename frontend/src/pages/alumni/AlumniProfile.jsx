// frontend/src/pages/alumni/AlumniProfile.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import { User, Briefcase, Linkedin, Save, GraduationCap, Mail, ShieldCheck, Globe } from 'lucide-react';

const AlumniProfile = () => {
    const { user, login } = useAuth();
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
            await profileApi.updateProfile({
                name: formData.name,
                profile: {
                    ...user?.profile,
                    company: formData.company,
                    position: formData.position,
                    linkedinUrl: formData.linkedinUrl
                }
            });
            toast.success('Profile updated successfully!');
            const token = localStorage.getItem('token');
            if (token) await login(token);
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-in fade-in duration-700">

            {/* Page Header */}
            <div className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] p-10 shadow-[var(--shadow-xl)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 group-hover:text-cyan-500 transition-all duration-700">
                    <User size={180} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            Settings
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">Identity Verified</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic leading-none mb-3">
                        Matrix <span className="text-cyan-400">Identity</span>
                    </h1>
                    <p className="text-[var(--text-muted)] font-bold text-sm italic opacity-70 max-w-md">Manage your public alumni presence and professional footprint on the SPIMS+ Network.</p>
                </div>
            </div>

            {/* Read-only info strip */}
            <div className="bg-[var(--bg-main)]/50 backdrop-blur-md rounded-3xl border border-[var(--border-main)] px-8 py-5 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-[var(--shadow-md)]">
                <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-slate-500/10 rounded-lg group-hover:text-cyan-400 transition-colors">
                        <Mail size={16} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Matrix Endpoint</p>
                        <span className="text-sm font-bold text-[var(--text-bright)] italic">{user?.email}</span>
                    </div>
                </div>
                <div className="hidden md:block w-px h-10 bg-[var(--border-main)]" />
                <div className="flex items-center gap-3 group">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                        <GraduationCap size={16} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-cyan-500/50 uppercase tracking-widest">Global Status</p>
                        <span className="text-sm font-black text-cyan-400 uppercase italic">Verified Professional Alumni</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Basic Info */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] space-y-6 shadow-[var(--shadow-xl)] relative overflow-hidden group/card text-left">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-cyan-500 group-hover/card:scale-110 transition-transform">
                            <User size={80} />
                        </div>
                        <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-8 italic">Core Credentials</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 italic opacity-60">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-bright)] p-4 rounded-xl focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold italic"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 italic opacity-60">System Designation</label>
                                <div className="p-4 bg-[var(--bg-main)]/30 border border-[var(--border-main)] rounded-xl text-[var(--text-muted)] font-black flex items-center gap-3 text-xs italic">
                                    <ShieldCheck size={16} className="text-cyan-400" />
                                    SPIMS ALUMNI NODE-001
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Career Links */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] space-y-6 shadow-[var(--shadow-xl)] relative overflow-hidden group/card text-left">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 group-hover/card:scale-110 transition-transform">
                            <Linkedin size={80} />
                        </div>
                        <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8 italic">Connectivity</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 italic opacity-60">LinkedIn Profile URL</label>
                                <div className="relative group/input">
                                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/matrix-nexus"
                                        value={formData.linkedinUrl}
                                        onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-bright)] p-4 pl-12 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold italic"
                                    />
                                </div>
                            </div>

                            <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10">
                                <p className="text-[10px] text-indigo-300 font-bold leading-relaxed italic opacity-80">
                                    Linking your professional profile strengthens your authority within the mentorship matrix.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Data */}
                <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border-main)] space-y-8 shadow-[var(--shadow-xl)] text-left">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                            <Briefcase size={18} />
                        </div>
                        <h2 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] italic">Current Trajectory</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 italic opacity-60">Corporate Sector / Organization</label>
                            <div className="relative group/input">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-amber-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. Cyberdyne Systems, Stark Industries..."
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-bright)] p-4 pl-12 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold italic"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 italic opacity-60">Current Designation</label>
                            <div className="relative group/input">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-amber-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. Lead Architect, Systems Engineer"
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-bright)] p-4 pl-12 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold italic"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex items-center gap-4 px-12 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-cyan-600/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-[10px] italic overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        {loading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        ) : (
                            <>
                                <Save size={18} className="relative z-10" />
                                <span className="relative z-10">Synchronize Identity</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AlumniProfile;
