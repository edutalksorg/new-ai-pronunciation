import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,
    Settings,
    Users,
    User,
    Home,
    Moon,
    Sun,
    DollarSign,
    Tag,
    CreditCard,
    Shield,
} from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/uiSlice';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { theme } = useSelector((state: RootState) => state.ui);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!profileRef.current) return;
            if (profileOpen && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileOpen]);

    const menuItems = [
        { icon: <Home size={18} />, label: 'Dashboard', path: '/admin' },
        { icon: <Users size={18} />, label: 'Referrals', path: '/admin/referrals' },
        { icon: <DollarSign size={18} />, label: 'Payments', path: '/admin/payments' },
        { icon: <Tag size={18} />, label: 'Coupons', path: '/admin/coupons' },
        { icon: <CreditCard size={18} />, label: 'Subscriptions', path: '/admin/subscriptions' },
        { icon: <User size={18} />, label: 'Profile', path: '/admin/profile' },
        { icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings' },
        { icon: <Shield size={18} />, label: 'Super Admin', path: '/admin/super' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/admin')}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                            EduTalks Admin
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            {theme === 'dark' ? <Sun /> : <Moon />}
                        </button>

                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}`}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full"
                                />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                                    <div className="border-b px-4 py-3 dark:border-slate-700">
                                        <p className="font-semibold">{user?.fullName}</p>
                                        <p className="text-sm text-slate-500">{user?.email}</p>
                                    </div>

                                    <div className="py-2">
                                        {menuItems.map((item) => (
                                            <button
                                                key={item.path}
                                                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                onClick={() => {
                                                    navigate(item.path);
                                                    setProfileOpen(false);
                                                }}
                                            >
                                                {item.icon}
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-t pt-2 dark:border-slate-700">
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            <main className="flex-1">
                <div className="max-w-7xl mx-auto p-6">{children}</div>
            </main>
        </div>
    );
};

export default AdminLayout;
