// frontend/src/layouts/StudentLayout.jsx
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatbotPanel from '../components/ChatbotPanel';
import NotificationCenter from '../components/NotificationCenter';
import ThemeToggle from '../components/ThemeToggle';
import { LogOut, LayoutDashboard, Briefcase, FileText, MessageCircle, User, Bot, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/jobs', icon: Briefcase, label: 'Job Board' },
    { to: '/student/applications', icon: FileText, label: 'Applications' },
    { to: '/student/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/student/profile', icon: User, label: 'Professional Portfolio' },
    { to: '/student/interview-prep', icon: Bot, label: 'Interview Prep' },
];

const StudentLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border-main)]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-black text-sm">S+</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">
                        SPIMS<span className="text-indigo-500">+</span>
                    </h1>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold group
                            ${isActive(to)
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-[var(--text-muted)] hover:bg-indigo-600/10 hover:text-indigo-400'
                            }`}
                    >
                        <Icon
                            size={20}
                            className={isActive(to) ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-indigo-400'}
                        />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[var(--border-main)]">
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
        <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden transition-colors duration-300">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — Desktop */}
            <aside className="hidden md:flex w-64 bg-[var(--bg-card)] border-r border-[var(--border-main)] flex-col shrink-0">
                <SidebarContent />
            </aside>

            {/* Sidebar — Mobile Drawer */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--border-main)] flex flex-col z-30 transform transition-transform duration-300 md:hidden
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Header */}
                <header className="h-16 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-main)] px-4 md:px-8 flex items-center justify-between z-50 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-bright)] transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="text-xs md:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest">
                            Student Intelligence Portal
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <NotificationCenter />
                        {/* Avatar with initials */}
                        <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-500/40 flex items-center justify-center">
                            <span className="text-white text-xs font-black">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-[var(--bg-main)] p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            <ChatbotPanel />
        </div>
    );
};

export default StudentLayout;
