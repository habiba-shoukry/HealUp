const mongoose = require('mongoose');
const { userDB } = require('../config/database');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); // Automatically adds 'createdAt' to show when the message was sent

// module.exports = mongoose.model('Message', messageSchema);
module.exports = userDB.model('Message', messageSchema);