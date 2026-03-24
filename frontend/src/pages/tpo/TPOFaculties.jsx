// frontend/src/pages/tpo/TPOFaculties.jsx
import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { tpoApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const TPOFaculties = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredFaculties.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredFaculties.map(f => f._id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkVerify = async (status) => {
        if (selectedIds.length === 0) return;
        try {
            await tpoApi.bulkVerify(selectedIds, status);
            toast.success(`Updated ${selectedIds.length} faculty members`);
            setSelectedIds([]);
            loadFaculties();
        } catch (err) {
            toast.error('Bulk update failed');
        }
    };

    useEffect(() => {
        loadFaculties();
    }, []);

    const loadFaculties = async () => {
        try {
            const res = await tpoApi.getFaculties();
            setFaculties(res.data);
        } catch (err) {
            console.error('Failed to load faculties', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            await tpoApi.verifyFaculty(id, status);
            toast.success('Faculty status updated successfully');
            loadFaculties();
        } catch (err) {
            toast.error('Failed to update faculty status');
        }
    };

    const filteredFaculties = faculties.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="text-slate-400 font-medium italic">Loading faculty members...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                        Faculty <span className="text-emerald-400">Management</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Enable or disable faculty access for coordinated recruitment activities.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 animate-in zoom-in duration-300">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mr-2">{selectedIds.length} Selected</span>
                            <button
                                onClick={() => handleBulkVerify(true)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Approve All
                            </button>
                            <button
                                onClick={() => handleBulkVerify(false)}
                                className="px-4 py-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all"
                            >
                                Revoke All
                            </button>
                        </div>
                    )}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search faculty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 w-64 text-sm font-medium text-white placeholder:text-slate-600 transition-all"
                        />
                    </div>
                </div>
            </header>

            <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="p-6 w-10">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                                        checked={selectedIds.length === filteredFaculties.length && filteredFaculties.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Faculty Identity</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Access Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredFaculties.map(f => (
                                <tr key={f._id} className={clsx('hover:bg-slate-800/40 transition-colors group', selectedIds.includes(f._id) && 'bg-emerald-500/5')}>
                                    <td className="p-6">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                                            checked={selectedIds.includes(f._id)}
                                            onChange={() => toggleSelect(f._id)}
                                        />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 uppercase text-xs">
                                                {f.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{f.name}</div>
                                                <div className="text-[10px] text-slate-500 font-medium italic lowercase">{f.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className={clsx('w-2 h-2 rounded-full animate-pulse', f.isActive ? 'bg-emerald-500' : 'bg-amber-400')} />
                                            <span className={clsx('text-[10px] font-black uppercase tracking-widest', f.isActive ? 'text-emerald-400' : 'text-amber-400')}>
                                                {f.isActive ? 'Active Member' : 'Pending Clearance'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleVerify(f._id, !f.isActive)}
                                            className={clsx(
                                                'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                                f.isActive
                                                    ? 'bg-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-slate-700'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                                            )}
                                        >
                                            {f.isActive ? <><UserX size={14} /> Revoke Access</> : <><UserCheck size={14} /> Approve Access</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredFaculties.length === 0 && (
                    <div className="p-20 text-center">
                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs opacity-50 italic">No faculty members found matching the search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TPOFaculties;
