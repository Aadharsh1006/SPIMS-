// frontend/src/components/NotificationCenter.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Zap, Info, ExternalLink, MessageCircle, Briefcase } from 'lucide-react';
import { requestFirebaseNotificationPermission, onMessageListener } from '../firebase';
import { notificationsApi } from '../api/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import moment from 'moment';

const getNotifIcon = (type, isRead) => {
    const base = clsx(
        "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110",
        isRead ? "bg-slate-800 text-slate-500" : "bg-indigo-600 text-white shadow-indigo-500/20"
    );
    if (type === 'JOB_POSTED') return <div className={base}><Briefcase size={16} /></div>;
    if (type === 'NEW_MESSAGE') return <div className={base}><MessageCircle size={16} /></div>;
    return <div className={base}><Bell size={16} /></div>;
};

const NotificationCenter = () => {
    const navigate = useNavigate();
    const panelRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const { data } = await notificationsApi.list();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const pollInterval = setInterval(fetchNotifications, 30000);

        const setupFirebase = async () => {
            const token = await requestFirebaseNotificationPermission();
            if (token) {
                try {
                    await notificationsApi.registerToken(token);
                } catch (err) {
                    console.error("Failed to register FCM token", err);
                }
            }
        };
        setupFirebase();

        const unsubscribe = onMessageListener((payload) => {
            fetchNotifications();
            toast.success(payload.notification?.title || 'New notification received.');
        });

        return () => {
            if (unsubscribe) unsubscribe();
            clearInterval(pollInterval);
        };
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read.');
        } catch (err) {
            toast.error('Failed to update notifications.');
        }
    };

    const handleNotifClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await notificationsApi.markAsRead(notif._id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
                );
            } catch (err) {
                console.error("Failed to mark as read", err);
            }
        }
        setIsOpen(false);
        switch (notif.type) {
            case 'JOB_POSTED': navigate('/student/jobs'); break;
            case 'APPLICATION_UPDATE': navigate('/student/applications'); break;
            case 'NEW_MESSAGE': navigate('/student/messages'); break;
            default: break;
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "relative p-2.5 rounded-xl transition-all duration-300",
                    isOpen
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
            >
                <Bell
                    size={20}
                    className={clsx(
                        "transition-transform duration-300",
                        unreadCount > 0 && "animate-bounce"
                    )}
                />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-slate-900 items-center justify-center text-[8px] font-black text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[999]">

                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                            >
                                Mark All Read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-14 text-center space-y-3">
                                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-white/5">
                                    <Bell size={22} className="text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        All caught up!
                                    </p>
                                    <p className="text-[9px] text-slate-600 mt-1">
                                        No new notifications right now.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleNotifClick(notif)}
                                        className={clsx(
                                            "p-4 transition-all cursor-pointer group hover:bg-white/5",
                                            !notif.isRead && "bg-indigo-500/5 border-l-2 border-indigo-500"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            {getNotifIcon(notif.type, notif.isRead)}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={clsx(
                                                        "text-[11px] font-black uppercase tracking-wide leading-tight",
                                                        notif.isRead ? "text-slate-400" : "text-white"
                                                    )}>
                                                        {notif.title || notif.payload?.title || 'System Update'}
                                                    </p>
                                                    <span className="text-[9px] text-slate-600 whitespace-nowrap shrink-0">
                                                        {moment(notif.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                                                    {notif.message || notif.payload?.message || notif.payload?.body || 'New notification received.'}
                                                </p>
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                                                    View <ExternalLink size={8} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 bg-white/5 border-t border-white/5 text-center">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">
                            Secure Notification Channel
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
