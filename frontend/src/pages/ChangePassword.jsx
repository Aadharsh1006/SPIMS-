// frontend/src/pages/ChangePassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
        if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');

        setLoading(true);
        try {
            await authApi.changePassword(newPassword);
            toast.success('Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');

            const token = localStorage.getItem('token');
            if (token) {
                await login(token);
            } else {
                navigate('/login');
            }
        } catch (err) {
            toast.error('Failed to change password. Session may have expired.');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-indigo-500"
                style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }}
            />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

                    {/* Top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-transparent" />

                    <div className="p-8">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border border-slate-700 bg-indigo-500/10">
                                <KeyRound size={28} className="text-indigo-400" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                Change Password
                            </h1>
                            <p className="text-slate-500 text-sm mt-2 font-medium">
                                You must set a new password to continue.
                            </p>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-5">

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 pr-12 rounded-xl outline-none transition-all placeholder:text-slate-600 focus:border-slate-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className={`w-full bg-slate-950 border text-white p-3.5 pr-12 rounded-xl outline-none transition-all placeholder:text-slate-600
                                            ${passwordsMismatch ? 'border-red-500/60' : passwordsMatch ? 'border-emerald-500/60' : 'border-slate-700'}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Match indicator */}
                                {passwordsMismatch && (
                                    <p className="text-red-400 text-xs font-black mt-1.5 ml-1 uppercase tracking-wide">
                                        ✗ Passwords do not match
                                    </p>
                                )}
                                {passwordsMatch && (
                                    <p className="text-emerald-400 text-xs font-black mt-1.5 ml-1 uppercase tracking-wide">
                                        ✓ Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Info badge */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-wider">
                                <ShieldCheck size={13} />
                                Minimum 6 characters required
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || passwordsMismatch}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <KeyRound size={17} /> Update Password & Login
                                    </>
                                )}
                            </button>
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

export default ChangePassword;
