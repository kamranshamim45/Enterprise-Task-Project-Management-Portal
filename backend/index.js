import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/task.js';
import messageRoutes from './routes/messages.js';
import { initSockets } from './utils/socket.js';

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000", "https://enterprise-task-project-management.vercel.app"],
    methods: ["GET", "POST"]
  }
});
initSockets(io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/uploads/tasks', express.static('uploads/tasks'));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

io.on('connection', (socket) => {
console.log('socket connected', socket.id);
socket.on('joinProject', (projectId) => {
socket.join(projectId);
});
socket.on('leaveProject', (projectId) => socket.leave(projectId));
socket.on('sendMessage', async (data) => {
try {
  // Save message to database
  const Message = (await import('./models/Message.js')).default;
  const message = new Message({
    text: data.content,
    sender: data.sender,
    project: data.projectId,
  });
  await message.save();
  await message.populate('sender', 'name email avatarUrl');

  // Prepare message data for frontend
  const messageData = {
    _id: message._id,
    content: message.text,
    sender: message.sender._id,
    senderName: message.sender.name,
    senderAvatar: message.sender.avatarUrl,
    projectId: message.project,
    timestamp: message.createdAt
  };

  // broadcast message to room
  io.to(data.projectId).emit('message', messageData);
} catch (error) {
  console.error('Error saving message:', error);
}
});
socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
