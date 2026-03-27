const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);

router.post('/register', async (req, res) => {
    try {
        // 1. Create the user in userDB
        const newUser = await User.create(req.body);

        // 2. AUTOMATICALLY assign the challenges
        // Pass the new user's ID and their chosen health program
        await assignStarterChallenges(newUser.id, newUser.healthProgram);

        res.status(201).json({ message: "User created and challenges assigned!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
