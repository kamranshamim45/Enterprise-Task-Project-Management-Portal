import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return "/login";
    return user.role === 'admin' ? "/admin/dashboard" : "/user/dashboard";
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={getDashboardRoute()} /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={getDashboardRoute()} /> : <Register />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <UserDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Redirect old dashboard route based on role */}
      <Route
        path="/dashboard"
        element={<Navigate to={getDashboardRoute()} />}
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <Projects />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout>
              <Tasks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to={getDashboardRoute()} />}
      />
    </Routes>
  );
}

export default App;
