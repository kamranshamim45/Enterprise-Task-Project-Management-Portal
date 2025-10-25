// This file is deprecated. Use AdminDashboard.jsx or UserDashboard.jsx instead.
// Keeping for backward compatibility if needed.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect to appropriate dashboard based on role
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/user/dashboard" replace />;
  }
};

export default Dashboard;
