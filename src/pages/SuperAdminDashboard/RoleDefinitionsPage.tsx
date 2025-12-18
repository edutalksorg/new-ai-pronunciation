import React, { useEffect, useState } from 'react';
import { Shield, Save, Loader, CheckSquare, Square, Filter } from 'lucide-react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { permissionService } from '../../services/permissionService';
import Button from '../../components/Button';

interface Permission {
    id: string;
    name: string;
    displayName: string;
    module: string;
    action: string;
}

const ROLES = ['Admin', 'Instructor', 'User'];

const RoleDefinitionsPage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<string>('Admin');
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [rolePermissions, setRolePermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [moduleFilter, setModuleFilter] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            loadRolePermissions(selectedRole);
        }
    }, [selectedRole]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await permissionService.getAllPermissions();
            const data = (res as any)?.data || res || [];
            if (Array.isArray(data)) {
                setAllPermissions(data);
            }
        } catch (error) {
            console.error("Failed to load permissions", error);
        } finally {
            setLoading(false);
        }
    };

    const loadRolePermissions = async (roleName: string) => {
        try {
            setLoading(true);
            const res = await permissionService.getRolePermissions(roleName);
            const data = (res as any)?.data || res;
            // Expected data structure: { roleName: "...", permissions: ["Perm.1", "Perm.2"] }
            if (data && Array.isArray(data.permissions)) {
                setRolePermissions(data.permissions);
            } else if (Array.isArray(data)) {
                // Fallback if API returns just array
                setRolePermissions(data);
            } else {
                setRolePermissions([]);
            }
        } catch (error) {
            console.error(`Failed to load permissions for role ${roleName}`, error);
            setRolePermissions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePermission = (permName: string) => {
        setRolePermissions(prev => {
            if (prev.includes(permName)) {
                return prev.filter(p => p !== permName);
            } else {
                return [...prev, permName];
            }
        });
    };

    const handleSave = async () => {
        if (!confirm(`Are you sure you want to update permissions for the "${selectedRole}" role? This will affect ALL users with this role.`)) return;

        try {
            setSaving(true);
            await permissionService.updateRolePermissions(selectedRole, rolePermissions);
            alert(`Permissions for ${selectedRole} updated successfully!`);
        } catch (error) {
            console.error('Failed to update role permissions', error);
            alert('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    const handleSelectAllInModule = (moduleName: string) => {
        const modulePerms = allPermissions.filter(p => p.module === moduleName).map(p => p.name);
        const allSelected = modulePerms.every(p => rolePermissions.includes(p));

        if (allSelected) {
            // Deselect all
            setRolePermissions(prev => prev.filter(p => !modulePerms.includes(p)));
        } else {
            // Select all
            setRolePermissions(prev => [...new Set([...prev, ...modulePerms])]);
        }
    };

    // Group permissions by module
    const modules = Array.from(new Set(allPermissions.map(p => p.module))).sort();

    // Derived state for filtering
    const visibleModules = moduleFilter === 'all' ? modules : modules.filter(m => m === moduleFilter);

    return (
        <SuperAdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Role Definitions</h1>
                    <p className="text-slate-600 dark:text-slate-400">Define default permissions for each System Role</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        {ROLES.map(role => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedRole === role
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-200px)]">
                {/* Visual Header & Controls */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <Shield className="text-indigo-600" size={20} />
                        <span className="font-semibold text-slate-900 dark:text-white">
                            Editing: <span className="text-indigo-600">{selectedRole}</span>
                        </span>
                        <span className="ml-2 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                            {rolePermissions.length} permissions selected
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                                className="pl-9 pr-4 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Modules</option>
                                {modules.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            isLoading={saving}
                            leftIcon={<Save size={18} />}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Permissions Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader className="animate-spin text-indigo-600" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {visibleModules.map(moduleName => {
                                const modulePerms = allPermissions.filter(p => p.module === moduleName);
                                const allSelected = modulePerms.every(p => rolePermissions.includes(p.name));
                                const someSelected = modulePerms.some(p => rolePermissions.includes(p.name));

                                return (
                                    <div key={moduleName} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                        <div className="bg-slate-50 dark:bg-slate-800 p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                                {moduleName}
                                            </h3>
                                            <button
                                                onClick={() => handleSelectAllInModule(moduleName)}
                                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                {allSelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white dark:bg-slate-900">
                                            {modulePerms.map(perm => {
                                                const isSelected = rolePermissions.includes(perm.name);
                                                return (
                                                    <div
                                                        key={perm.id}
                                                        onClick={() => handleTogglePermission(perm.name)}
                                                        className={`
                                                            flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                                            ${isSelected
                                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`mt-0.5 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>
                                                                {perm.displayName}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                                                {perm.name.split('.').pop()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default RoleDefinitionsPage;
