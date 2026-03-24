// frontend/src/components/BroadcastBanner.jsx
import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/api';
import { Megaphone, X, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BroadcastBanner = () => {
    const { user } = useAuth();
    const [broadcasts, setBroadcasts] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [mounted, setMounted] = useState(false);
    const location = useLocation();

    const fetchBroadcasts = async () => {
        if (!user) return;
        try {
            const { data } = await usersApi.getBroadcasts();
            setBroadcasts(data);
        } catch (error) {
            console.error('Failed to fetch broadcasts');
        }
    };

    useEffect(() => {
        if (user) {
            fetchBroadcasts();
        }
        const interval = setInterval(() => {
            if (user) fetchBroadcasts();
        }, 5 * 60 * 1000);
        // Trigger slide-in animation after mount
        setTimeout(() => setMounted(true), 10);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchBroadcasts();
        }
    }, [location.pathname, user]);

    if (!isVisible || broadcasts.length === 0) return null;

    const current = broadcasts[currentIdx];

    return (
        <div className={`bg-indigo-600 relative overflow-hidden shrink-0 transition-all duration-500
            ${mounted ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>

            {/* Decorative skew overlay */}
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32 pointer-events-none" />

            {/* Dot pattern */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="max-w-[1400px] mx-auto px-6 py-2.5 flex items-center justify-between relative z-10">
                {/* Left — Label + Message */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 bg-white/20 px-2.5 py-1 rounded-lg border border-white/20 whitespace-nowrap shadow-sm shrink-0">
                        <Megaphone size={12} className="text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">
                            Broadcast
                        </span>
                    </div>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tighter shrink-0">
                            {current.title}:
                        </h4>
                        <p className="text-[11px] font-bold text-indigo-100 truncate tracking-tight">
                            {current.message}
                        </p>
                    </div>
                </div>

                {/* Right — Counter + Dismiss */}
                <div className="flex items-center gap-4 ml-8 shrink-0">
                    {broadcasts.length > 1 && (
                        <div className="flex items-center gap-2 border-r border-white/20 pr-4">
                            <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">
                                {currentIdx + 1} / {broadcasts.length}
                            </p>
                            <button
                                onClick={() => setCurrentIdx((currentIdx + 1) % broadcasts.length)}
                                className="w-6 h-6 hover:bg-white/20 rounded-md flex items-center justify-center text-white transition-all active:scale-90"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="w-7 h-7 hover:bg-red-500/20 text-white rounded-lg flex items-center justify-center transition-all group"
                        title="Dismiss for this session"
                    >
                        <X size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BroadcastBanner;
