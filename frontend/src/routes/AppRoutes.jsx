import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public MPA Page Components
import Home from '../pages/Home';
import Products from '../pages/Products';
import WorkingHorses from '../pages/WorkingHorses';
import Donate from '../pages/Donate';
import Contact from '../pages/Contact';
import ProductOrder from '../pages/ProductOrder';
import Cart from '../pages/Cart';

// Gateways & Auth Pages
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AdminAuth from '../pages/AdminAuth';
import VolunteerAuth from '../pages/VolunteerAuth';
import Unauthorized from '../pages/Unauthorized';

// Protected Dashboards
import AdminDashboard from '../pages/AdminDashboard';
import VolunteerDashboard from '../pages/VolunteerDashboard';
import MyOrders from '../pages/MyOrders';

// RBAC Protection Guards
import ProtectedRoute from '../components/routing/ProtectedRoute';
import RoleRoute from '../components/routing/RoleRoute';

/**
 * Multi-Page Application (MPA) Router Tree with Role-Based Access Control (RBAC)
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ===================================================
          PUBLIC MULTI-PAGE APPLICATION (MPA) ROUTES
         =================================================== */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/working-horses" element={<WorkingHorses />} />
      <Route path="/donate" element={<Donate />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/order/:productId" element={<ProductOrder />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ===================================================
          AUTHENTICATION & DEDICATED GATEWAY ROUTES
         =================================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={<AdminAuth />} />
      <Route path="/volunteer" element={<VolunteerAuth />} />

      {/* ===================================================
          RBAC PROTECTED ROLE DASHBOARDS
         =================================================== */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/volunteer/dashboard"
        element={
          <RoleRoute allowedRoles={['volunteer']} requireApprovedVolunteer={true}>
            <VolunteerDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-All Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
