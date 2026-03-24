// frontend/src/pages/tpo/ManageAlumni.jsx
import React, { useState, useEffect } from 'react';
import { tpoApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import { UserCheck, GraduationCap, Mail, ShieldCheck, Search } from 'lucide-react';
import clsx from 'clsx';

const ManageAlumni = () => {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAlumni = async () => {
        try {
            const { data } = await tpoApi.getAlumni();
            setAlumni(data);
        } catch (error) {
            console.error('Failed to load alumni', error);
            toast.error('Failed to load alumni records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlumni();
    }, []);

    const handleVerify = async (id, status) => {
        try {
            await tpoApi.verifyAlumni(id, status);
            toast.success(status ? 'Alumni verified successfully!' : 'Account deactivated');
            setAlumni(prev => prev.map(a => a._id === id ? { ...a, isActive: status } : a));
        } catch (error) {
            toast.error('Failed to update alumni status');
        }
    };

    const filteredAlumni = alumni.filter(a =>
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.profile?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                        Alumni <span className="text-cyan-400">Network</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Manage and verify alumni registrations for your college.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search alumni..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 w-64 text-sm font-medium text-white placeholder:text-slate-600 transition-all"
                    />
                </div>
            </header>

            {/* Table */}
            <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Alumni Identity</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Info</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Career</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredAlumni.map(person => (
                                <tr key={person._id} className="hover:bg-slate-800/40 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black uppercase text-xs">
                                                {person.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{person.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <ShieldCheck size={12} className={person.isActive ? 'text-emerald-400' : 'text-amber-400'} />
                                                    <span className={clsx('text-[10px] font-black uppercase tracking-widest', person.isActive ? 'text-emerald-400' : 'text-amber-400')}>
                                                        {person.isActive ? 'Verified' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Mail size={14} className="text-slate-600 shrink-0" />
                                            {person.email}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm font-bold text-white">{person.profile?.company || 'N/A'}</p>
                                        <p className="text-xs text-slate-500 font-medium">{person.profile?.position || 'Professional Alumni'}</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        {person.isActive ? (
                                            <button
                                                onClick={() => handleVerify(person._id, false)}
                                                className="px-4 py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border border-slate-700 hover:border-red-500/20"
                                            >
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleVerify(person._id, true)}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-lg shadow-cyan-500/20 active:scale-95 ml-auto"
                                            >
                                                <UserCheck size={14} /> Verify Alumni
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredAlumni.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="flex flex-col items-center opacity-30">
                            <GraduationCap size={48} className="text-slate-500 mb-4" />
                            <p className="text-lg text-slate-500 font-bold">No Records Found</p>
                            <p className="text-sm text-slate-600">No alumni matching your search were found.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageAlumni;
