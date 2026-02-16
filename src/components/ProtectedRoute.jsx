import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { CCard, CCardBody, CCol, CRow } from '@coreui/react';

/**
 * Protected Route Component
 * Restricts access based on user roles
 */
const ProtectedRoute = ({ children, roles = [], permissions = [] }) => {
  const { hasRole, hasPermission } = usePermissions();

  // Check if user has required role
  const hasRequiredRole = roles.length === 0 || hasRole(roles);

  // Check if user has required permission
  const hasRequiredPermission = permissions.length === 0 || hasPermission(permissions);

  // If user doesn't have access, show unauthorized message
  if (!hasRequiredRole || !hasRequiredPermission) {
    return (
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard className="mt-5">
            <CCardBody className="text-center py-5">
              <div className="mb-4">
                <svg
                  className="text-danger"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 className="text-danger mb-3">Access Denied</h3>
              <p className="text-medium-emphasis mb-4">
                You do not have permission to access this page.
                <br />
                Please contact your administrator if you believe this is an error.
              </p>
              <a href="/dashboard" className="btn btn-primary">
                Return to Dashboard
              </a>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    );
  }

  return children;
};

export default ProtectedRoute;