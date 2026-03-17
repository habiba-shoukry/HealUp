const express = require('express');
const router = express.Router();
const { getStats, updateStats, updateRewards } = require('../controllers/statsController');

router.get('/:userId', getStats);
router.patch('/:userId', updateStats);
router.post('/rewards', updateRewards);

module.exports = router;
