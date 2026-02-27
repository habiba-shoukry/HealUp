const UserStats = require('../models/UserStats');

// GET /api/stats/:userId
exports.getStats = async (req, res) => {
    try {
        const stats = await UserStats.findOne({ userId: req.params.userId });
        if (!stats) {
            return res.status(404).json({ error: 'Stats not found.' });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};
