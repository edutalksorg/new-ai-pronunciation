import React, { useState } from 'react';
import { Save, Lock, Bell, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, showToast } from '../../store/uiSlice';
import { RootState } from '../../store';

const AdminSettingsPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useSelector((state: RootState) => state.ui);
    const { user } = useSelector((state: RootState) => state.auth);

    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        adminAlert: true,
    });

    const handleSave = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        dispatch(showToast({ message: 'Admin settings updated successfully', type: 'success' }));
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-1">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Settings</h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 ml-14">Manage admin preferences and account security</p>
                </div>

                <div className="space-y-6">

                    {/* Appearance */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
                            <Moon className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Appearance</h2>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Theme</p>
                                <p className="text-sm text-slate-500">Choose your preferred UI mode</p>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => dispatch(toggleTheme())}
                                leftIcon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            >
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </Button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
                            <Bell className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Notifications</h2>
                        </div>

                        <div className="space-y-4">

                            {/* Email Notifications */}
                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                                    <p className="text-sm text-slate-500">Receive important admin updates</p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={e => setNotifications({ ...notifications, email: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>

                            {/* Admin Alerts */}
                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Admin Alerts</p>
                                    <p className="text-sm text-slate-500">Critical system notifications</p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.adminAlert}
                                        onChange={e => setNotifications({ ...notifications, adminAlert: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>

                        </div>
                    </div>

                    {/* Security */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
                            <Lock className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Security</h2>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Change Password</p>
                                    <p className="text-sm text-slate-500">Last updated recently</p>
                                </div>

                                <Button variant="outline">
                                    Update
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Save Changes */}
                    <div className="flex justify-end">
                        <Button onClick={handleSave} isLoading={loading} leftIcon={<Save size={18} />}>
                            Save Changes
                        </Button>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettingsPage;
