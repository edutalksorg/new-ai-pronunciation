import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Loader,
    Upload,
    UserCheck,
    Edit2,
    Camera,
    Copy,
    Check,
    ArrowLeft
} from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { usersService } from '../../services/users';
import { showToast } from '../../store/uiSlice';
import { RootState } from '../../store';
import { UserProfile } from '../../types';

const InstructorProfilePage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);

    // State management
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [stats, setStats] = useState({ studentsTotal: 0, coursesTotal: 0, rating: 0, revenue: 0 });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const [profileData, statsData] = await Promise.all([
                    usersService.getInstructorProfile(),
                    usersService.getInstructorStats().catch(() => ({ studentsTotal: 0, coursesTotal: 0, rating: 0, revenue: 0 }))
                ]);

                setProfile(profileData);
                setEditForm(profileData);
                setStats(statsData);
            } catch (error) {
                dispatch(showToast({ message: 'Failed to load profile', type: 'error' }));
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfile();
        else navigate('/login');
    }, [user, dispatch, navigate]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            // In a real app, you'd upload immediately or wait for save
            // For now, let's just simulate preview
        }
    };

    const handleCopyReferral = () => {
        if (profile?.referralCode) {
            navigator.clipboard.writeText(profile.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            dispatch(showToast({ message: 'Referral code copied!', type: 'success' }));
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await usersService.updateProfile(editForm);
            dispatch(showToast({ message: 'Profile updated successfully', type: 'success' }));
            setIsEditing(false);
            setProfile({ ...profile, ...editForm } as UserProfile);
        } catch (error) {
            dispatch(showToast({ message: 'Failed to update profile', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of imports and logic)

    if (loading && !profile) return <Layout><Loader className="w-8 h-8 animate-spin mx-auto mt-20" /></Layout>;
    if (!profile) return null;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header ... */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="mr-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Instructor Profile</h1>
                    </div>
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)} variant="primary" leftIcon={<Edit2 className="w-4 h-4" />}>
                            Edit Profile
                        </Button>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sidebar Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="card text-center">
                            <div className="relative inline-block mb-4">
                                <img
                                    src={profile.avatarUrl || 'https://via.placeholder.com/150'}
                                    alt={profile.fullName}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-green-600"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

                            <h2 className="text-xl font-bold">{profile.fullName}</h2>
                            <p className="text-slate-500 mb-2">{profile.email}</p>
                            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold uppercase tracking-wide">
                                Instructor
                            </div>

                            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 mb-1 font-medium">REFERRAL CODE</p>
                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded border border-slate-300 dark:border-slate-600">
                                    <code className="font-mono font-bold text-lg select-all">{profile.referralCode || 'N/A'}</code>
                                    <button onClick={handleCopyReferral} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold mb-4">Edit Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Full Name</label>
                                        <input
                                            value={editForm.fullName || ''}
                                            onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                                            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bio</label>
                                        <textarea
                                            value={editForm.bio || ''}
                                            onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                                            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-green-500"
                                            rows={4}
                                            placeholder="Tell students about your expertise..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Country</label>
                                        <input
                                            value={editForm.country || ''}
                                            onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))}
                                            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <Button onClick={handleSaveProfile} isLoading={loading} className="flex-1">Save Changes</Button>
                                        <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-2">About Instructor</h3>
                                        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {profile.bio || 'No bio provided yet. Add a bio to help students get to know you!'}
                                        </p>
                                    </div>

                                    <div className="flex justify-center pt-6 border-t dark:border-slate-700">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center w-full max-w-xs">
                                            <p className="text-xs text-slate-500 mb-1">Courses/Topics</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.coursesTotal}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-2">Contact & Location</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                <span className="font-medium">Email:</span> {profile.email}
                                            </div>
                                            {profile.country && (
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <span className="font-medium">Location:</span> {profile.city ? `${profile.city}, ` : ''}{profile.country}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default InstructorProfilePage;
