const Notification = require('../models/Notification');

const createNotification = async ({
  userId,
  type,
  title,
  desc,
  icon,
  tag
}) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      desc,
      icon,
      tag,
      isRead: false,
      createdAt: new Date()
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
};

module.exports = createNotification;