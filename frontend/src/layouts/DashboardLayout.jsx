// frontend/src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Briefcase, FileText,
    User, LogOut, Menu, Users, BarChart2
} from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';
import ChatbotPanel from '../components/ChatbotPanel';
import BroadcastBanner from '../components/BroadcastBanner';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        const role = user?.role;

        if (role === 'Student') return [
            { icon: LayoutDashboard, label: 'Dashboard', to: '/student/dashboard' },
            { icon: Briefcase, label: 'Job Board', to: '/student/jobs' },
            { icon: FileText, label: 'My Applications', to: '/student/applications' },
            { icon: User, label: 'Profile', to: '/student/profile' },
        ];

        if (role === 'Recruiter') return [
            { icon: LayoutDashboard, label: 'Dashboard', to: '/recruiter/dashboard' },
            { icon: Briefcase, label: 'Manage Jobs', to: '/recruiter/jobs' },
            { icon: Users, label: 'Applicants', to: '/recruiter/applicants' },
        ];

        if (role === 'Faculty') return [
            { icon: LayoutDashboard, label: 'Dashboard', to: '/faculty/dashboard' },
            { icon: FileText, label: 'Approvals', to: '/faculty/approvals' },
        ];

        if (role === 'TPO') return [
            { icon: LayoutDashboard, label: 'Dashboard', to: '/tpo/dashboard' },
            { icon: BarChart2, label: 'Analytics', to: '/tpo/analytics' },
        ];

        return [];
    };

    const navItems = getNavItems();
    const isActive = (path) => location.pathname === path;

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-slate-800 shrink-0">
                <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
                    SPIMS<span className="text-indigo-500">+</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">
                    {user?.role} Portal
                </p>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold group
                            ${isActive(to)
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Icon
                            size={20}
                            className={isActive(to) ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}
                        />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-800 shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-sm font-black rounded-xl transition-all"
                >
                    <LogOut size={16} /> Logout Session
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — Desktop */}
            <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
                <SidebarContent />
            </aside>

            {/* Sidebar — Mobile Drawer */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-30 transform transition-transform duration-300 md:hidden
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                <BroadcastBanner />

                {/* Header */}
                <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 flex items-center justify-between z-50 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden text-slate-400 hover:text-white transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest">
                            {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationCenter />
                        {/* Avatar with initials */}
                        <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-500/40 flex items-center justify-center">
                            <span className="text-white text-xs font-black">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-slate-950 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            <ChatbotPanel />
        </div>
    );
};

export default DashboardLayout;
