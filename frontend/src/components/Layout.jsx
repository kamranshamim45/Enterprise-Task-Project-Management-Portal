import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100'
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverBg: 'hover:bg-green-100'
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100'
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Enterprise Portal
                </h1>
                <p className="text-xs text-gray-500">Project Management Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                  {user?.avatarUrl ? (
                    <img
                      src={`http://localhost:5000${user.avatarUrl}`}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <nav className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 shadow-xl min-h-screen border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-md bg-slate-700 text-gray-300 hover:text-red-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">Navigation</h2>
              <p className="text-sm text-gray-300">Manage your workspace</p>
            </div>

            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                        isActive
                          ? `bg-slate-700 text-white shadow-md border-r-4 border-blue-500`
                          : `text-gray-300 hover:bg-slate-700 hover:text-white`
                      }`}
                    >
                      <div className={`mr-3 p-2 rounded-lg transition-colors duration-200 ${
                        isActive ? 'bg-blue-600' : 'bg-slate-700 group-hover:bg-slate-600'
                      }`}>
                        {React.cloneElement(item.icon, {
                          className: `w-5 h-5 ${isActive ? 'text-white' : 'text-gray-300'}`
                        })}
                      </div>
                      <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                      {isActive && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Quick Stats in Sidebar */}
            <div className="mt-8 p-4 bg-slate-700 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">Active Projects</span>
                  <span className="text-xs font-semibold text-blue-400">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">Pending Tasks</span>
                  <span className="text-xs font-semibold text-orange-400">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">Team Members</span>
                  <span className="text-xs font-semibold text-green-400">8</span>
                </div>
              </div>
            </div>
          </div>
        </nav>



        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
