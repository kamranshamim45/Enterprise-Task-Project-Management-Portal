import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();


export const protect = async (req, res, next) => {
let token = null;
if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
token = req.headers.authorization.split(' ')[1];
}
if (!token) return res.status(401).json({ message: 'Not authorized, no token' });


try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = await User.findById(decoded.id).select('-password');
next();
} catch (err) {
res.status(401).json({ message: 'Token invalid' });
}
};


export const isAdmin = (req, res, next) => {
if (req.user && req.user.role === 'admin') return next();
return res.status(403).json({ message: 'Admin resource. Access denied.' });
};

