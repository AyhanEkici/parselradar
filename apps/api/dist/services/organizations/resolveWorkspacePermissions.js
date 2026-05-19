"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveWorkspacePermissions = resolveWorkspacePermissions;
exports.canPerformWorkspaceAction = canPerformWorkspaceAction;
function resolveWorkspacePermissions(role) {
    const canRead = ['OWNER', 'ADMIN', 'ANALYST', 'VIEWER'].includes(role);
    const canManageMembers = ['OWNER', 'ADMIN'].includes(role);
    const canManageWorkspace = ['OWNER', 'ADMIN', 'ANALYST'].includes(role);
    return {
        role,
        canRead,
        canManageMembers,
        canManageWorkspace,
        canCreateSharedAnalysis: canManageWorkspace,
        canReadSharedAnalysis: canRead,
    };
}
function canPerformWorkspaceAction(role, action) {
    const permissions = resolveWorkspacePermissions(role);
    switch (action) {
        case 'organization:read':
            return permissions.canRead;
        case 'organization:manage-members':
            return permissions.canManageMembers;
        case 'workspace:read':
            return permissions.canRead;
        case 'workspace:manage':
            return permissions.canManageWorkspace;
        case 'shared-analysis:create':
            return permissions.canCreateSharedAnalysis;
        case 'shared-analysis:read':
            return permissions.canReadSharedAnalysis;
        default:
            return false;
    }
}
