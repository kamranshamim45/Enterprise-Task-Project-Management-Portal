import mongoose from 'mongoose';


const CommentSchema = new mongoose.Schema({
author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
text: String,
createdAt: { type: Date, default: Date.now }
});


const TaskSchema = new mongoose.Schema({
title: { type: String, required: true },
description: { type: String },
project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
priority: { type: String, enum: ['Low','Medium','High','Critical'], default: 'Medium' },
status: { type: String, enum: ['To-Do','In Progress','Done'], default: 'To-Do' },
startDate: { type: Date },
deadline: { type: Date },
progress: { type: Number, min: 0, max: 100, default: 0 },
comments: [CommentSchema],
attachments: [{ type: String }], // Array of file paths for uploaded documents
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Task', TaskSchema);