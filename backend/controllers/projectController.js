import Project from '../models/project.js';
import User from '../models/User.js';


export const createProject = async (req, res) => {
try {
const { name, description, deadline, members } = req.body;
// Ensure the creator is always a member of the project
const projectMembers = members || [];
if (!projectMembers.includes(req.user._id)) {
  projectMembers.push(req.user._id);
}
const project = await Project.create({ name, description, deadline, members: projectMembers, createdBy: req.user._id });

// Emit socket event to all connected clients for real-time updates
const { io } = await import('../utils/socket.js');
if (io) {
  io.emit('projectCreated', project);
}

res.status(201).json(project);
} catch (err) { res.status(500).json({ message: err.message }); }
};


export const getProjects = async (req, res) => {
try {
if (req.user.role === 'admin') {
const projects = await Project.find().populate('members', 'name email');
return res.json(projects);
}
const projects = await Project.find({ members: req.user._id }).populate('members', 'name email');
res.json(projects);
} catch (err) { res.status(500).json({ message: err.message }); }
};


export const getProject = async (req, res) => {
try {
const project = await Project.findById(req.params.id).populate('members', 'name email');
if (!project) return res.status(404).json({ message: 'Not found' });
res.json(project);
} catch (err) { res.status(500).json({ message: err.message }); }
};


export const updateProject = async (req, res) => {
try {
const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('members', 'name email');
res.json(project);
} catch (err) { res.status(500).json({ message: err.message }); }
};


export const deleteProject = async (req, res) => {
try {
await Project.findByIdAndDelete(req.params.id);
res.json({ message: 'Deleted' });
} catch (err) { res.status(500).json({ message: err.message }); }
};
