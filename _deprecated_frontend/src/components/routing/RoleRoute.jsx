import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Role-Based Access Control (RBAC) Route Guard
 */
const RoleRoute = ({ allowedRoles = [], requireApprovedVolunteer = false, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#faf8f5' }}>
        <p style={{ fontWeight: 600, color: '#1b4d2e' }}>Verifying security permissions...</p>
      </div>
    );
  }

  // 1. Unauthenticated users -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role mismatch -> redirect to styled 403 Unauthorized guard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Unapproved volunteers -> redirect to volunteer pending portal
  if (requireApprovedVolunteer && user?.role === 'volunteer' && user?.status !== 'approved') {
    return <Navigate to="/volunteer" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleRoute;
