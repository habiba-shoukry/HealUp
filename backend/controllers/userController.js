const User = require('../models/User');
const mongoose = require('mongoose');

// Create user
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ fullName, username, email, password, role });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// List users
exports.listUsers = async (req, res, next) => {
  try {
    const { skip = 0, limit = 10 } = req.query;
    const users = await User.find()
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    // const user = await User.findOneAndUpdate(
    //   { id: req.params.userId },
    //   req.body,
    //   { new: true, runValidators: true }
    // );
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete( req.params.userId );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorPatients = async (req, res) => {
 try {
   const { doctorId } = req.query;
   
   if (!doctorId) {
    return res.json([]);
   }

   const patients = await User.find({
     role: 'patient',
      doctorId: new mongoose.Types.ObjectId(doctorId)
   }).select('-password');

   res.json(patients);

 } catch (err) {
   console.error("🔥 GET DOCTOR PATIENTS CRASHED:", err);
   res.status(500).json({ error: 'Server error' });
 }
};


// links docs and patients
exports.linkDoctor = async (req, res) => {
    try {
        // 1. gets the IDs sent from the frontend
        const { patientId, doctorId } = req.body;

        if (!patientId || !doctorId) {
            return res.status(400).json({ error: 'Both patient ID and doctor ID are required.' });
        }

        // 2. checks the doctor actually exists in the database and has the 'doctor' role
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found or invalid user role.' });
        }

        // 3. finds the patient and update their profile with the doctor's ID
        const patient = await User.findByIdAndUpdate(
            patientId,
            { 
                doctorId: doctor._id.toString(),
                hasDoctor: true 
            },
            { new: true } 
        );

        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ error: 'Patient not found or invalid user role.' });
        }

        // 4. sends a success response to frontend
        res.status(200).json({
            success: true,
            message: `Successfully linked to Dr. ${doctor.fullName}`,
            user: {
                id: patient._id,
                role: patient.role,
                hasDoctor: patient.hasDoctor,
                doctorId: patient.doctorId
            }
        });

    } catch (error) {
        console.error("🔥 LINK DOCTOR CRASHED:", error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

exports.updateSharedBiomarkers = async (req, res, next) => {
  try {
    console.log("🔥 Biomarker update hit:", req.params.userId, req.body);
    const userId = req.params.userId;
    const { biomarkers } = req.body;

    if (!userId || !Array.isArray(biomarkers)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { sharedBiomarkers: biomarkers },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      sharedBiomarkers: user.sharedBiomarkers
    });

  } catch (error) {
    next(error);
  }
};