const express = require('express');
const router = express.Router();
const { linkDoctor, getDoctorPatients } = require('../controllers/userController');

// PUT /api/users/link-doctor
router.put('/link-doctor', linkDoctor);
router.get('/doctor/patients', getDoctorPatients);

module.exports = router;