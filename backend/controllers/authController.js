const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserStats = require('../models/UserStats');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Derive a unique username from the email prefix
const deriveUsername = async (email) => {
    const base = email.split('@')[0].replace(/[^A-Za-z0-9_]/g, '_').slice(0, 28);
    let candidate = base;
    let counter = 1;
    while (await User.findOne({ username: candidate })) {
        candidate = `${base}_${counter}`;
        counter++;
    }
    return candidate;
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }

        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const username = await deriveUsername(email);

        const user = await User.create({ fullName, username, email, password });

        // Create initial UserStats document for the new user
        const stats = await UserStats.create({ userId: user.id });

        const token = generateToken(user.id);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                email: user.email
            },
            stats: {
                level: stats.level,
                totalXp: stats.totalXp,
                hp: stats.hp,
                totalEnergy: stats.totalEnergy,
                totalDiscipline: stats.totalDiscipline,
                totalActivitiesLogged: stats.totalActivitiesLogged,
                totalCaloriesBurned: stats.totalCaloriesBurned,
                totalDistance: stats.totalDistance
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ error: messages[0] });
        }
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Username/email and password are required.' });
        }

        // Allow login with either email or username
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = generateToken(user.id);

        // Fetch stats to include in login response
        const stats = await UserStats.findOne({ userId: user.id });

        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                email: user.email
            },
            stats: stats ? {
                level: stats.level,
                totalXp: stats.totalXp,
                hp: stats.hp,
                totalEnergy: stats.totalEnergy,
                totalDiscipline: stats.totalDiscipline,
                totalActivitiesLogged: stats.totalActivitiesLogged,
                totalCaloriesBurned: stats.totalCaloriesBurned,
                totalDistance: stats.totalDistance
            } : null
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};
