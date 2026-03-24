// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/api';
// Using a simple jwt decode if jwt-decode is not installed, or assuming it will be.
// For scaffolding, we'll use a placeholder or assumes it's available.
// A common trick is to use JSON.parse(atob(token.split('.')[1]))

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ user: null, token: null, loading: true });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAuth({ user: null, token: null, loading: false });
            return;
        }

        // Simple JWT decode
        let decoded = {};
        try {
            decoded = JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error('Initial token decode failed', e);
        }

        authApi
            .me()
            .then(res => {
                setAuth({ user: { ...res.data, role: decoded.role, collegeId: decoded.collegeId }, token, loading: false });
            })
            .catch(() => {
                localStorage.removeItem('token');
                setAuth({ user: null, token: null, loading: false });
            });
    }, []);

    const login = async (token, userFromBackend = null) => {
        localStorage.setItem('token', token);
        let userData = userFromBackend;

        if (!userData) {
            // If only token provided, fetch user data
            try {
                const res = await authApi.me();
                userData = res.data;
            } catch (err) {
                console.error('Failed to fetch user after login', err);
                logout();
                return;
            }
        }

        // Simple JWT decode to get role and collegeId if not already present in userData
        let decoded = {};
        try {
            decoded = JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error('Login token decode failed', e);
        }

        setAuth({ user: userData, token, loading: false });

        // Redirect based on role
        if (userData) {
            switch (userData.role) {
                case 'SUPER_ADMIN': window.location.href = '/superadmin/colleges'; break;
                case 'TPO': window.location.href = '/tpo/dashboard'; break;
                case 'FACULTY': window.location.href = '/faculty/dashboard'; break;
                case 'STUDENT': window.location.href = '/student/dashboard'; break;
                case 'RECRUITER': window.location.href = '/recruiter/dashboard'; break;
                case 'ALUMNI': window.location.href = '/alumni/dashboard'; break;
                default: window.location.href = '/';
            }
        }
    };



    const register = async (userData) => {
        const res = await authApi.register(userData);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuth({ user: null, token: null, loading: false });
    };

    const updateUser = (userData) => {
        setAuth(prev => ({ ...prev, user: userData }));
    };

    return (
        <AuthContext.Provider value={{ ...auth, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
