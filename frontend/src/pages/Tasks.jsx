import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskFileUpload from '../components/TaskFileUpload';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [error, setError] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To-Do',
    priority: 'Medium',
    projectId: '',
    assignedTo: [], // Array for multiple assignees
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        project: formData.projectId, // Change to 'project'
        assignees: formData.assignedTo, // Change to 'assignees'
        deadline: formData.dueDate // Change to 'deadline'
      };

      if (editingTask) {
        await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/tasks', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      resetForm();
      fetchData();
      setShowCreateForm(false); // Close the form after successful creation
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.project._id || task.project, // Handle populated project
      assignedTo: task.assignees ? task.assignees.map(a => a._id || a) : [], // Handle populated assignees
      dueDate: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If marking as Done, show file upload option
      if (newStatus === 'Done') {
        setUploadingTaskId(taskId);
        setShowFileUpload(true);
      } else {
        fetchData();
      }
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const handleFileUploadComplete = (updatedTask) => {
    setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
    setShowFileUpload(false);
    setUploadingTaskId(null);
  };

  const handleFileUploadCancel = () => {
    setShowFileUpload(false);
    setUploadingTaskId(null);
    fetchData(); // Refresh to revert status if needed
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'To-Do',
      priority: 'Medium',
      projectId: '',
      assignedTo: [], // Array for multiple assignees
      dueDate: ''
    });
    setShowCreateForm(false);
    setEditingTask(null);
    setError('');
  };

  const filteredTasks = selectedProject
    ? tasks.filter(task => task.projectId === selectedProject)
    : tasks;

  const getStatusColor = (status) => {
    switch (status) {
      case 'To-Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      case 'Critical': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Task
        </button>
      </div>

      <div className="flex space-x-4">
        <select
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <select
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned To</label>
              <select
                multiple
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.assignedTo}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({ ...formData, assignedTo: selectedOptions });
                }}
              >
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name} {u._id === user?._id ? '(You)' : ''} - {u.email}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="To-Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingTask ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority} priority
                  </span>
                  {task.assignees && task.assignees.length > 0 && (
                    <span className="text-sm text-gray-500">
                      Assigned to: {task.assignees.map(a => typeof a === 'object' ? a.name : users.find(u => u._id === a)?.name || 'Unknown').join(', ')}
                    </span>
                  )}
                  {task.deadline && (
                    <span className="text-sm text-gray-500">
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  <option value="To-Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {selectedProject ? 'No tasks found for this project.' : 'No tasks found. Create your first task!'}
          </p>
        </div>
      )}

      {showFileUpload && (
        <TaskFileUpload
          taskId={uploadingTaskId}
          onUploadComplete={handleFileUploadComplete}
          onClose={handleFileUploadCancel}
        />
      )}
    </div>
  );
};

export default Tasks;
