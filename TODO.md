# Deployment Setup for Backend on Render and Frontend Integration

## Frontend Changes
- [x] Update `frontend/src/context/AuthContext.jsx` to use Render URL
- [x] Update `frontend/src/sockets/socket.js` to use Render URL
- [x] Update `frontend/src/pages/Projects.jsx` to use Render URL
- [x] Update `frontend/src/pages/Tasks.jsx` to use Render URL
- [x] Update `frontend/src/pages/AdminDashboard.jsx` to use Render URL
- [x] Update `frontend/src/pages/UserDashboard.jsx` to use Render URL
- [x] Update `frontend/src/pages/Chat.jsx` to use Render URL
- [x] Update `frontend/src/components/TaskFileUpload.jsx` to use Render URL

## Backend Changes
- [x] Update `backend/index.js` CORS to include Vercel URL: https://enterprise-task-project-management.vercel.app

## Deployment Steps
- [ ] Commit and push changes to GitHub
- [ ] Deploy backend to Render
- [ ] Set environment variables on Render (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Test frontend with Render backend
