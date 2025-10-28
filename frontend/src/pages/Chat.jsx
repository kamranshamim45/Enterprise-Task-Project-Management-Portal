import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('https://enterprise-task-project-management-portal-2329.onrender.com', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('userJoined', (userData) => {
      setOnlineUsers(prev => [...prev, userData]);
    });

    newSocket.on('userLeft', (userId) => {
      setOnlineUsers(prev => prev.filter(user => user.id !== userId));
    });

    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    // Fetch projects
    fetchProjects();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedProject && socket) {
      // Join project room
      socket.emit('joinProject', selectedProject);

      // Fetch message history
      fetchMessages(selectedProject);
    }
  }, [selectedProject, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('https://enterprise-task-project-management-portal-2329.onrender.com/api/projects');
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProject(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (projectId) => {
    try {
      const res = await axios.get(`https://enterprise-task-project-management-portal-2329.onrender.com/api/messages/${projectId}`);
      const formattedMessages = res.data.map(msg => ({
        _id: msg._id,
        content: msg.text,
        sender: msg.sender._id,
        senderName: msg.sender.name,
        senderAvatar: msg.sender.avatarUrl,
        projectId: msg.project,
        timestamp: msg.createdAt
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProject || !socket) return;

    const messageData = {
      content: newMessage.trim(),
      projectId: selectedProject,
      sender: user._id,
      senderName: user.name
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Projects Sidebar - WhatsApp Style */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chats</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">{onlineUsers.length} online</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => setSelectedProject(project._id)}
              className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                selectedProject === project._id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  selectedProject === project._id ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{project.description}</p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      project.status === 'active' ? 'bg-green-400' :
                      project.status === 'completed' ? 'bg-blue-400' : 'bg-yellow-400'
                    }`}></span>
                    <span className="text-xs text-gray-400 capitalize">{project.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Online Users Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Online Users ({onlineUsers.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {onlineUsers.slice(0, 8).map((onlineUser) => (
              <div key={onlineUser.id} className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">
                    {onlineUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 truncate">{onlineUser.name}</span>
              </div>
            ))}
            {onlineUsers.length > 8 && (
              <div className="text-xs text-gray-500 text-center">+{onlineUsers.length - 8} more</div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area - WhatsApp Style */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {projects.find(p => p._id === selectedProject)?.name.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {projects.find(p => p._id === selectedProject)?.name || 'Select a Project'}
                </h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {onlineUsers.length} member{onlineUsers.length !== 1 ? 's' : ''} online
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 bg-opacity-50">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => {
                  const isOwnMessage = message.sender === user._id;
                  const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;
                  const showTimestamp = index === messages.length - 1 ||
                    new Date(messages[index + 1].timestamp).getTime() - new Date(message.timestamp).getTime() > 300000; // 5 minutes

                  return (
                    <div key={message._id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
                      {!isOwnMessage && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0 overflow-hidden bg-gray-200">
                          {message.senderAvatar ? (
                            <img
                              src={`https://enterprise-task-project-management-portal-2329.onrender.com${message.senderAvatar}`}
                              alt={message.senderName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-white font-semibold bg-gray-400 w-full h-full flex items-center justify-center">
                              {message.senderName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      {isOwnMessage && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center ml-2 mt-1 flex-shrink-0 overflow-hidden bg-gray-200 order-2">
                          {user.avatarUrl ? (
                            <img
                              src={`https://enterprise-task-project-management-portal-2329.onrender.com${user.avatarUrl}`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-white font-semibold bg-green-500 w-full h-full flex items-center justify-center">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}

                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                        {!isOwnMessage && showAvatar && (
                          <div className="text-xs text-gray-500 mb-1 px-1">{message.senderName}</div>
                        )}

                        <div
                          className={`px-4 py-2 rounded-2xl shadow-sm ${
                            isOwnMessage
                              ? 'bg-green-500 text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                          }`}
                        >
                          <div className="text-sm leading-relaxed">{message.content}</div>
                        </div>

                        {showTimestamp && (
                          <div className={`text-xs text-gray-400 mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mr-2 mt-1">
                      <span className="text-xs text-white font-semibold">?</span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input - WhatsApp Style */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={sendMessage} className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 pr-12 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  disabled={!selectedProject}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || !selectedProject}
                className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
