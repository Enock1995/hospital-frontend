import { useAuth } from './useAuth';

/**
 * Custom hook for checking user permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if user has a specific role
   * @param {string|Array} roles - Single role or array of roles
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!user || !user.roles) return false;

    const userRoles = user.roles.map(r => r.name);
    
    if (Array.isArray(roles)) {
      return roles.some(role => userRoles.includes(role));
    }
    
    return userRoles.includes(roles);
  };

  /**
   * Check if user has a specific permission
   * @param {string|Array} permissions - Single permission or array of permissions
   * @returns {boolean}
   */
  const hasPermission = (permissions) => {
    if (!user || !user.permissions) return false;

    const userPermissions = user.permissions.map(p => p.name);
    
    if (Array.isArray(permissions)) {
      return permissions.some(permission => userPermissions.includes(permission));
    }
    
    return userPermissions.includes(permissions);
  };

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = () => hasRole('admin');

  /**
   * Check if user is doctor
   * @returns {boolean}
   */
  const isDoctor = () => hasRole('doctor');

  /**
   * Check if user is nurse
   * @returns {boolean}
   */
  const isNurse = () => hasRole('nurse');

  /**
   * Check if user is receptionist
   * @returns {boolean}
   */
  const isReceptionist = () => hasRole('receptionist');

  /**
   * Check if user is lab technician
   * @returns {boolean}
   */
  const isLabTechnician = () => hasRole('lab_technician');

  /**
   * Check if user is pharmacist
   * @returns {boolean}
   */
  const isPharmacist = () => hasRole('pharmacist');

  /**
   * Get user's role names
   * @returns {Array}
   */
  const getUserRoles = () => {
    if (!user || !user.roles) return [];
    return user.roles.map(r => r.name);
  };

  /**
   * Get user's permission names
   * @returns {Array}
   */
  const getUserPermissions = () => {
    if (!user || !user.permissions) return [];
    return user.permissions.map(p => p.name);
  };

  return {
    hasRole,
    hasPermission,
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
    isLabTechnician,
    isPharmacist,
    getUserRoles,
    getUserPermissions,
  };
};

export default usePermissions;