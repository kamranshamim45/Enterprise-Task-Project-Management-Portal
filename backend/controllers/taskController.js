import Task from '../models/Task.js';
import { emitToProject } from '../utils/socket.js';

export const createTask = async (req, res) => {
try {
const { title, description, assignees, priority, status, deadline, project } = req.body;
const task = await Task.create({ title, description, project, assignees, priority, status, deadline, createdBy: req.user._id });

// Add assignees to project members if not already present
const Project = (await import('../models/project.js')).default;
await Project.findByIdAndUpdate(project, {
  $addToSet: { members: { $each: assignees } }
});

// emit socket event
const populatedTask = await Task.findById(task._id).populate('assignees', 'name email avatarUrl').populate('project', 'name');
emitToProject(project, 'taskCreated', populatedTask);

res.status(201).json(task);
} catch (err) { res.status(500).json({ message: err.message }); }
};


export const getTasks = async (req, res) => {
try {
const projectId = req.params.projectId;
const filters = {};
if (req.query.status) filters.status = req.query.status;
if (req.query.assignee) filters.assignees = req.query.assignee;
filters.project = projectId;
const tasks = await Task.find(filters).populate('assignees', 'name email');
res.json(tasks);
} catch (err) { res.status(500).json({ message: err.message }); }
};


export const getTask = async (req, res) => {
try {
const task = await Task.findById(req.params.id).populate('assignees', 'name email');
if (!task) return res.status(404).json({ message: 'Not found' });
res.json(task);
} catch (err) { res.status(500).json({ message: err.message }); }
};


export const updateTask = async (req, res) => {
try {
const updates = req.body;
const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('assignees', 'name email');
if (!task) return res.status(404).json({ message: 'Not found' });


// If status/progress changed, notify
const populatedUpdatedTask = await Task.findById(task._id).populate('assignees', 'name email avatarUrl').populate('project', 'name');
emitToProject(task.project.toString(), 'taskUpdated', populatedUpdatedTask);


res.json(task);
} catch (err) { res.status(500).json({ message: err.message }); }
};


export const deleteTask = async (req, res) => {
try {
const task = await Task.findById(req.params.id);
if (!task) return res.status(404).json({ message: 'Not found' });
await Task.findByIdAndDelete(req.params.id);
emitToProject(task.project.toString(), 'taskDeleted', { id: req.params.id });
res.json({ message: 'Deleted' });
} catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllTasks = async (req, res) => {
try {
const filters = {};
if (req.query.status) filters.status = req.query.status;
if (req.query.assignee) filters.assignees = req.query.assignee;
if (req.query.project) filters.project = req.query.project;

// For non-admin users, only show tasks assigned to them
if (req.user.role !== 'admin') {
  filters.assignees = { $in: [req.user._id] };
}

const tasks = await Task.find(filters).populate('assignees', 'name email avatarUrl').populate('project', 'name');
res.json(tasks);
} catch (err) { res.status(500).json({ message: err.message }); }
};

export const uploadTaskFiles = async (req, res) => {
try {
const taskId = req.params.id;
const task = await Task.findById(taskId);

if (!task) {
  return res.status(404).json({ message: 'Task not found' });
}

// Check if user is assigned to the task or is admin
if (req.user.role !== 'admin' && !task.assignees.includes(req.user._id)) {
  return res.status(403).json({ message: 'Not authorized to upload files to this task' });
}

if (!req.files || req.files.length === 0) {
  return res.status(400).json({ message: 'No files uploaded' });
}

const filePaths = req.files.map(file => `/uploads/tasks/${file.filename}`);
task.attachments = task.attachments ? [...task.attachments, ...filePaths] : filePaths;
await task.save();

const populatedTask = await Task.findById(taskId).populate('assignees', 'name email avatarUrl').populate('project', 'name');
emitToProject(task.project.toString(), 'taskUpdated', populatedTask);

res.json({
  message: 'Files uploaded successfully',
  task: populatedTask,
  uploadedFiles: filePaths
});
} catch (err) {
res.status(500).json({ message: err.message });
}
};
