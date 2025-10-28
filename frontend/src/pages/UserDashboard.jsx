import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import socket from '../sockets/socket';

const UserDashboard = () => {
  const [stats, setStats] = useState({
    myTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    myProjects: 0,
    completionPercentage: 0,
    overdueTasks: 0
  });
  const [myTasks, setMyTasks] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserDashboardData();
    }
  }, [user]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!user) return;

    socket.on('projectCreated', (newProject) => {
      // Check if user is a member of the new project
      if (newProject.members.some(member => member._id === user._id)) {
        socket.emit('joinProject', newProject._id); // Join the new project room
        fetchUserDashboardData(); // Refetch to include new project
      }
    });

    socket.on('taskCreated', (newTask) => {
      // Check if task is assigned to current user
      if (newTask.assignees && newTask.assignees.some(assignee => assignee._id.toString() === user._id)) {
        fetchUserDashboardData(); // Refetch to include new task
      }
    });

    socket.on('taskUpdated', (updatedTask) => {
      // Check if task is assigned to current user
      if (updatedTask.assignees && updatedTask.assignees.some(assignee => assignee._id.toString() === user._id)) {
        fetchUserDashboardData(); // Refetch to include updated task
      }
    });

    return () => {
      socket.off('projectCreated');
      socket.off('taskCreated');
      socket.off('taskUpdated');
    };
  }, [user]);

  // Auto-refresh data every 2 seconds for latest updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUserDashboardData();
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchUserDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get('https://enterprise-task-project-management-portal-2329.onrender.com/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://enterprise-task-project-management-portal-2329.onrender.com/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allTasks = tasksRes.data;
      const allProjects = projectsRes.data;

      // Filter tasks assigned to current user - handle both populated and non-populated data
      const userTasks = allTasks.filter(task => {
        if (task.assignees && Array.isArray(task.assignees)) {
          return task.assignees.some(assignee =>
            (typeof assignee === 'object' ? assignee._id.toString() : assignee) === user._id
          );
        }
        return false;
      });

      // Filter projects where user is a member - handle both populated and non-populated data
      const userProjects = allProjects.filter(project => {
        if (!project.members) return false;
        return project.members.some(member => {
          const memberId = typeof member === 'string' ? member : member._id;
          return memberId === user._id;
        });
      });

      setMyTasks(userTasks);
      setMyProjects(userProjects);

      // Join project rooms for real-time updates
      userProjects.forEach(project => {
        socket.emit('joinProject', project._id);
      });

      // Calculate user-specific stats
      const myTasksCount = userTasks.length;
      const completedTasks = userTasks.filter(task => task.status === 'Done').length;
      const inProgressTasks = userTasks.filter(task => task.status === 'In Progress').length;
      const todoTasks = userTasks.filter(task => task.status === 'To-Do').length;
      const completionPercentage = myTasksCount > 0 ? Math.round((completedTasks / myTasksCount) * 100) : 0;
      const overdueTasks = userTasks.filter(task =>
        task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Done'
      ).length;

      setStats({
        myTasks: myTasksCount,
        completedTasks,
        inProgressTasks,
        todoTasks,
        myProjects: userProjects.length,
        completionPercentage,
        overdueTasks
      });
    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const taskStatusData = [
    { name: 'To-Do', value: stats.todoTasks, color: '#ef4444' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#f59e0b' },
    { name: 'Done', value: stats.completedTasks, color: '#10b981' }
  ];

  const completionData = [
    { name: 'Completed', value: stats.completionPercentage, color: '#10b981' },
    { name: 'Remaining', value: 100 - stats.completionPercentage, color: '#e5e7eb' }
  ];

  const projectProgressData = myProjects.slice(0, 5).map(project => {
    const projectTasks = myTasks.filter(task => task.project._id === project._id);
    const completed = projectTasks.filter(task => task.status === 'Done').length;
    const total = projectTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      progress
    };
  });

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
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                My Dashboard 👤
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8">
                Track your tasks and project progress
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
              <span className="text-sm font-medium">My Tasks: {stats.myTasks}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
              <span className="text-sm font-medium">My Projects: {stats.myProjects}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My Tasks"
            value={stats.myTasks}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            color="bg-blue-500"
            bgColor="from-blue-500 to-blue-600"
          />
          <StatCard
            title="My Projects"
            value={stats.myProjects}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              My Task Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Completion Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              My Project Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & My Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/tasks')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View My Tasks
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Projects
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
                My Recent Tasks
              </h3>
              <div className="space-y-4">
                {myTasks.slice(0, 5).map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'Done' ? 'bg-green-500' :
                        task.status === 'In Progress' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{task.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Priority: <span className={`px-2 py-1 rounded-full text-xs ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                        task.status === 'Done' ? 'bg-green-100 text-green-800' :
                        task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.status}
                      </div>
                    </div>
                  </div>
                ))}
                {myTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No tasks assigned yet. Check back later!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
