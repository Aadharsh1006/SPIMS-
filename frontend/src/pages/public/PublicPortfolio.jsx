// frontend/src/pages/public/PublicPortfolio.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../../api/api';
import { toast } from 'react-hot-toast';
import {
    Github, Linkedin, Download, Mail, Award, Briefcase,
    Code, Calendar, User, Sparkles, Terminal, Trophy,
    GraduationCap, ChevronRight, ArrowUpRight, Command,
    Cpu, Zap, Globe, ShieldCheck, Quote, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import clsx from 'clsx';

const PublicPortfolio = () => {
    const { id } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, -50]);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const { data } = await publicApi.getPortfolio(id);
                setPortfolio(data);
            } catch (err) {
                setError('Profile signal lost or encrypted.');
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [id]);

    const handleDownloadResume = async () => {
        try {
            const response = await publicApi.downloadResume(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Failed to download professional dossier.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-32 h-32"
                >
                    <div className="absolute inset-0 border-[3px] border-indigo-500/10 rounded-[2.5rem] rotate-45" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 border-t-[3px] border-indigo-500 rounded-[2.5rem] rotate-45"
                    />
                    <div className="absolute inset-6 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                        <Cpu className="text-indigo-500 animate-pulse" size={32} />
                    </div>
                </motion.div>
                <p className="mt-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                    Loading Portfolio...
                </p>
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mb-8 border border-red-500/20"
                >
                    <ShieldCheck size={48} className="text-red-500" />
                </motion.div>
                <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Profile Not Found</h1>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                    {error || 'This portfolio is unavailable or has been removed.'}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 transition-all active:scale-95"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const { user, resume } = portfolio;
    const { profile } = user;

    const getDisplayStrength = () => {
        if (!profile) return 0;
        if (profile.profileStrength && profile.profileStrength > 0) return profile.profileStrength;
        const sections = [
            { met: !!profile.department, weight: 15 },
            { met: !!profile.cgpa, weight: 15 },
            { met: profile.skills?.length > 0, weight: 15 },
            { met: !!profile.bio, weight: 15 },
            { met: profile.education?.length > 0, weight: 15 },
            { met: profile.projects?.length > 0, weight: 15 },
            { met: profile.certifications?.length > 0, weight: 5 },
            { met: profile.achievements?.length > 0, weight: 5 },
        ];
        return Math.round(sections.reduce((acc, s) => acc + (s.met ? s.weight : 0), 0));
    };

    const ensureAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('mailto:')) return url;
        return `https://${url}`;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 100 } },
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-indigo-500/40 selection:text-white overflow-x-hidden"
        >
            {/* Background Grid & Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#1a1a2e,transparent)]" />
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ x: [0, -100, 0], y: [0, 150, 0], opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px]"
                />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center pointer-events-none">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="pointer-events-auto flex items-center gap-2 group cursor-pointer"
                >
                    <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center font-black italic scale-90 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                        S
                    </div>
                    <span className="text-white font-black text-lg tracking-tighter uppercase italic group-hover:tracking-normal transition-all duration-500">
                        {user.name.split(' ')[0]} Portfolio
                    </span>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="pointer-events-auto flex items-center gap-3"
                >
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Portfolio link copied!');
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white transition-all active:scale-95 group"
                        title="Copy link"
                    >
                        <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                    </button>
                    <div className="px-5 py-3 bg-emerald-600/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <ShieldCheck size={14} /> Verified
                    </div>
                </motion.div>
            </nav>

            {/* Main Content */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10"
            >
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col justify-center px-6 md:px-24 pt-32 pb-24">
                    <motion.div variants={itemVariants} style={{ y: heroY }} className="max-w-6xl w-full mx-auto">
                        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center md:items-start text-center md:text-left">

                            {/* Avatar */}
                            <div className="relative group shrink-0">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    className="w-48 h-48 md:w-64 md:h-64 rounded-[3.5rem] bg-gradient-to-br from-indigo-600 via-indigo-900 to-black p-[2px] shadow-[0_32px_128px_-16px_rgba(99,102,241,0.4)]"
                                >
                                    <div className="w-full h-full bg-[#080808] rounded-[3.4rem] overflow-hidden flex items-center justify-center relative">
                                        <span className="text-7xl md:text-8xl font-black text-white italic opacity-20">
                                            {user.name.charAt(0)}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent" />
                                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live</span>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute -top-5 -right-5 p-3 bg-white text-black rounded-3xl shadow-2xl"
                                >
                                    <Zap size={20} strokeWidth={3} />
                                </motion.div>
                            </div>

                            {/* Identity */}
                            <div className="flex-1 space-y-8 min-w-0">
                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]"
                                    >
                                        <Command size={12} /> Digital Professional Portfolio
                                    </motion.div>

                                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
                                        {user.name.split(' ').length > 1
                                            ? user.name.split(' ').slice(0, -1).join(' ')
                                            : 'STUDENT'
                                        }{' '}
                                        <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-400 to-emerald-400">
                                            {user.name.split(' ').slice(-1)[0]}
                                        </span>
                                    </h1>

                                    <p className="text-xl md:text-2xl font-black text-slate-500 flex flex-wrap items-center justify-center md:justify-start gap-3 uppercase tracking-tighter italic">
                                        {profile.department}
                                        {profile.department && profile.year && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                                        {profile.year}
                                    </p>

                                    {/* Score Badges */}
                                    {(profile.atsScore > 0 || getDisplayStrength() > 0) && (
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                            {profile.atsScore > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-slate-900 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3 group hover:bg-white hover:text-black transition-all cursor-default"
                                                >
                                                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                                                        <TrendingUp size={15} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xl font-black italic tabular-nums group-hover:text-black">{profile.atsScore}</span>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-600">ATS Score</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {getDisplayStrength() > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="bg-indigo-600 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3 group hover:bg-white hover:text-black transition-all cursor-default shadow-2xl shadow-indigo-500/20"
                                                >
                                                    <div className="w-8 h-8 bg-white text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        <Zap size={15} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xl font-black italic tabular-nums group-hover:text-black">{getDisplayStrength()}</span>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200 group-hover:text-slate-600">Readiness</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Social Links */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    {[
                                        { Icon: Mail, href: user.email ? `mailto:${user.email}` : '', label: 'Email' },
                                        { Icon: Linkedin, href: ensureAbsoluteUrl(profile.linkedinUrl), label: 'LinkedIn' },
                                        { Icon: Github, href: ensureAbsoluteUrl(profile.githubUrl), label: 'GitHub' },
                                    ].filter(item => !!item.href).map(({ Icon, href, label }, i) => (
                                        <a
                                            key={i}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:-translate-y-1 transition-all group shadow-xl"
                                            title={label}
                                        >
                                            <Icon size={18} className="group-hover:rotate-6 transition-transform" />
                                        </a>
                                    ))}
                                </div>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownloadResume}
                                    className="group relative px-10 py-5 bg-white text-black font-black rounded-[2.5rem] overflow-hidden transition-all hover:pr-16 active:scale-95 shadow-[0_32px_64px_-16px_rgba(255,255,255,0.2)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <span className="relative z-10 text-[11px] uppercase tracking-[0.2em] italic">Download Resume</span>
                                    <ArrowUpRight className="absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Skills & Education Panel */}
                {profile.skills?.length > 0 && (
                    <section className="px-6 md:px-24 py-24 bg-[#080808]">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                                <motion.div variants={itemVariants} className="space-y-10">
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] block">Technical Matrix</span>
                                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none italic uppercase">
                                            Neural <br /> Arsenal
                                        </h2>
                                        <p className="text-base text-slate-500 max-w-md font-medium leading-relaxed">
                                            Technical stack and capabilities acquired through rigorous academic and personal development.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {profile.skills.map((skill, i) => (
                                            <motion.div
                                                key={i}
                                                whileHover={{ y: -5, scale: 1.05 }}
                                                className="group px-4 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all cursor-default shadow-lg text-center"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">{skill}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {profile.education?.length > 0 && (
                                    <motion.div variants={itemVariants} className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
                                        <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity duration-1000 pointer-events-none">
                                                <Cpu className="text-indigo-500" size={80} />
                                            </div>
                                            <div className="space-y-2 mb-10">
                                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Academic Performance</h3>
                                                <div className="w-10 h-1 bg-indigo-500 rounded-full" />
                                            </div>
                                            <div className="space-y-10">
                                                {profile.education.map((edu, i) => (
                                                    <div key={i} className="relative pl-8 border-l-2 border-indigo-500/20 space-y-2 group/edu">
                                                        <div className="absolute w-4 h-4 bg-indigo-600 border-4 border-[#080808] rounded-full -left-[9px] top-1 group-hover/edu:scale-125 transition-transform shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                                                        <div className="flex justify-between items-start gap-4">
                                                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none group-hover/edu:text-indigo-400 transition-colors">{edu.degree}</h4>
                                                            <span className="text-2xl font-black text-indigo-400 italic tabular-nums shrink-0">#{edu.grade}</span>
                                                        </div>
                                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{edu.institution}</p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/5">
                                                            <Calendar size={11} className="text-indigo-500" /> Class of {edu.year}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Education Detail (only if education exists but skills section didn't render it) */}
                {!profile.skills?.length && profile.education?.length > 0 && (
                    <section className="px-6 md:px-24 py-24 bg-[#050505] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
                        <div className="max-w-7xl mx-auto">
                            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                <div className="lg:col-span-4 space-y-6">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] block">Academic Pedigree</span>
                                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
                                        Scholastic <br /> <span className="text-indigo-500">Heritage</span>
                                    </h2>
                                </div>
                                <div className="lg:col-span-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {profile.education.map((edu, idx) => (
                                            <div key={idx} className="group bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-5 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-500">
                                                <div className="flex justify-between items-start">
                                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                        <GraduationCap size={22} />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-black text-white">{edu.grade}</span>
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Grade</p>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-black text-white italic uppercase tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">{edu.degree}</h3>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{edu.institution}</p>
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/5">
                                                    <Calendar size={11} className="text-indigo-500" /> {edu.year}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* Executive Pitch / Bio */}
                {(profile.bio || profile.recruiterPitch) && (
                    <section className="py-32 md:py-48 relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-600 pointer-events-none opacity-[0.03]" />
                        <div className="max-w-6xl mx-auto px-6 text-center space-y-16 md:space-y-24">
                            <motion.div variants={itemVariants} className="space-y-6">
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] block">Executive Narrative</span>
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
                                    Professional <br /> <span className="text-indigo-500">Identity</span>
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start text-left">
                                <motion.div
                                    variants={itemVariants}
                                    className="lg:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-2xl relative group"
                                >
                                    <div className="absolute -top-5 -left-5 w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                        <Quote size={30} className="text-white" />
                                    </div>
                                    <div className="space-y-8">
                                        <p className="text-xl md:text-2xl font-medium text-slate-200 leading-relaxed italic">
                                            "{profile.recruiterPitch || profile.bio}"
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                <Sparkles size={18} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                                                AI-Synthesized Recruiter Pitch
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                        <div className="w-8 h-[2px] bg-indigo-500" /> Career Paths
                                    </h3>
                                    <div className="space-y-3">
                                        {(profile.careerPaths || ['Software Engineering', 'System Design']).map((path, idx) => (
                                            <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white hover:text-black transition-all group cursor-default">
                                                <div className="w-9 h-9 bg-indigo-500 text-white rounded-xl flex items-center justify-center group-hover:bg-slate-900 transition-colors shrink-0">
                                                    <Briefcase size={16} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-[0.15em]">{path}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Projects */}
                {profile.projects?.length > 0 && (
                    <section className="px-6 md:px-24 py-24 bg-[#0a0a0a]">
                        <div className="max-w-7xl mx-auto space-y-16">
                            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] block">Technical Portfolio</span>
                                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none italic uppercase">
                                        Project <br /> Showcase
                                    </h2>
                                </div>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest max-w-[200px] text-right hidden md:block">
                                    Technological artifacts and solutions built from scratch.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                {profile.projects.map((proj, i) => (
                                    <motion.div
                                        key={i}
                                        variants={itemVariants}
                                        whileHover={{ y: -8 }}
                                        className="group bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl transition-all hover:bg-white/[0.07]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="w-13 h-13 p-3 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                                    <Terminal size={22} />
                                                </div>
                                                {(proj.link || profile.githubUrl) && (
                                                    <a
                                                        href={ensureAbsoluteUrl(proj.link || profile.githubUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-3 bg-white/5 hover:bg-white text-slate-400 hover:text-black rounded-full transition-all border border-white/10"
                                                    >
                                                        <Github size={17} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">
                                                    {proj.title}
                                                </h3>
                                                <p className="text-slate-400 text-sm font-medium leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all">
                                                    {proj.description}
                                                </p>
                                            </div>
                                            {proj.technologies?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {proj.technologies.map((tech, j) => (
                                                        <span key={j} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:border-indigo-500/30 transition-all">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Certifications & Achievements */}
                {(profile.certifications?.length > 0 || profile.achievements?.length > 0) && (
                    <section className="px-6 md:px-24 py-32 md:py-48">
                        <div className="max-w-7xl mx-auto space-y-16">
                            <div className="text-center space-y-4">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] block">Verified Milestones</span>
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
                                    Global Recognition
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)]">
                                {/* Certifications */}
                                <div className="p-12 md:p-16 bg-[#080808]/80 backdrop-blur-3xl relative group border-b md:border-b-0 md:border-r border-white/5">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                                        <Award className="text-amber-500" size={140} />
                                    </div>
                                    <div className="relative z-10 space-y-10">
                                        <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                            <div className="w-10 h-[2px] bg-amber-500/30" /> Certifications
                                        </h3>
                                        <div className="space-y-6">
                                            {profile.certifications?.length > 0
                                                ? profile.certifications.map((cert, i) => (
                                                    <div key={i} className="flex items-center gap-5 group/item">
                                                        <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-amber-500 border border-white/5 group-hover/item:bg-amber-500 group-hover/item:text-black transition-all shrink-0">
                                                            <ShieldCheck size={18} />
                                                        </div>
                                                        <span className="text-lg font-black text-slate-300 group-hover/item:text-white transition-colors uppercase italic tracking-tighter">
                                                            {cert}
                                                        </span>
                                                    </div>
                                                ))
                                                : <p className="text-slate-600 italic text-xs">No certifications documented.</p>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="p-12 md:p-16 bg-slate-950/80 backdrop-blur-3xl relative group">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                                        <Trophy className="text-rose-500" size={140} />
                                    </div>
                                    <div className="relative z-10 space-y-10">
                                        <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                            <div className="w-10 h-[2px] bg-rose-500/30" /> Achievements
                                        </h3>
                                        <div className="space-y-6">
                                            {profile.achievements?.length > 0
                                                ? profile.achievements.map((ach, i) => (
                                                    <div key={i} className="flex items-center gap-5 group/item">
                                                        <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-rose-500 border border-white/5 group-hover/item:bg-rose-500 group-hover/item:text-white transition-all shrink-0">
                                                            <Trophy size={18} />
                                                        </div>
                                                        <span className="text-lg font-black text-slate-300 group-hover/item:text-white transition-colors uppercase italic tracking-tighter">
                                                            {ach}
                                                        </span>
                                                    </div>
                                                ))
                                                : <p className="text-slate-600 italic text-xs">No achievements documented.</p>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="px-6 md:px-24 py-24 border-t border-white/10 text-center space-y-10">
                    <div className="inline-flex items-center gap-3 p-3 bg-white/5 rounded-3xl border border-white/10">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white italic font-black shadow-2xl">
                            S
                        </div>
                        <span className="text-xl font-black text-white italic tracking-tighter uppercase px-2">
                            SPIMS<span className="text-indigo-500">+</span>
                        </span>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em]">
                            Placement Intelligence System
                        </p>
                        <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">
                            {user.name.toUpperCase()} // PORTFOLIO v4.0
                        </p>
                    </div>
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="flex justify-center pt-6"
                    >
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="p-4 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <ChevronRight size={22} className="text-slate-400 -rotate-90" />
                        </button>
                    </motion.div>
                </footer>
            </motion.main>

            <style dangerouslySetInnerHTML={{
                __html: `
                    body { background: #050505; }
                    ::-webkit-scrollbar { width: 6px; }
                    ::-webkit-scrollbar-track { background: #050505; }
                    ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
                    ::-webkit-scrollbar-thumb:hover { background: #333; }
                `
            }} />
        </div>
    );
};

export default PublicPortfolio;
