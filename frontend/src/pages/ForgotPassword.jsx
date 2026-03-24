import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/api';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, Key, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [resetToken, setResetToken] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.forgotPassword(email);
            toast.success(res.data.message || 'OTP sent to your email');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.verifyOTP(email, otp);
            setResetToken(res.data.resetToken);
            toast.success('Identity Verified');
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await authApi.resetPassword(resetToken, passwords.new);
            toast.success('Password synchronized successfully');
            setStep(4); // Success state
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-indigo-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-transparent" />
                    
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border border-slate-700 bg-indigo-500/10">
                                {step === 1 && <Mail size={24} className="text-indigo-400" />}
                                {step === 2 && <Key size={24} className="text-indigo-400" />}
                                {step === 3 && <Lock size={24} className="text-indigo-400" />}
                                {step === 4 && <CheckCircle2 size={24} className="text-emerald-400" />}
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight italic">
                                {step === 1 && 'Recover Access'}
                                {step === 2 && 'Verify Identity'}
                                {step === 3 && 'New Credentials'}
                                {step === 4 && 'Sync Complete'}
                            </h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                                {step === 1 && 'Enter your email to receive OTP'}
                                {step === 2 && `6-digit code sent to ${email}`}
                                {step === 3 && 'Define your new secure password'}
                                {step === 4 && 'Your identity has been restored'}
                            </p>
                        </div>

                        {/* Stage 1: Email Request */}
                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="name@college.edu"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-sm"
                                >
                                    {loading ? 'Transmitting...' : 'Send OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    <ArrowLeft size={14} /> Back to Login
                                </button>
                            </form>
                        )}

                        {/* Stage 2: OTP Verification */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-center">
                                        Enter 6-Digit Code
                                    </label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-4 rounded-xl outline-none focus:border-indigo-500 transition-all text-center text-3xl font-black tracking-[0.5em] placeholder:text-slate-800"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-sm"
                                >
                                    {loading ? 'Verifying...' : 'Authenticate'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                    className="w-full text-indigo-400 hover:text-indigo-300 transition-colors text-xs font-bold uppercase tracking-widest mt-2"
                                >
                                    Resend OTP
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mt-2"
                                >
                                    Change Email
                                </button>
                            </form>
                        )}

                        {/* Stage 3: Reset Password */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwords.new}
                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-sm"
                                >
                                    {loading ? 'Updating...' : 'Sync Password'}
                                </button>
                            </form>
                        )}

                        {/* Stage 4: Success */}
                        {step === 4 && (
                            <div className="text-center space-y-6">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold">
                                    Your password has been successfully updated. You can now use your new credentials to access the system.
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-white text-slate-950 font-black py-4 rounded-xl shadow-lg hover:bg-slate-200 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
                                >
                                    Return to Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
