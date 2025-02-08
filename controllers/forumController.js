const Forum = require('../models/Forum');

exports.createForum = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const newForum = new Forum({
      title,
      description,
      category,
      creator: req.user
    });

    const forum = await newForum.save();

    res.status(201).json(forum);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating forum', 
      error: error.message 
    });
  }
};

exports.getAllForums = async (req, res) => {
  try {
    const forums = await Forum.find()
      .populate('creator', 'name')
      .select('-messages')
      .sort({ createdAt: -1 });

    res.json(forums);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching forums', 
      error: error.message 
    });
  }
};

exports.sendForumMessage = async (req, res) => {
  try {
    const { forumId } = req.params;
    const { content } = req.body;

    console.log('Received forumId:', forumId);
    console.log('Received content:', content);
    console.log('User from middleware:', req.user);

    const forum = await Forum.findById(forumId);

    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    const newMessage = {
      user: req.user, // Make sure this is the correct user ID
      content,
      createdAt: new Date()
    };

    forum.messages.push(newMessage);
    await forum.save();

    // Fetch the updated forum to get the most recent message
    const updatedForum = await Forum.findById(forumId)
      .populate({
        path: 'messages.user',
        select: 'name _id'
      });

    // Get the last added message
    const lastMessage = updatedForum.messages[updatedForum.messages.length - 1];

    res.status(201).json({
      id: lastMessage._id,
      content: lastMessage.content,
      createdAt: lastMessage.createdAt,
      author: {
        id: lastMessage.user._id,
        name: lastMessage.user.name
      }
    });
  } catch (error) {
    console.error('Full error in sendForumMessage:', error);
    res.status(500).json({ 
      message: 'Error sending message', 
      error: error.message 
    });
  }
};

exports.getForumMessages = async (req, res) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findById(forumId)
      .populate({
        path: 'messages.user',
        select: 'name _id'
      });

    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    // Transform messages to match frontend expectations
    const transformedMessages = forum.messages.map(message => ({
      id: message._id,
      content: message.content,
      createdAt: message.createdAt,
      author: {
        id: message.user._id,
        name: message.user.name
      }
    }));

    res.json(transformedMessages);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching messages', 
      error: error.message 
    });
  }
};