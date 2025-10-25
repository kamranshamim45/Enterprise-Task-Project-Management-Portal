import mongoose from 'mongoose';


const ProjectSchema = new mongoose.Schema({
name: { type: String, required: true },
description: { type: String },
deadline: { type: Date },
members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Project', ProjectSchema);