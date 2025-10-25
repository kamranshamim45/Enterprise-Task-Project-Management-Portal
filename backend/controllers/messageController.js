import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { content, project } = req.body;
    const message = new Message({
      text: content,
      sender: req.user._id,
      project,
    });
    await message.save();
    await message.populate('sender', 'name email avatarUrl');
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ project: projectId }).populate('sender', 'name email avatarUrl').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
