/**
 * Permission Helper
 * Utility functions for checking admin permissions
 */

/**
 * Check if admin has required permission
 * @param {Object} admin - Admin object from req.admin (with populated role)
 * @param {String} requiredPermission - Permission string to check (e.g., 'product_add', 'category_delete')
 * @returns {Boolean} - true if admin has permission, false otherwise
 */
exports.hasPermission = (admin, requiredPermission) => {
    try {
        // If admin is super admin, allow all permissions
        if (admin.isSuperAdmin === true) {
            return true;
        }

        // If admin has no role, deny access
        if (!admin.role || !admin.role.permissions) {
            return false;
        }

        // Check if admin's role has the required permission
        const permissions = Array.isArray(admin.role.permissions) 
            ? admin.role.permissions 
            : [];

        return permissions.includes(requiredPermission);
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};

/**
 * Middleware function to check permission
 * Use this in routes to protect endpoints
 * @param {String} requiredPermission - Permission string required for this route
 * @returns {Function} - Express middleware function
 */
exports.checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            // Admin should be attached by authorization middleware
            if (!req.admin) {
                return res.status(401).json({
                    status: false,
                    message: 'Unauthorized: Admin not found'
                });
            }

            // Check if admin has permission
            if (exports.hasPermission(req.admin, requiredPermission)) {
                return next();
            }

            // Permission denied
            return res.status(403).json({
                status: false,
                message: `Access denied: You do not have permission to ${requiredPermission.replace(/_/g, ' ')}`
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error checking permission'
            });
        }
    };
};

/**
 * Check multiple permissions (OR logic)
 * Returns true if admin has ANY of the required permissions
 * @param {Object} admin - Admin object from req.admin
 * @param {Array<String>} requiredPermissions - Array of permission strings
 * @returns {Boolean} - true if admin has at least one permission
 */
exports.hasAnyPermission = (admin, requiredPermissions) => {
    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        return false;
    }

    return requiredPermissions.some(permission => exports.hasPermission(admin, permission));
};

/**
 * Check multiple permissions (AND logic)
 * Returns true if admin has ALL of the required permissions
 * @param {Object} admin - Admin object from req.admin
 * @param {Array<String>} requiredPermissions - Array of permission strings
 * @returns {Boolean} - true if admin has all permissions
 */
exports.hasAllPermissions = (admin, requiredPermissions) => {
    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        return false;
    }

    return requiredPermissions.every(permission => exports.hasPermission(admin, permission));
};

