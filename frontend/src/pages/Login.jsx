// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/api';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';

const ROLE_CONFIG = {
    STUDENT:     { label: 'Student',     color: 'indigo',  hex: '#6366f1' },
    FACULTY:     { label: 'Faculty',     color: 'sky',     hex: '#0ea5e9' },
    TPO:         { label: 'TPO',         color: 'violet',  hex: '#8b5cf6' },
    RECRUITER:   { label: 'Recruiter',   color: 'emerald', hex: '#10b981' },
    ALUMNI:      { label: 'Alumni',      color: 'cyan',    hex: '#06b6d4' },
    SUPER_ADMIN: { label: 'Super Admin', color: 'rose',    hex: '#f43f5e' },
};

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'STUDENT',
        collegeId: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const activeRole = ROLE_CONFIG[formData.role];
    const needsCollege = !['RECRUITER', 'ALUMNI', 'SUPER_ADMIN'].includes(formData.role);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.login(formData);
            toast.success(`Access Granted: System Sync Initiated`);
            await login(res.data.token, res.data.user);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">

            {/* Background glow blob */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-700"
                style={{ background: activeRole.hex, top: '10%', left: '30%', transform: 'translate(-50%, -50%)' }}
            />

            <div className="max-w-md w-full relative z-10">

                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

                    {/* Top accent bar */}
                    <div
                        className="h-1 w-full transition-all duration-500"
                        style={{ background: `linear-gradient(90deg, ${activeRole.hex}, transparent)` }}
                    />

                    <div className="p-8">

                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border border-slate-700"
                                style={{ background: `${activeRole.hex}18` }}>
                                <ShieldCheck size={28} style={{ color: activeRole.hex }} />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter italic">
                                SPIMS<span style={{ color: activeRole.hex }}>+</span>
                            </h1>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                                Career & Placement Portal
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="name@college.edu"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none transition-all placeholder:text-slate-600 focus:border-slate-500"
                                    style={{ '--tw-ring-color': activeRole.hex }}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 pr-12 rounded-xl outline-none transition-all placeholder:text-slate-600 focus:border-slate-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-1">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            {/* Role + College ID */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                        Your Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none transition-all appearance-none cursor-pointer focus:border-slate-500"
                                    >
                                        {Object.entries(ROLE_CONFIG).map(([val, { label }]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {needsCollege && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                            College ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="college1"
                                            value={formData.collegeId}
                                            onChange={e => setFormData({ ...formData, collegeId: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none transition-all placeholder:text-slate-600 focus:border-slate-500"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Role badge */}
                            <div
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-300"
                                style={{
                                    borderColor: `${activeRole.hex}40`,
                                    background: `${activeRole.hex}10`,
                                    color: activeRole.hex,
                                }}
                            >
                                <ShieldCheck size={13} />
                                Signing in as {activeRole.label}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 mt-2 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                                style={{ background: activeRole.hex }}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <LogIn size={17} /> Sign In
                                    </>
                                )}
                            </button>

                            <p className="text-center text-sm text-slate-500 pt-1">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="font-black hover:underline transition-colors"
                                    style={{ color: activeRole.hex }}
                                >
                                    Join SPIMS+
                                </button>
                            </p>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-6 text-center">
                        <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest">
                            Standardized Placement & Internship Management System
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
