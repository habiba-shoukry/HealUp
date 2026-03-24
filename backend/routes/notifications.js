const express = require('express');
const Notification = require('../models/Notification');
const createNotification = require('../utils/createNotification');

const router = express.Router();


// GET ALL NOTIFICATIONS
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    const formatted = notifications.map(n => ({
      _id: n._id.toString(),
      type: n.type,
      icon: n.icon,
      title: n.title,
      desc: n.desc,
      time: new Date(n.createdAt).toLocaleString(),
      tag: n.tag,
      isRead: n.isRead
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// MARK AS READ
router.patch('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true
    });

    res.json({ message: "Marked as read" });

  } catch (err) {
    res.status(500).json({ error: "Failed to update" });
  }
});


// DELETE NOTIFICATION
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});


// TEST ROUTES FOR EACH TYPE

// MISSED GOAL
router.post('/test/missed-goal', async (req, res) => {
  const { userId } = req.body;

  await createNotification({
    userId,
    type: "missed_goal",
    title: "Goal Missed",
    desc: "You did not reach your step goal today",
    icon: "target",
    tag: "Goals"
  });

  res.json({ message: "Missed goal notification created" });
});


// HEALTH EVENT
router.post('/test/health-event', async (req, res) => {
  const { userId } = req.body;

  await createNotification({
    userId,
    type: "health_event",
    title: "Heart Rate Alert",
    desc: "Your heart rate was unusually high today",
    icon: "heart",
    tag: "Health"
  });

  res.json({ message: "Health event notification created" });
});


// CHALLENGE COMPLETE
router.post('/test/challenge', async (req, res) => {
  const { userId } = req.body;

  await createNotification({
    userId,
    type: "challenge_complete",
    title: "Challenge Completed",
    desc: "You completed your weekly challenge",
    icon: "trophy",
    tag: "Achievement"
  });

  res.json({ message: "Challenge notification created" });
});


// SUGGESTION
router.post('/test/suggestion', async (req, res) => {
  const { userId } = req.body;

  await createNotification({
    userId,
    type: "suggestion",
    title: "Take a Break",
    desc: "You have been inactive for a while",
    icon: "step",
    tag: "Activity"
  });

  res.json({ message: "Suggestion notification created" });
});


// RECOMMENDATIONS,TODO (optional)
router.post('/test/ai', async (req, res) => {
  const { userId } = req.body;

  await createNotification({
    userId,
    type: "ai_recommendation",
    title: "AI Insight",
    desc: "Try sleeping 30 minutes earlier for better recovery",
    icon: "brain",
    tag: "AI"
  });

  res.json({ message: "AI notification created" });
});


// MOTIVATIONAL MESSAGE FROM DOC 
router.post('/test/motivation', async (req, res) => {
  const { userId } = req.body;

  // TODO
  await createNotification({
    userId,
    type: "motivation",
    title: "",
    desc: "",
    icon: "spark",
    tag: "Motivation"
  });

  res.json({ message: "Motivation notification created" });
});


module.exports = router;


