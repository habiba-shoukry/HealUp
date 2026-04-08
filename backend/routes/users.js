const express = require('express');
const router = express.Router();
const { linkDoctor, getDoctorPatients } = require('../controllers/userController');
const userController = require('../controllers/userController');

// PUT /api/users/link-doctor
router.put('/link-doctor', linkDoctor);
router.get('/doctor/patients', getDoctorPatients);
router.put('/:userId/biomarkers', userController.updateSharedBiomarkers);

module.exports = router;