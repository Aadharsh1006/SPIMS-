import React from 'react';
import { Construction } from 'lucide-react';

const ComingSoon = ({ title }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 rounded-3xl border border-slate-800">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Construction size={40} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">
                {title} <span className="text-indigo-500">Coming Soon</span>
            </h1>
            <p className="text-slate-400 max-w-md font-bold uppercase tracking-widest text-xs leading-relaxed">
                We are building something amazing. This feature is currently under development and will be available in the next update.
            </p>
        </div>
    );
};

export default ComingSoon;
