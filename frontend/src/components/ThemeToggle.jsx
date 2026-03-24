// frontend/src/components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        // Initialize from document class
        setIsLight(document.documentElement.classList.contains('light'));
    }, []);

    const toggleTheme = () => {
        const newLight = !isLight;
        setIsLight(newLight);
        if (newLight) {
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 flex items-center justify-center transition-all active:scale-95 group relative"
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            
            {isLight ? (
                <Moon size={18} className="text-indigo-400 animate-in zoom-in duration-300" />
            ) : (
                <Sun size={18} className="text-amber-400 animate-in zoom-in duration-300" />
            )}
        </button>
    );
};

export default ThemeToggle;
