// const WeeklyHealthMetrics = require('../models/WeeklyHealthMetrics'); // Import your table
// const createNotification = require('../utils/createNotification');

// exports.updateChallengeProgress = async (req, res) => {
//     try {
//         console.log("Calling createNotification");
//         const { id } = req.params;
//         const { progress } = req.body;

//         const challenge = await Challenge.findById(id);

//         if (!challenge) {
//             return res.status(404).json({ error: "Challenge not found" });
//         }

//         // Update progress
//         challenge.progress = progress;

//         // Check completion
//         if (progress >= 100 && !challenge.isCompleted) {
//             challenge.isCompleted = true;

//             await createNotification({
//                 userId: challenge.userId,
//                 type: "challenge_complete",
//                 title: "Challenge Completed!",
//                 desc: `You completed: ${challenge.title}`,
//                 icon: "burn",
//                 tag: "Achievement"
//             });
//         }

//         await challenge.save();

//         res.json(challenge);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Server error" });
//     }
// };