import React from 'react';
import { Clock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import Button from '../../components/Button';

const InstructorPendingPage: React.FC = () => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 dark:text-yellow-400">
                    <Clock size={40} />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Application Pending
                </h1>

                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Your instructor application is currently under review by our administrators.
                    You will receive an email once your account has been approved.
                </p>

                <div className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InstructorPendingPage;
