const express = require('express');
const router = express.Router();
const { getStats, updateStats } = require('../controllers/statsController');

router.get('/:userId', getStats);
router.patch('/:userId', updateStats);

module.exports = router;
