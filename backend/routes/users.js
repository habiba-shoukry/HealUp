const express = require('express');
const router = express.Router();
const { linkDoctor } = require('../controllers/userController');

// PUT /api/users/link-doctor
router.put('/link-doctor', linkDoctor);

module.exports = router;