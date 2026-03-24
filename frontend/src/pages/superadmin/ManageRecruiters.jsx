// frontend/src/pages/superadmin/ManageRecruiters.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import { UserCheck, Building2, Mail, Clock, ShieldCheck } from 'lucide-react';

const ManageRecruiters = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try {
            const { data } = await adminApi.getPendingRecruiters();
            setRecruiters(data);
        } catch (error) {
            toast.error('Failed to load pending recruiters');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id) => {
        try {
            await adminApi.approveRecruiter(id);
            toast.success('Recruiter approved successfully!');
            setRecruiters(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            toast.error('Failed to approve recruiter');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-[var(--accent)]/10 border-t-[var(--accent)] animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-[var(--accent)] rounded-lg animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Requester Matrix...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-bright)] italic tracking-tighter uppercase">
                        Recruiter <span className="text-violet-400">Approvals</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                        Verify and grant access to partner organizations
                    </p>
                </div>
                <div className="px-5 py-2.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center gap-2 shadow-[var(--shadow-sm)]">
                    <ShieldCheck size={14} className="text-violet-400" />
                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">
                        {recruiters.length} Pending Nodes
                    </span>
                </div>
            </div>

            {recruiters.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-24 text-center shadow-[var(--shadow-lg)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                    <div className="w-20 h-20 bg-[var(--bg-main)] rounded-[2rem] border border-[var(--border-main)] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-md)]">
                        <UserCheck size={36} className="text-[var(--text-muted)] opacity-30" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tighter italic">Queue Synchronized</h3>
                    <p className="text-[var(--text-muted)] text-xs font-bold mt-3 opacity-60 uppercase tracking-widest italic">No pending identity verification requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recruiters.map((recruiter) => (
                        <div key={recruiter._id} className="group bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] p-8 hover:border-violet-500/40 transition-all duration-500 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/10 transition-all duration-1000" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center shrink-0 border border-[var(--border-main)] shadow-[var(--shadow-sm)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <Building2 size={28} className="text-violet-400 opacity-60 group-hover:opacity-100" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[var(--text-bright)] group-hover:text-violet-400 transition-colors uppercase italic tracking-tight">
                                            {recruiter.profile?.company || 'Organization Anonymous'}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2.5">
                                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                                <UserCheck size={14} className="text-violet-500/50" />
                                                <span className="text-xs font-black uppercase tracking-widest italic opacity-70">{recruiter.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                                <Mail size={14} className="text-violet-500/50" />
                                                <span className="text-xs font-bold opacity-60 italic">{recruiter.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                                <Clock size={14} className="text-violet-500/50" />
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                                    Matrix Joined {new Date(recruiter.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApprove(recruiter._id)}
                                    className="shrink-0 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20 uppercase tracking-widest"
                                >
                                    <UserCheck size={15} />
                                    Approve Access
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageRecruiters;
