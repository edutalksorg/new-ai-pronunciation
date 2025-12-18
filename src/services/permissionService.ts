import { apiService } from './api';

export interface Permission {
    id: string;
    name: string;
    displayName: string;
    module: string;
    action: string;
}

export interface UserPermissions {
    userId: string;
    fullName: string;
    role: string;
    effectivePermissions: string[];
    rolePermissions: string[];
    grantedPermissions: string[];
    revokedPermissions: string[];
}

export interface RolePermissions {
    roleId: string;
    roleName: string;
    permissions: string[];
    userCount: number;
}

export const permissionService = {
    // Get all system permissions 
    getAllPermissions: async () => {
        return apiService.get('/permission-management/get-all-permissions');
    },

    // User Permissions
    getUserPermissions: async (userId: string) => {
        return apiService.get(`/permission-management/users/${userId}`);
    },

    updateUserPermissions: async (userId: string, grantPermissions: string[], revokePermissions: string[]) => {
        return apiService.put(`/permission-management/users/${userId}`, {
            userId,
            grantPermissions,
            revokePermissions
        });
    },

    grantUserPermission: async (userId: string, permissionName: string) => {
        return apiService.post(`/permission-management/users/${userId}/grant`, { permissionName });
    },

    revokeUserPermission: async (userId: string, permissionName: string) => {
        return apiService.post(`/permission-management/users/${userId}/revoke`, { permissionName });
    },

    resetUserPermissions: async (userId: string) => {
        return apiService.post(`/permission-management/users/${userId}/reset`, {});
    },

    // Role Permissions
    getRolePermissions: async (roleId: string) => {
        return apiService.get(`/permission-management/roles/${roleId}`);
    },

    updateRolePermissions: async (roleId: string, permissionNames: string[]) => {
        return apiService.put(`/permission-management/roles/${roleId}`, {
            roleName: roleId,
            permissionNames
        });
    }
};
