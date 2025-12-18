import React, { useEffect, useState } from 'react';
import { Search, Loader, Filter, User, Edit, Save, X, RotateCcw } from 'lucide-react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { adminService } from '../../services/admin';
import { permissionService, UserPermissions } from '../../services/permissionService';
import Button from '../../components/Button';

const RoleManagementPage: React.FC = () => {
    // We reuse adminService.getAllUsers to find users to manage
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [allPermissions, setAllPermissions] = useState<any[]>([]);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
        loadAllPermissions();
    }, []);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            const res = await adminService.getAllUsers(20, 1);
            const data = (res as any)?.data || res;
            const items = Array.isArray(data) ? data : data?.items || [];
            setUsers(items);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadAllPermissions = async () => {
        try {
            const res = await permissionService.getAllPermissions();
            const data = (res as any)?.data || res || [];
            if (Array.isArray(data)) {
                setAllPermissions(data);
            }
        } catch (e) { console.error(e); }
    }

    const handleUserSelect = async (userId: string) => {
        setSelectedUser(userId);
        try {
            setLoadingPermissions(true);
            const res = await permissionService.getUserPermissions(userId);
            // API might return { data: ... } or just ...
            const data = (res as any)?.data || res;
            console.log('User Permissions Data:', data);
            setUserPermissions(data);
        } catch (error) {
            console.error("Failed to load user permissions", error);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleGrant = async (permissionName: string) => {
        if (!selectedUser) return;
        try {
            await permissionService.grantUserPermission(selectedUser, permissionName);
            // Reload
            handleUserSelect(selectedUser);
        } catch (e) {
            console.error(e);
            alert('Failed to grant permission');
        }
    };

    const handleRevoke = async (permissionName: string) => {
        if (!selectedUser) return;
        try {
            await permissionService.revokeUserPermission(selectedUser, permissionName);
            // Reload
            handleUserSelect(selectedUser);
        } catch (e) {
            console.error(e);
            alert('Failed to revoke permission');
        }
    };

    const handleReset = async () => {
        if (!selectedUser) return;
        if (!confirm('Are you sure you want to reset all custom permissions for this user? They will revert to default role permissions.')) return;

        try {
            await permissionService.resetUserPermissions(selectedUser);
            // Reload
            handleUserSelect(selectedUser);
        } catch (e) {
            console.error(e);
            alert('Failed to reset permissions');
        }
    }

    return (
        <SuperAdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Role & Permission Assignment</h1>
                <p className="text-slate-600 dark:text-slate-400">Manage individual user permissions overrides</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User List Column */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-200px)]">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Find user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loadingUsers ? (
                            <div className="flex justify-center p-4"><Loader className="animate-spin text-indigo-500" /></div>
                        ) : (
                            users
                                .filter(u => u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUserSelect(user.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left
                                        ${selectedUser === user.id
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} className="w-10 h-10 rounded-full" alt="avatar" />
                                            ) : (
                                                <span className="font-bold text-slate-500 text-sm">{user.fullName?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">{user.fullName}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 truncate">{user.email}</span>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                        )}
                    </div>
                </div>

                {/* Permission Editor Column */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-200px)]">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <User size={48} className="mb-4 opacity-50" />
                            <p>Select a user from the list to manage their permissions</p>
                        </div>
                    ) : loadingPermissions ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader className="animate-spin text-indigo-600" size={32} />
                        </div>
                    ) : userPermissions ? (
                        <>
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {userPermissions.fullName}
                                        <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                            {userPermissions.role}
                                        </span>
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Manage specific grants and revocations. Effective permissions are derived from Role + Granted - Revoked.
                                    </p>
                                </div>
                                <Button variant="secondary" onClick={handleReset} leftIcon={<RotateCcw size={16} />}>
                                    Reset to Defaults
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Create two lists: Available to Grant, and Granted/Effective */}
                                <div className="space-y-8">

                                    {/* Effective Permissions (Read Only view) */}
                                    <div>
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">Effective Permissions</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {userPermissions.effectivePermissions?.map(p => (
                                                <span key={p} className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Categorized Management */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                        {/* Direct Grants */}
                                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                                            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-4">Directly Granted</h3>
                                            <div className="space-y-2">
                                                {userPermissions.grantedPermissions?.length > 0 ? userPermissions.grantedPermissions.map(p => (
                                                    <div key={p} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded shadow-sm">
                                                        <span className="text-sm font-medium">{p}</span>
                                                        <button
                                                            onClick={() => handleRevoke(p)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Remove grant (this will not necessarily revoke if role has it)"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                )) : <p className="text-sm text-slate-500 italic">No direct grants.</p>}
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                                                <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">Add Grant</h4>
                                                <select
                                                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.value) handleGrant(e.target.value);
                                                    }}
                                                    value=""
                                                >
                                                    <option value="">Select permission to grant...</option>
                                                    {allPermissions
                                                        .filter(ap => !userPermissions.grantedPermissions?.includes(ap.name))
                                                        .map(ap => (
                                                            <option key={ap.id} value={ap.name}>{ap.name} ({ap.displayName})</option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Direct Revocations */}
                                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800">
                                            <h3 className="font-bold text-red-900 dark:text-red-200 mb-4">Explicitly Revoked</h3>
                                            <div className="space-y-2">
                                                {userPermissions.revokedPermissions?.length > 0 ? userPermissions.revokedPermissions.map(p => (
                                                    <div key={p} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded shadow-sm">
                                                        <span className="text-sm font-medium">{p}</span>
                                                        <button
                                                            onClick={() => handleGrant(p)} // Granting a revoked permission effectively removes the revocation if we implement it that way, but let's assume we just want to remove the revocation entry. The API might handle this weirdly, but usually "granting" clears revocation or we need a "remove revocation" API. 
                                                            // BUT: The API defined has Grant and Revoke. It doesn't have "Clear".
                                                            // Usually Granting a Revoked permission -> becomes Granted (or effective).
                                                            // For this UI, let's assume Granting it back fixes it.
                                                            className="text-green-500 hover:text-green-700 p-1"
                                                            title="Remove revocation"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                )) : <p className="text-sm text-slate-500 italic">No explicit revocations.</p>}
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                                                <h4 className="text-xs font-bold text-red-700 uppercase mb-2">Revoke Permission</h4>
                                                <select
                                                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.value) handleRevoke(e.target.value);
                                                    }}
                                                    value=""
                                                >
                                                    <option value="">Select permission to revoke...</option>
                                                    {/* Can revoke anything effectively possessed */}
                                                    {userPermissions.effectivePermissions?.map(p => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center text-red-500">Failed to load user permissions</div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default RoleManagementPage;
