import React, { useState, useRef } from 'react';
import axios from 'axios';

const ProfilePictureUpload = ({ currentAvatar, onAvatarUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('https://enterprise-task-project-management-portal-2329.onrender.com/api/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (onAvatarUpdate) {
        onAvatarUpdate(response.data.avatarUrl);
      }

      alert('Profile picture uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full border-4 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
          onClick={triggerFileInput}
        >
          {currentAvatar ? (
            <img
              src={`https://enterprise-task-project-management-portal-2329.onrender.com${currentAvatar}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={triggerFileInput}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16l4-4m0 0l4 4m-4-4v12m0-12l4-4m-4 4H3m11 4v12m0-12l4-4m-4 4h4m-4 4l4 4" />
          </svg>
        </div>

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={triggerFileInput}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {uploading ? 'Uploading...' : 'Change Picture'}
      </button>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
