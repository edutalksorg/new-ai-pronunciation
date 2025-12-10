import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    GraduationCap,
    CreditCard,
    Settings,
    Shield,
    Gift,
    BarChart,
    Layout,
    ExternalLink,
    Plus,
    CheckCircle,
    X,
    ArrowLeft
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { adminService } from '../../services/admin';

const SuperAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'admins' | 'features'>('admins');
    const [admins, setAdmins] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'admin'
    });

    const [responsibilities, setResponsibilities] = useState({
        manage_users: true,
        approve_instructors: true,
        manage_finance: false,
        system_settings: false,
        content_moderation: true
    });

    useEffect(() => {
        if (activeTab === 'admins') {
            loadAdmins();
        }
    }, [activeTab]);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAdmins();
            setAdmins(data);
        } catch (err) {
            console.error('Failed to load admins', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                responsibilities: Object.keys(responsibilities).filter(k => responsibilities[k as keyof typeof responsibilities])
            };

            console.log('Creating Admin:', payload);
            // await adminService.createAdmin(payload); // Uncomment when backend is ready

            // Simulating success for UI demo
            setAdmins([...admins, {
                id: Date.now().toString(),
                fullName: formData.fullName,
                email: formData.email,
                role: 'admin',
                responsibilities: payload.responsibilities,
                createdAt: new Date().toISOString()
            }]);

            setIsCreating(false);
            setFormData({ fullName: '', email: '', password: '', role: 'admin' });
            alert('Admin Created Successfully (Simulation)');
        } catch (err) {
            console.error('Error creating admin:', err);
            alert('Failed to create admin');
        }
    };

    const features = [
        {
            title: 'User Management',
            description: 'Manage learners, instructors, and admins. Verify accounts and handle permissions.',
            icon: <Users className="text-blue-500" size={32} />,
            path: '/admin',
            color: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800'
        },
        {
            title: 'Instructor Oversight',
            description: 'Review instructor applications, monitor content creation, and manage payouts.',
            icon: <GraduationCap className="text-green-500" size={32} />,
            path: '/admin/instructors',
            color: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800'
        },
        {
            title: 'Financials & Payments',
            description: 'Track revenue, process withdrawals, and manage payment gateway settings.',
            icon: <CreditCard className="text-purple-500" size={32} />,
            path: '/admin/payments',
            color: 'bg-purple-50 dark:bg-purple-900/20',
            borderColor: 'border-purple-200 dark:border-purple-800'
        },
        {
            title: 'Subscription Plans',
            description: 'Configure subscription tiers, pricing models, and plan features.',
            icon: <Layout className="text-orange-500" size={32} />,
            path: '/admin/subscriptions',
            color: 'bg-orange-50 dark:bg-orange-900/20',
            borderColor: 'border-orange-200 dark:border-orange-800'
        },
        {
            title: 'Coupons & Referrals',
            description: 'Create discount coupons and manage the referral reward system.',
            icon: <Gift className="text-pink-500" size={32} />,
            path: '/admin/coupons',
            color: 'bg-pink-50 dark:bg-pink-900/20',
            borderColor: 'border-pink-200 dark:border-pink-800'
        },
        {
            title: 'System Settings',
            description: 'Global configuration for the application, mailers, and integrations.',
            icon: <Settings className="text-slate-500" size={32} />,
            path: '/admin/settings',
            color: 'bg-slate-50 dark:bg-slate-800',
            borderColor: 'border-slate-200 dark:border-slate-700'
        },
        {
            title: 'Content Analytics',
            description: 'Deep dive into course engagement, quiz performance, and user retention.',
            icon: <BarChart className="text-indigo-500" size={32} />,
            path: '/admin/analytics',
            color: 'bg-indigo-50 dark:bg-indigo-900/20',
            borderColor: 'border-indigo-200 dark:border-indigo-800'
        },
        {
            title: 'Referral Management',
            description: 'Detailed view of referral network and commission tracking.',
            icon: <Users className="text-teal-500" size={32} />,
            path: '/admin/referrals',
            color: 'bg-teal-50 dark:bg-teal-900/20',
            borderColor: 'border-teal-200 dark:border-teal-800'
        }
    ];

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                                    <Shield className="text-red-600" size={40} />
                                    Super Admin Control Center
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Centralized access to all application modules and administrative functions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8">
                        <button
                            onClick={() => setActiveTab('admins')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'admins'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            Manage Admins
                        </button>
                        <button
                            onClick={() => setActiveTab('features')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'features'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            All Features
                        </button>
                    </div>

                    {/* Admin Management Tab */}
                    {activeTab === 'admins' && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Accounts</h2>
                                <Button onClick={() => setIsCreating(true)} leftIcon={<Plus size={18} />}>
                                    Create New Admin
                                </Button>
                            </div>

                            {isCreating && (
                                <div className="mb-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Admin Account</h3>
                                        <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-red-500">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreateAdmin} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                                Assign Responsibilities (Access Controls)
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {Object.entries(responsibilities).map(([key, value]) => (
                                                    <label key={key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={value}
                                                            onChange={() => setResponsibilities(prev => ({ ...prev, [key as keyof typeof responsibilities]: !value }))}
                                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-slate-700 dark:text-slate-300 capitalize">
                                                            {key.replace('_', ' ')}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <Button variant="secondary" type="button" onClick={() => setIsCreating(false)}>
                                                Cancel
                                            </Button>
                                            <Button variant="primary" type="submit">
                                                Create Admin
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Responsibilities</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {loading ? (
                                            <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                                        ) : admins.length === 0 ? (
                                            <tr><td colSpan={4} className="p-4 text-center">No admins found other than you.</td></tr>
                                        ) : (
                                            admins.map((admin) => (
                                                <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                        {admin.fullName}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{admin.email}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {admin.responsibilities?.map((resp: string) => (
                                                                <span key={resp} className="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                                                                    {resp.replace('_', ' ')}
                                                                </span>
                                                            )) || <span className="text-slate-400 text-sm">Reviewing All</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Features Grid Tab */}
                    {activeTab === 'features' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(feature.path)}
                                    className={`
                    relative group cursor-pointer rounded-xl border p-6 transition-all duration-300
                    hover:shadow-lg hover:-translate-y-1
                    ${feature.color} ${feature.borderColor}
                  `}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                            {feature.icon}
                                        </div>
                                        <ExternalLink
                                            size={20}
                                            className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>

                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default SuperAdminPage;
