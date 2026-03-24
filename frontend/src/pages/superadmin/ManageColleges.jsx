// frontend/src/pages/superadmin/ManageColleges.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import { Building2, Pencil, Trash2, PlusCircle, X } from 'lucide-react';

const ManageColleges = () => {
    const [colleges, setColleges] = useState([]);
    const [formData, setFormData] = useState({ collegeId: '', name: '', domain: '' });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadColleges();
    }, []);

    const loadColleges = async () => {
        try {
            const res = await adminApi.getColleges();
            setColleges(res.data);
        } catch (err) {
            console.error('Failed to load colleges', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await adminApi.updateCollege(editingId, formData);
                toast.success('College updated successfully');
            } else {
                await adminApi.createCollege(formData);
                toast.success('College created successfully');
            }
            setFormData({ collegeId: '', name: '', domain: '' });
            setEditingId(null);
            loadColleges();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (college) => {
        setEditingId(college._id);
        setFormData({ collegeId: college.collegeId, name: college.name, domain: college.domain });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this college? This will remove access for all students and staff at this college.')) return;
        try {
            await adminApi.deleteCollege(id);
            loadColleges();
            toast.success('College deleted successfully');
        } catch (err) {
            toast.error('Failed to delete college');
        }
    };

    const inputClass = "w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-violet-500 outline-none transition-all font-medium shadow-[var(--shadow-sm)]";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[var(--text-bright)] italic tracking-tighter uppercase">
                    Manage <span className="text-violet-400">Colleges</span>
                </h1>
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                    Register and manage institutions on the platform
                </p>
            </div>

            {/* Form */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-[var(--shadow-md)]">
                <div className="flex items-center gap-3 mb-6">
                    <PlusCircle size={20} className="text-violet-400" />
                    <h2 className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-[0.2em] italic">
                        {editingId ? 'Edit College Matrix' : 'Initialize New College'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        placeholder="Short Name (e.g. SKCT)"
                        value={formData.collegeId}
                        onChange={e => setFormData({ ...formData, collegeId: e.target.value })}
                        className={inputClass}
                        required
                        disabled={!!editingId}
                    />
                    <input
                        placeholder="College Full Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                        required
                    />
                    <input
                        placeholder="Login Domain (e.g. skct.edu.in)"
                        value={formData.domain}
                        onChange={e => setFormData({ ...formData, domain: e.target.value })}
                        className={inputClass}
                        required
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20"
                        >
                            {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setFormData({ collegeId: '', name: '', domain: '' }); }}
                                className="px-3 bg-[var(--bg-main)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-xl transition-all border border-[var(--border-main)] shadow-[var(--shadow-sm)]"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl overflow-hidden shadow-[var(--shadow-lg)]">
                <div className="flex items-center gap-3 px-8 py-5 border-b border-[var(--border-main)]">
                    <Building2 size={18} className="text-violet-400" />
                    <h3 className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-[0.2em] italic">
                        Registered Institutions — {colleges.length}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-[var(--border-main)] bg-[var(--bg-main)]/50">
                            <tr>
                                {['Short Name', 'College Name', 'Login Domain', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {colleges.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold text-sm">
                                        No colleges registered yet.
                                    </td>
                                </tr>
                            ) : colleges.map(c => (
                                <tr key={c._id} className="border-b border-[var(--border-main)]/60 hover:bg-[var(--bg-main)]/40 transition-colors">
                                    <td className="px-6 py-4 font-mono text-violet-400 font-bold text-sm tracking-tighter">{c.collegeId}</td>
                                    <td className="px-6 py-4 text-[var(--text-bright)] font-black text-sm italic">{c.name}</td>
                                    <td className="px-6 py-4 text-[var(--text-muted)] text-sm font-bold tracking-tight opacity-70">@{c.domain}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]
                                            ${c.active !== false
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {c.active !== false ? 'Active Matrix' : 'Hibernated'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="p-2 bg-violet-500/5 hover:bg-violet-500/10 text-violet-400 rounded-lg transition-all border border-violet-500/10 shadow-[var(--shadow-sm)]"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c._id)}
                                                className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all border border-red-500/10 shadow-[var(--shadow-sm)]"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageColleges;
