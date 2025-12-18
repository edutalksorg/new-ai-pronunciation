import React, { useEffect, useState } from 'react';
import { Search, Loader, Filter, User, RotateCcw, Check, X, Shield, AlertCircle } from 'lucide-react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { adminService } from '../../services/admin';
import { permissionService, UserPermissions, Permission } from '../../services/permissionService';
import Button from '../../components/Button';

const RoleManagementPage: React.FC = () => {
    // We reuse adminService.getAllUsers to find users to manage
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [updating, setUpdating] = useState<string | null>(null);

    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [permSearchTerm, setPermSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');

    useEffect(() => {
        loadUsers();
        loadAllPermissions();
    }, []);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            let allItems: any[] = [];
            let page = 1;
            const pageSize = 100;
            let hasMore = true;

            while (hasMore) {
                const res = await adminService.getAllUsers(pageSize, page);
                const data = (res as any)?.data || res;
                const items = Array.isArray(data) ? data : data?.items || [];

                if (items.length === 0) {
                    hasMore = false;
                } else {
                    allItems = [...allItems, ...items];
                    if (items.length < pageSize) hasMore = false;
                    else page++;
                }
                if (page > 50) hasMore = false;
            }

            // Filter out SuperAdmin
            const filteredUsers = allItems.filter((u: any) => {
                const r = String(u.role || '').toLowerCase();
                return !r.includes('superadmin') && !r.includes('super admin');
            });

            setUsers(filteredUsers);
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
            let data = (res as any)?.data || res;

            // FALLBACK: If rolePermissions is missing aka backend didn't expand it,
            // we manually fetch the role definitions to ensure UI shows "Role Default" correctly.
            if (!data.rolePermissions || data.rolePermissions.length === 0) {
                // Find user's role from the list
                const user = users.find(u => u.id === userId);
                let roleName = data.role || user?.role || '';

                // Normalize to Title Case (Admin, Instructor, User) as expected by RoleDefinitions
                if (roleName) {
                    roleName = roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();

                    try {
                        const roleRes = await permissionService.getRolePermissions(roleName);
                        const roleData = (roleRes as any)?.data || roleRes;
                        const fetchedRolePerms = Array.isArray(roleData.permissions) ? roleData.permissions : (Array.isArray(roleData) ? roleData : []);

                        if (fetchedRolePerms.length > 0) {
                            // console.log('Manually fetched role permissions for', roleName, fetchedRolePerms.length);
                            data = { ...data, rolePermissions: fetchedRolePerms };
                        }
                    } catch (err) {
                        console.warn('Fallback fetch for role permissions failed', err);
                    }
                }
            }

            setUserPermissions(data);
        } catch (error) {
            console.error("Failed to load user permissions", error);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handlePermissionChange = async (permName: string, action: 'GRANT' | 'REVOKE' | 'RESET') => {
        if (!selectedUser || !userPermissions) return;

        try {
            setUpdating(permName);

            // Calculate new arrays
            let newGranted = [...(userPermissions.grantedPermissions || [])];
            let newRevoked = [...(userPermissions.revokedPermissions || [])];

            // Helper to remove
            const remove = (arr: string[], val: string) => arr.filter(p => p !== val);
            const add = (arr: string[], val: string) => [...new Set([...arr, val])]; // ensure unique

            if (action === 'GRANT') {
                newGranted = add(newGranted, permName);
                newRevoked = remove(newRevoked, permName);
            } else if (action === 'REVOKE') {
                newRevoked = add(newRevoked, permName);
                newGranted = remove(newGranted, permName);
            } else if (action === 'RESET') {
                newGranted = remove(newGranted, permName);
                newRevoked = remove(newRevoked, permName);
            }

            // Call API
            await permissionService.updateUserPermissions(selectedUser, newGranted, newRevoked);

            // Reload to get updated effective permissions
            handleUserSelect(selectedUser);

        } catch (e) {
            console.error(e);
            alert('Failed to update permission');
        } finally {
            setUpdating(null);
        }
    };

    const handleResetAll = async () => {
        if (!selectedUser) return;
        if (!confirm('Are you sure? This will reset all custom permissions for this user.')) return;
        try {
            await permissionService.resetUserPermissions(selectedUser);
            handleUserSelect(selectedUser);
        } catch (e) { console.error(e); }
    };

    // Filter Logic
    const modules = Array.from(new Set(allPermissions.map(p => p.module))).sort();

    const filteredPerms = allPermissions.filter(p => {
        if (moduleFilter !== 'all' && p.module !== moduleFilter) return false;
        if (permSearchTerm && !p.name.toLowerCase().includes(permSearchTerm.toLowerCase()) && !p.displayName.toLowerCase().includes(permSearchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <SuperAdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Permission Overrides</h1>
                <p className="text-slate-600 dark:text-slate-400">Manage fine-grained permission exceptions for individual users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
                {/* User List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find user..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loadingUsers ? (
                            <div className="flex justify-center p-4"><Loader className="animate-spin text-indigo-500" /></div>
                        ) : (
                            users
                                .filter(u => u.fullName?.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()))
                                .map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUserSelect(user.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left
                                        ${selectedUser === user.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-500">
                                            {user.avatar ? <img src={user.avatar} className="w-8 h-8 rounded-full" /> : user.fullName?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.fullName}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.role}</p>
                                        </div>
                                    </button>
                                ))
                        )}
                    </div>
                </div>

                {/* Permission Matrix */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <User size={48} className="mb-4 opacity-50" />
                            <p>Select a user to manage permissions</p>
                        </div>
                    ) : loadingPermissions || !userPermissions ? (
                        <div className="flex-1 flex items-center justify-center"><Loader className="animate-spin text-indigo-600" size={32} /></div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {userPermissions.fullName}
                                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase">{userPermissions.role}</span>
                                    </h2>
                                </div>
                                <Button variant="secondary" size="sm" onClick={handleResetAll} leftIcon={<RotateCcw size={14} />}>Reset All Overrides</Button>
                            </div>

                            {/* Filters */}
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search permissions..."
                                        value={permSearchTerm}
                                        onChange={(e) => setPermSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    />
                                </div>
                                <select
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                    className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Modules</option>
                                    {modules.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Permission</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Module</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredPerms.map(perm => {
                                            // Status Logic
                                            const hasRole = userPermissions.rolePermissions?.includes(perm.name);
                                            const isRevoked = userPermissions.revokedPermissions?.includes(perm.name);
                                            const isGranted = userPermissions.grantedPermissions?.includes(perm.name);

                                            // Effective State: Does the user effectively have this permission?
                                            // They have it if explicitly Granted OR (Inherited AND NOT Revoked)
                                            const effectivelyHasPermission = isGranted || (hasRole && !isRevoked);

                                            let statusBadge;
                                            if (isRevoked) {
                                                statusBadge = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><X size={12} /> Revoked</span>;
                                            } else if (isGranted) {
                                                statusBadge = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><Check size={12} /> Granted</span>;
                                            } else if (hasRole) {
                                                statusBadge = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Shield size={12} /> Role Default</span>;
                                            } else {
                                                statusBadge = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">None</span>;
                                            }

                                            return (
                                                <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-6 py-3">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{perm.displayName}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{perm.name}</p>
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{perm.module}</td>
                                                    <td className="px-6 py-3">{statusBadge}</td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {updating === perm.name ? (
                                                                <Loader className="animate-spin text-indigo-500" size={16} />
                                                            ) : (
                                                                <>
                                                                    {/* Reset Button: Only if there is an override (Grant/Revoke) */}
                                                                    {(isGranted || isRevoked) && (
                                                                        <button
                                                                            onClick={() => handlePermissionChange(perm.name, 'RESET')}
                                                                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                                                                            title="Reset to Default"
                                                                        >
                                                                            <RotateCcw size={16} />
                                                                        </button>
                                                                    )}

                                                                    {/* Grant Button: Only if they don't have it effectively */}
                                                                    {!effectivelyHasPermission && (
                                                                        <button
                                                                            onClick={() => handlePermissionChange(perm.name, 'GRANT')}
                                                                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/40"
                                                                        >
                                                                            Grant
                                                                        </button>
                                                                    )}

                                                                    {/* Revoke Button: Only if they DO have it effectively */}
                                                                    {effectivelyHasPermission && (
                                                                        <button
                                                                            onClick={() => handlePermissionChange(perm.name, 'REVOKE')}
                                                                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40"
                                                                        >
                                                                            Revoke
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default RoleManagementPage;
