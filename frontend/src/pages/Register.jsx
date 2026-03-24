// frontend/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../api/api';
import { Eye, EyeOff, UserPlus, Building2, GraduationCap } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('RECRUITER');
    const [company, setCompany] = useState('');
    const [collegeId, setCollegeId] = useState('');
    const [colleges, setColleges] = useState([]);

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const res = await api.get('/admin/colleges/public');
                setColleges(res.data);
            } catch (error) {
                console.error('Failed to fetch colleges');
                toast.error('Could not load colleges list');
            }
        };
        fetchColleges();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const registrationData = {
                name,
                email,
                password,
                role,
                collegeId: role === 'RECRUITER' ? null : collegeId,
                profile: role === 'RECRUITER' ? { company } : {}
            };

            await register(registrationData);

            if (role === 'RECRUITER' || role === 'ALUMNI') {
                toast.success('Registration request sent! Please wait for approval.');
            } else {
                toast.success('Registration successful!');
            }
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    const roleColor = role === 'RECRUITER' ? '#10b981' : '#06b6d4';
    const RoleIcon = role === 'RECRUITER' ? Building2 : GraduationCap;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">

            {/* Background glow */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-700"
                style={{ background: roleColor, top: '15%', left: '50%', transform: 'translateX(-50%)' }}
            />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

                    {/* Top accent bar */}
                    <div
                        className="h-1 w-full transition-all duration-500"
                        style={{ background: `linear-gradient(90deg, ${roleColor}, transparent)` }}
                    />

                    <div className="p-8">

                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div
                                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border border-slate-700"
                                style={{ background: `${roleColor}18` }}
                            >
                                <RoleIcon size={28} style={{ color: roleColor }} />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter italic">
                                SPIMS<span style={{ color: roleColor }}>+</span>
                            </h1>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                                Join the Network
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none transition-all placeholder:text-slate-600 focus:border-slate-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="name@college.edu"
                                    className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none transition-all placeholder:text-slate-600 focus:border-slate-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 pr-12 rounded-xl outline-none transition-all placeholder:text-slate-600 focus:border-slate-500"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                            </div>

                            {/* Role + College */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                        Role
                                    </label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none transition-all appearance-none cursor-pointer focus:border-slate-500"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="RECRUITER">Recruiter</option>
                                        <option value="ALUMNI">Alumni</option>
                                    </select>
                                </div>

                                {role === 'ALUMNI' && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                            College
                                        </label>
                                        <select
                                            value={collegeId}
                                            onChange={(e) => setCollegeId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none transition-all appearance-none cursor-pointer focus:border-slate-500"
                                            required
                                        >
                                            <option value="" disabled>Select College</option>
                                            {colleges.map(college => (
                                                <option key={college._id} value={college.collegeId}>
                                                    {college.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Company (Recruiter only) */}
                            {role === 'RECRUITER' && (
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl outline-none transition-all placeholder:text-slate-600 focus:border-slate-500"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="Enter your organization"
                                        required
                                    />
                                </div>
                            )}

                            {/* Info badge */}
                            <div
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-300"
                                style={{
                                    borderColor: `${roleColor}40`,
                                    background: `${roleColor}10`,
                                    color: roleColor,
                                }}
                            >
                                <RoleIcon size={13} />
                                {role === 'RECRUITER'
                                    ? 'Recruiter accounts require admin approval'
                                    : 'Alumni accounts require admin approval'}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-sm mt-2"
                                style={{ background: roleColor }}
                            >
                                <UserPlus size={17} /> Register Account
                            </button>

                            <p className="text-center text-sm text-slate-500 pt-1">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-black hover:underline transition-colors"
                                    style={{ color: roleColor }}
                                >
                                    Sign In
                                </Link>
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

export default Register;
