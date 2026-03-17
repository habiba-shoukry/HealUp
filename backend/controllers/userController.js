const User = require('../models/User');

// Create user
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ username, email, password });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }N
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.params.userId });
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
    const user = await User.findOneAndUpdate(
      { id: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
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
    const user = await User.findOneAndDelete({ id: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
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
                doctorId: doctor._id,
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
                id: patient.id,
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