// frontend/src/pages/faculty/FacultyApprovals.jsx
import React, { useState, useEffect } from 'react';
import { applicationApi } from '../../api/api';
import {
    CheckCircle, XCircle,
    Briefcase, Zap, Clock,
    ArrowRightCircle, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const FacultyApprovals = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const fetchPending = async () => {
        try {
            const { data } = await applicationApi.getCollegeApplications('FACULTY_PENDING');
            setApplications(data);
        } catch (error) {
            toast.error('Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (id, action) => {
        setProcessing(id);
        try {
            await applicationApi.facultyApprove(id, action);
            toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'}`);
            setApplications(prev => prev.filter(app => app._id !== id));
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        } catch (error) {
            toast.error('Action failed');
        } finally {
            setProcessing(null);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.size === 0) return;
        setIsBulkProcessing(true);
        try {
            await applicationApi.bulkFacultyApprove(Array.from(selectedIds), action);
            toast.success(`Selected applications ${action === 'approve' ? 'approved' : 'rejected'}`);
            setApplications(prev => prev.filter(app => !selectedIds.has(app._id)));
            setSelectedIds(new Set());
        } catch (error) {
            toast.error(`Bulk action failed.`);
            fetchPending();
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const selectAll = () => {
        if (selectedIds.size === filteredApps.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredApps.map(a => a._id)));
        }
    };

    const filteredApps = applications.filter(app =>
        app.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-2xl border-4 border-indigo-500/10 border-t-indigo-500 animate-spin shadow-[var(--shadow-md)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={24} className="text-indigo-500 animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Approvals...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-28 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] shadow-[var(--shadow-lg)]">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-bright)] tracking-tight uppercase italic">Student <span className="text-indigo-400">Approvals</span></h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60 italic">Evaluating and authenticating student career submissions.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        type="text"
                        placeholder="Search candidates or roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-bright)] pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium placeholder:text-[var(--text-muted)] shadow-[var(--shadow-sm)]"
                    />
                </div>
            </div>

            {filteredApps.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[3rem] p-24 text-center shadow-[var(--shadow-xl)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-700">
                        <CheckCircle size={150} />
                    </div>
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/20 shadow-[var(--shadow-md)]">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tight italic">All Clear</h3>
                    <p className="text-[var(--text-muted)] mt-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic">All student applications have been processed successfully.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Select All Row */}
                    <div className="flex items-center px-4">
                        <button
                            onClick={selectAll}
                            className="flex items-center gap-4 group"
                        >
                            <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all shadow-[var(--shadow-sm)] ${
                                selectedIds.size === filteredApps.length && filteredApps.length > 0
                                    ? 'bg-indigo-500 border-indigo-500 rotate-12 scale-110'
                                    : 'bg-[var(--bg-main)] border-[var(--border-main)] group-hover:border-indigo-500'
                            }`}>
                                {selectedIds.size === filteredApps.length && filteredApps.length > 0 && (
                                    <CheckCircle size={14} className="text-white" />
                                )}
                            </div>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-colors italic">
                                Batch Select: {filteredApps.length} Applications
                            </span>
                        </button>
                    </div>

                    {/* Application Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {filteredApps.map(app => (
                            <div
                                key={app._id}
                                className={`bg-[var(--bg-card)] border p-8 rounded-[2rem] hover:border-indigo-500/30 transition-all flex flex-col md:flex-row items-start md:items-center gap-8 group/card shadow-[var(--shadow-md)] relative overflow-hidden ${
                                    selectedIds.has(app._id)
                                        ? 'border-indigo-500/50 shadow-[var(--shadow-lg)] scale-[1.01]'
                                        : 'border-[var(--border-main)]'
                                }`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/card:scale-110 group-hover/card:text-indigo-500 transition-all">
                                    <Briefcase size={80} />
                                </div>
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleSelection(app._id)}
                                    className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 z-10 shadow-[var(--shadow-sm)] ${
                                        selectedIds.has(app._id)
                                            ? 'bg-indigo-500 border-indigo-500 rotate-12 scale-110'
                                            : 'bg-[var(--bg-main)] border-[var(--border-main)] hover:border-indigo-400'
                                    }`}
                                >
                                    {selectedIds.has(app._id) && <CheckCircle size={14} className="text-white" />}
                                </button>

                                {/* Avatar */}
                                <div className="w-16 h-16 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] text-2xl font-black shrink-0 shadow-[var(--shadow-sm)] group-hover/card:scale-110 transition-transform italic">
                                    {app.studentId?.name?.charAt(0)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-3 min-w-0 z-10">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <h3 className="text-xl font-black text-[var(--text-bright)] tracking-tight uppercase italic">{app.studentId?.name}</h3>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 shadow-[var(--shadow-sm)] italic animate-pulse">
                                            AI Match: {app.aiScores?.layer1StudentMatch}%
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] italic opacity-70">
                                        <span className="flex items-center gap-2 group/link cursor-pointer hover:text-indigo-400 transition-colors">
                                            <Briefcase size={14} className="text-indigo-400" /> {app.jobId?.title}
                                        </span>
                                        <span className="text-indigo-400/40">@ {app.jobId?.company}</span>
                                        <span className="flex items-center gap-2">
                                            <Clock size={14} className="text-amber-400" /> {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-[var(--border-main)] z-10">
                                    <button
                                        onClick={() => handleAction(app._id, 'reject')}
                                        disabled={processing === app._id}
                                        className="w-14 h-14 bg-[var(--bg-main)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 rounded-2xl transition-all active:scale-95 disabled:opacity-50 border border-[var(--border-main)] hover:border-red-500/30 flex items-center justify-center shadow-[var(--shadow-sm)]"
                                        title="Reject"
                                    >
                                        <XCircle size={24} />
                                    </button>
                                    <button
                                        onClick={() => handleAction(app._id, 'approve')}
                                        disabled={processing === app._id}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 group/btn italic"
                                    >
                                        {processing === app._id ? (
                                            <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Verify Auth
                                                <ArrowRightCircle size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Floating Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[var(--bg-card)]/90 backdrop-blur-2xl border border-indigo-500/30 p-2 rounded-[2rem] shadow-2xl shadow-indigo-600/20 flex items-center gap-4 z-50 animate-in slide-in-from-bottom duration-500">
                    <div className="px-6 py-2">
                        <span className="text-indigo-400 font-black tabular-nums text-2xl italic">{selectedIds.size}</span>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-3 italic opacity-60">Selected for Batch</span>
                    </div>
                    <div className="w-px h-10 bg-[var(--border-main)]" />
                    <div className="flex gap-3 p-1">
                        <button
                            onClick={() => handleBulkAction('reject')}
                            disabled={isBulkProcessing}
                            className="px-6 py-3.5 bg-[var(--bg-main)] hover:bg-red-500/10 text-red-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center gap-3 border border-[var(--border-main)] hover:border-red-500/30 italic"
                        >
                            <XCircle size={16} /> Batch Reject
                        </button>
                        <button
                            onClick={() => handleBulkAction('approve')}
                            disabled={isBulkProcessing}
                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-3 border border-indigo-400/20 italic"
                        >
                            {isBulkProcessing ? (
                                <div className="w-4 h-4 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Zap size={16} className="animate-pulse" />
                            )}
                            Finalize Batch Endorsement
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyApprovals;
