const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); 
const createNotification = require('../utils/createNotification');

module.exports = function(io) {
  router.post('/send', async (req, res) => {
    try {
      const { senderId, receiverId, content } = req.body;

      const newMessage = new Message({
        senderId,
        receiverId,
        content
      });
      await newMessage.save();

      await createNotification({
        userId: receiverId,
        type: "motivation",
        title: "New message from your doctor",
        desc: content,
        icon: "chat",
        tag: "Motivation"
      });
      
      // 2. triggers the real-time pop-up
      io.to(receiverId).emit('receive_notification', {
        id: newMessage._id,
        message: newMessage.content,
        senderId: newMessage.senderId,
        createdAt: newMessage.createdAt
      });

      res.status(200).json({ success: true, data: newMessage });
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(500).json({ error: 'Database or Socket error' });
    }
  });

  return router;
};