// frontend/src/pages/tpo/TPOSettings.jsx
import React, { useState, useEffect } from 'react';
import { tpoApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Save, Shield, Palette, UserCog, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TPOSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        portalTitle: 'Placement Portal',
        themeColor: '#0f172a',
        allowStudentProfileEdit: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await tpoApi.getConfig();
            if (data && Object.keys(data).length > 0) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to load portal configuration');
            toast.error('Failed to sync portal settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await tpoApi.updateConfig(settings);
            toast.success('Portal configuration updated successfully');
        } catch (error) {
            toast.error('Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
                    Portal <span className="text-indigo-400">Governance</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">
                    Configure institutional placement parameters and branding.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Branding Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <Palette size={20} />
                            </div>
                            <h2 className="text-base font-black text-white uppercase tracking-tight">Identity & Style</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Portal Title</label>
                                <input
                                    type="text"
                                    value={settings.portalTitle}
                                    onChange={(e) => setSettings({ ...settings, portalTitle: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="e.g. SKCT Placement Cell"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Hex Theme Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={settings.themeColor}
                                        onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="#0f172a"
                                    />
                                    <div
                                        className="w-12 h-12 rounded-xl border border-slate-800 shadow-inner shrink-0"
                                        style={{ backgroundColor: settings.themeColor }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-base font-black text-white uppercase tracking-tight">Policy Controls</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                <div>
                                    <h4 className="text-sm font-bold text-white">Student Profile Edits</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Allow students to update their own skills and bio.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, allowStudentProfileEdit: !settings.allowStudentProfileEdit })}
                                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ml-4 ${settings.allowStudentProfileEdit ? 'bg-emerald-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.allowStudentProfileEdit ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                <div className="flex gap-3">
                                    <History size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                        Changes to portal configuration are logged and applied globally across all student and faculty sessions instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-slate-500">
                        <UserCog size={20} />
                        <div>
                            <p className="text-xs font-bold text-slate-300">Administrative Authority</p>
                            <p className="text-[9px] font-medium uppercase tracking-widest text-slate-500">
                                TPO Node: {user?.collegeId}
                            </p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 group active:scale-95"
                    >
                        {saving ? 'Saving...' : <><Save size={16} className="group-hover:scale-110 transition-transform" /> Commit Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TPOSettings;
