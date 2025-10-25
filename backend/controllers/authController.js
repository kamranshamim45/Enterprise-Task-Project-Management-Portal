import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });


export const register = async (req, res) => {
const { name, email, password, role } = req.body;
try {
const existing = await User.findOne({ email });
if (existing) return res.status(400).json({ message: 'User exists' });
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
const user = await User.create({ name, email, password: hash, role });
res.status(201).json({ token: genToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
} catch (err) {
res.status(500).json({ message: err.message });
}
};


export const getAllUsers = async (req, res) => {
try {
const users = await User.find({}, '-password'); // Exclude password field
res.json(users);
} catch (err) {
res.status(500).json({ message: err.message });
}
};


export const login = async (req, res) => {
const { email, password } = req.body;
try {
const user = await User.findOne({ email });
if (!user) return res.status(400).json({ message: 'Invalid credentials' });
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
res.json({ token: genToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
} catch (err) {
res.status(500).json({ message: err.message });
}
};

export const getMe = async (req, res) => {
try {
const user = await User.findById(req.user._id).select('-password');
res.json(user);
} catch (err) {
res.status(500).json({ message: err.message });
}
};

export const uploadProfilePicture = async (req, res) => {
try {
if (!req.file) {
return res.status(400).json({ message: 'No file uploaded' });
}

const avatarUrl = `/uploads/${req.file.filename}`;
const user = await User.findByIdAndUpdate(
req.user._id,
{ avatarUrl },
{ new: true }
).select('-password');

res.json({
message: 'Profile picture uploaded successfully',
user: user,
avatarUrl: avatarUrl
});
} catch (err) {
res.status(500).json({ message: err.message });
}
};
