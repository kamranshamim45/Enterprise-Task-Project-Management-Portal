import mongoose from 'mongoose';


const MessageSchema = new mongoose.Schema({
project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
text: { type: String, required: true },
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Message', MessageSchema);