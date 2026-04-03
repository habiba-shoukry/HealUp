const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); 

module.exports = function(io) {
  router.post('/send', async (req, res) => {
    try {
      
      const { doctorId, patientId, message } = req.body;

      // 1. save to mongoDb
      const newMessage = new Message({
        senderId: doctorId,    
        receiverId: patientId, 
        content: message       
      });
      await newMessage.save();

      // 2. triggers the real-time pop-up
      io.to(patientId).emit('receive_notification', {
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