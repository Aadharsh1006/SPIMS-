// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest">
                    Authenticating...
                </p>
            </div>
        </div>
    );

    if (!user) return <Navigate to="/login" />;

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
