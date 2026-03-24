// frontend/src/pages/superadmin/TPOManagement.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import { GraduationCap, UserPlus, UserX, ShieldCheck } from 'lucide-react';

const TPOManagement = () => {
    const [colleges, setColleges] = useState([]);
    const [formData, setFormData] = useState({ collegeId: '', email: '', password: '', name: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadColleges();
    }, []);

    const loadColleges = async () => {
        try {
            const res = await adminApi.getColleges();
            setColleges(res.data);
            if (res.data.length > 0) setFormData(prev => ({ ...prev, collegeId: res.data[0].collegeId }));
        } catch (err) {
            console.error('Failed to load colleges', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminApi.createTpo(formData);
            setFormData({ ...formData, email: '', password: '', name: '' });
            toast.success('TPO created and assigned successfully');
            loadColleges();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create TPO');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTpo = async (collegeId, tpoUserId) => {
        if (!window.confirm('Are you sure you want to remove this TPO? They will be demoted to a regular user.')) return;
        try {
            await adminApi.deleteTpo(collegeId, tpoUserId);
            loadColleges();
            toast.success('TPO removed successfully');
        } catch (err) {
            toast.error('Failed to remove TPO');
        }
    };

    const inputClass = "w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-violet-500 outline-none transition-all font-medium shadow-[var(--shadow-sm)] italic";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[var(--text-bright)] italic tracking-tighter uppercase">
                    Placement <span className="text-violet-400">Officers</span>
                </h1>
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                    Assign and manage TPO accounts per institution
                </p>
            </div>

            {/* Form */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-8 shadow-[var(--shadow-md)]">
                <div className="flex items-center gap-3 mb-6">
                    <UserPlus size={20} className="text-violet-400" />
                    <h2 className="text-[11px] font-black text-[var(--text-bright)] uppercase tracking-[0.2em] italic">Assign Placement Officer</h2>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <select
                        value={formData.collegeId}
                        onChange={e => setFormData({ ...formData, collegeId: e.target.value })}
                        className={inputClass}
                    >
                        {colleges.map(c => (
                            <option key={c._id} value={c.collegeId}>{c.name} ({c.collegeId})</option>
                        ))}
                    </select>
                    <input
                        placeholder="Officer Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Officer Email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className={inputClass}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20"
                    >
                        {loading ? 'Assigning...' : 'Assign Officer'}
                    </button>
                </form>
            </div>

            {/* College Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map(c => (
                    <div key={c._id} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] p-7 hover:border-violet-500/30 transition-all shadow-[var(--shadow-md)] group overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/10 transition-all duration-700" />
                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-base font-black text-[var(--text-bright)] uppercase italic tracking-tight">{c.name}</h3>
                                <p className="text-[9px] text-violet-400 font-black uppercase tracking-[0.2em] mt-1 opacity-70">Matrix Node {c.collegeId}</p>
                            </div>
                            {c.tpoUserId && (
                                <button
                                    onClick={() => handleRemoveTpo(c.collegeId, c.tpoUserId)}
                                    className="p-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl transition-all border border-red-500/10 shadow-[var(--shadow-sm)]"
                                    title="Remove Officer"
                                >
                                    <UserX size={14} />
                                </button>
                            )}
                        </div>

                        <div className={`relative z-10 flex items-center gap-4 p-5 rounded-2xl border transition-all
                            ${c.tpoUserId
                                ? 'bg-violet-500/5 border-violet-500/10 shadow-[var(--shadow-sm)]'
                                : 'bg-[var(--bg-main)]/50 border-[var(--border-main)]'
                            }`}>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-[var(--shadow-sm)] transition-all
                                ${c.tpoUserId ? 'bg-violet-600 text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] opacity-30 shadow-none'}`}>
                                {c.tpoUserId ? <ShieldCheck size={20} /> : <GraduationCap size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-[var(--text-bright)] uppercase italic tracking-tighter">
                                    {c.tpoUserId ? 'Officer Assigned' : 'Unassigned Node'}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-50 mt-0.5">
                                    {c.tpoUserId ? `ID: ${c.tpoUserId}` : 'Requires Sync'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TPOManagement;
