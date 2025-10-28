import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    completionPercentage: 0,
    overdueTasks: 0
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        axios.get('https://enterprise-task-project-management-portal-2329.onrender.com/api/projects'),
        axios.get('https://enterprise-task-project-management-portal-2329.onrender.com/api/tasks'),
        axios.get('https://enterprise-task-project-management-portal-2329.onrender.com/api/auth/users') // Assuming admin endpoint for users
      ]);

      const projects = projectsRes.data;
      const tasks = tasksRes.data;
      const users = usersRes.data;

      setProjects(projects);
      setTasks(tasks);
      setUsers(users);

      // Calculate stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'Done').length;
      const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
      const todoTasks = tasks.filter(task => task.status === 'To-Do').length;
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const overdueTasks = tasks.filter(task =>
        task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Done'
      ).length;

      setStats({
        totalUsers: users.length,
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionPercentage,
        overdueTasks
      });
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const taskStatusData = [
    { name: 'To-Do', value: stats.todoTasks, color: '#ef4444' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#f59e0b' },
    { name: 'Done', value: stats.completedTasks, color: '#10b981' }
  ];

  const projectProgressData = projects.slice(0, 5).map(project => {
    const projectTasks = tasks.filter(task => task.project._id === project._id);
    const completed = projectTasks.filter(task => task.status === 'Done').length;
    const total = projectTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      progress
    };
  });

  const projectCompletionTrendData = projects.slice(0, 5).map(project => {
    const projectTasks = tasks.filter(task => task.project._id === project._id);
    const completed = projectTasks.filter(task => task.status === 'Done').length;
    const inProgress = projectTasks.filter(task => task.status === 'In Progress').length;
    const todo = projectTasks.filter(task => task.status === 'To-Do').length;
    return {
      name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
      completed,
      inProgress,
      todo
    };
  });

  const handleViewAttachments = (task) => {
    setSelectedTask(task);
  };

    const handleDownloadFile = (filePath) => {
      const link = document.createElement('a');
      link.href = `https://enterprise-task-project-management-portal-2329.onrender.com${filePath}`;
      link.download = filePath.split('/').pop();
      link.click();
    };

    const handleViewFile = (filePath) => {
      window.open(`https://enterprise-task-project-management-portal-2329.onrender.com${filePath}`, '_blank');
    };

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <div className={`bg-gradient-to-br ${bgColor} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-medium opacity-90">{title}</p>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ backgroundImage: "url('/login.img.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Admin Dashboard 👑
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8">
                Full system overview and management control
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ProfilePictureUpload
                currentAvatar={user?.avatarUrl}
                onAvatarUpdate={(newAvatarUrl) => updateUser({ ...user, avatarUrl: newAvatarUrl })}
              />
              <p className="text-sm opacity-75 mt-2">Click to change profile picture</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <span className="text-sm font-medium">Users: {stats.totalUsers}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <span className="text-sm font-medium">Projects: {stats.totalProjects}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <span className="text-sm font-medium">Tasks: {stats.totalTasks}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <span className="text-sm font-medium">Completed: {stats.completedTasks}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <span className="text-sm font-medium">Completion: {stats.completionPercentage}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <span className="text-sm font-medium">Overdue: {stats.overdueTasks}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            color="bg-indigo-500"
            bgColor="from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            color="bg-blue-500"
            bgColor="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            color="bg-green-500"
            bgColor="from-green-500 to-green-600"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-yellow-500"
            bgColor="from-yellow-500 to-orange-500"
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-purple-500"
            bgColor="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Completion %"
            value={`${stats.completionPercentage}%`}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="bg-teal-500"
            bgColor="from-teal-500 to-teal-600"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.overdueTasks}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
            color="bg-red-500"
            bgColor="from-red-500 to-red-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Task Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Project Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
              </svg>
              Project Completion Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projectCompletionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="inProgress" stroke="#f59e0b" strokeWidth={3} />
                <Line type="monotone" dataKey="todo" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Admin Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/projects')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Manage Projects
                </button>
                <button
                  onClick={() => navigate('/tasks')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Manage Tasks
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Team Chat
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Completed Tasks with Attachments
              </h3>
              <div className="space-y-4">
                {tasks.filter(task => task.status === 'Done' && task.attachments && task.attachments.length > 0).slice(0, 5).map((task) => (
                  <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <button
                        onClick={() => handleViewAttachments(task)}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        View {task.attachments.length} file{task.attachments.length > 1 ? 's' : ''}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="text-xs text-gray-500">
                      Completed by: {task.assignees?.map(a => typeof a === 'object' ? a.name : users.find(u => u._id === a)?.name || 'Unknown').join(', ')}
                    </div>
                  </div>
                ))}
                {tasks.filter(task => task.status === 'Done' && task.attachments && task.attachments.length > 0).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No completed tasks with attachments yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Attachments for: {selectedTask.title}</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {selectedTask.attachments.map((filePath, index) => {
                  const fileName = filePath.split('/').pop();
                  const isImage = fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg');
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700">{fileName}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewFile(filePath)}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          {isImage ? 'View' : 'Open'}
                        </button>
                        <button
                          onClick={() => handleDownloadFile(filePath)}
                          className="text-green-600 hover:text-green-800 text-sm underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
