const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserStats = require('../models/UserStats');
const Goal = require('../models/Goals');
const Challenge = require('../models/Challenges');
const ActivityLog = require('../models/HealthLog');
const FoodIntake = require('../models/FoodIntake');
const WeeklyHealthMetrics = require('../models/WeeklyHealthMetrics');
const { initializeUserAvatar } = require('../utils/avatarUtils');

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

const startOfTodayIso = () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d.toISOString();
};

const toDateKey = (value) => {
    const d = new Date(value);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const atStartOfDay = (value) => {
    const d = new Date(value);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
const WEEK_DAYS = 7;

const buildWeeklyMetric = (dateValue, dayOffset) => {
    const date = atStartOfDay(dateValue);
    const steps = Math.max(3500, 7600 + dayOffset * 260 + Math.round(Math.random() * 1200));
    const sleepHours = Number((6.2 + Math.random() * 2.0).toFixed(1));
    const sleepDeepHours = Number((sleepHours * 0.22).toFixed(1));
    const sleepRemHours = Number((sleepHours * 0.27).toFixed(1));
    const sleepLightHours = Number(Math.max(0, sleepHours - sleepDeepHours - sleepRemHours).toFixed(1));
    const stressLevel = Math.min(85, Math.max(22, Math.round(42 + (Math.random() * 28 - 14))));
    const restingHeartRate = Math.min(88, Math.max(56, Math.round(66 + (sleepHours < 7 ? 4 : 0) + Math.random() * 6)));
    const heartRateMin = Math.max(48, restingHeartRate - (8 + Math.round(Math.random() * 4)));
    const heartRateMax = restingHeartRate + 16 + Math.round(Math.random() * 14);
    const stressPeak = Math.min(95, Math.max(stressLevel + 8, stressLevel + Math.round(Math.random() * 18)));
    const stressRecovery = Math.min(96, Math.max(42, Math.round(95 - stressLevel + Math.random() * 10)));

    return {
        date: toDateKey(date),
        steps,
        distanceKm: Number((steps * 0.00075).toFixed(1)),
        caloriesBurned: Math.max(200, Math.round(steps * 0.045)),
        calorieIntake: 1850 + Math.round(Math.random() * 600),
        sleepHours,
        sleepScore: Math.min(98, Math.max(58, Math.round(60 + sleepHours * 4 + Math.random() * 10))),
        sleepDeepHours,
        sleepRemHours,
        sleepLightHours,
        stressLevel,
        stressHrv: Math.min(90, Math.max(36, Math.round(68 - stressLevel * 0.28 + Math.random() * 8))),
        stressPeak,
        stressPeakTime: ['10am', '12pm', '2pm', '4pm'][Math.floor(Math.random() * 4)],
        stressRecovery,
        stressSeries: Array.from({ length: 12 }, (_, i) => {
            const wave = Math.sin((i / 12) * Math.PI * 2) * 10;
            return Math.round(Math.min(95, Math.max(10, stressLevel + wave + (Math.random() * 8 - 4))));
        }),
        restingHeartRate,
        heartRateMin,
        heartRateMax,
        heartRateSeries: Array.from({ length: 12 }, (_, i) => {
            const wave = Math.sin((i / 12) * Math.PI * 2) * 6;
            return Math.round(Math.min(heartRateMax, Math.max(heartRateMin, restingHeartRate + wave + (Math.random() * 6 - 3))));
        })
    };
};

const seedInitialHealthData = async (userId) => {
    const todayIso = startOfTodayIso();

    const goals = [
        {
            userId,
            title: 'Walk 70,000 steps this month',
            description: 'Build a consistent movement habit',
            goalType: 'fitness',
            programType: 'general',
            targetValue: 70000,
            currentValue: 9000,
            unit: 'steps'
        },
        {
            userId,
            title: 'Drink water daily',
            description: 'Stay hydrated 30 days this month',
            goalType: 'hydration',
            programType: 'general',
            targetValue: 30,
            currentValue: 3,
            unit: 'days'
        },
        {
            userId,
            title: 'Sleep 7+ hours for 20 nights',
            description: 'Improve recovery and focus',
            goalType: 'sleep',
            programType: 'sleep',
            targetValue: 20,
            currentValue: 2,
            unit: 'nights'
        }
    ];

    const challenges = [
        {
            userId,
            title: 'Walk 10,000 steps today',
            description: 'Complete your daily movement target',
            challengeType: 'daily',
            programType: 'endurance',
            rewardXp: 50,
            rewardEnergy: 5,
            rewardDiscipline: 0,
            progress: 0
        },
        {
            userId,
            title: 'No sugary drinks today',
            description: 'Choose water or unsweetened drinks',
            challengeType: 'daily',
            programType: 'weight-loss',
            rewardXp: 30,
            rewardEnergy: 0,
            rewardDiscipline: 3,
            progress: 0
        },
        {
            userId,
            title: 'Morning stretch routine',
            description: 'Do a short mobility or breathing session',
            challengeType: 'daily',
            programType: 'stress',
            rewardXp: 15,
            rewardEnergy: 2,
            rewardDiscipline: 0,
            progress: 0
        },
        {
            userId,
            title: 'Daily workout complete',
            description: 'Finish one structured workout',
            challengeType: 'daily',
            programType: 'muscle-gain',
            rewardXp: 50,
            rewardEnergy: 5,
            rewardDiscipline: 2,
            progress: 0
        },
        {
            userId,
            title: 'Sleep 7+ hours for 5 nights',
            description: 'Weekly sleep consistency challenge',
            challengeType: 'weekly',
            programType: 'sleep',
            rewardXp: 120,
            rewardEnergy: 20,
            rewardDiscipline: 10,
            progress: 20
        },
        {
            userId,
            title: 'Share progress with a friend',
            description: 'Build accountability this week',
            challengeType: 'weekly',
            programType: 'general',
            rewardXp: 60,
            rewardEnergy: 20,
            rewardDiscipline: 0,
            progress: 0
        }
    ];

    const activities = [
        {
            userId,
            activityType: 'walking',
            duration: 30,
            caloriesBurned: 160,
            distance: 2.8,
            notes: 'Evening walk',
            timestamp: todayIso
        }
    ];

    const foods = [
        {
            userId,
            foodName: 'Oatmeal with banana',
            calories: 320,
            protein: 14,
            carbohydrates: 52,
            fat: 7,
            mealType: 'breakfast',
            timestamp: todayIso
        }
    ];

    await Promise.all([
        Goal.insertMany(goals),
        // Challenge.insertMany(challenges),
        ActivityLog.insertMany(activities),
        FoodIntake.insertMany(foods)
    ]);
};

// Build sample data for Apple Watch (standard algorithm)
const buildAppleMetric = (dateValue, dayOffset) => buildWeeklyMetric(dateValue, dayOffset);

// Build sample data for Fitbit Sense 2 (optical HR tends ±2 bpm lower, more REM,
// conservative calorie estimate, EDA-based stress reads slightly different)
const buildFitbitMetric = (dateValue, dayOffset) => {
    const date = atStartOfDay(dateValue);
    // Fitbit step count slightly lower (algorithm differences)
    const steps = Math.max(3200, 7100 + dayOffset * 220 + Math.round(Math.random() * 1100));
    const sleepHours = Number((6.5 + Math.random() * 1.8).toFixed(1));
    // Fitbit emphasises REM detection — higher REM ratio
    const sleepDeepHours  = Number((sleepHours * 0.18).toFixed(1));
    const sleepRemHours   = Number((sleepHours * 0.32).toFixed(1));
    const sleepLightHours = Number(Math.max(0, sleepHours - sleepDeepHours - sleepRemHours).toFixed(1));
    // Fitbit EDA-based stress tends to read slightly lower than Apple's algorithm
    const stressLevel = Math.min(78, Math.max(18, Math.round(36 + (Math.random() * 26 - 13))));
    // Optical HR on Fitbit reads 1–3 bpm lower on average
    const restingHeartRate = Math.min(84, Math.max(52, Math.round(63 + (sleepHours < 7 ? 3 : 0) + Math.random() * 5)));
    const heartRateMin = Math.max(44, restingHeartRate - (9 + Math.round(Math.random() * 5)));
    const heartRateMax = restingHeartRate + 14 + Math.round(Math.random() * 12);
    const stressPeak = Math.min(90, Math.max(stressLevel + 6, stressLevel + Math.round(Math.random() * 16)));
    const stressRecovery = Math.min(98, Math.max(48, Math.round(97 - stressLevel + Math.random() * 10)));
    // Fitbit calorie burn estimate is slightly more conservative
    const caloriesBurned = Math.max(180, Math.round(steps * 0.040));

    return {
        date: toDateKey(date),
        steps,
        distanceKm: Number((steps * 0.00078).toFixed(1)),
        caloriesBurned,
        calorieIntake: 1920 + Math.round(Math.random() * 550),
        sleepHours,
        sleepScore: Math.min(96, Math.max(60, Math.round(62 + sleepHours * 4 + Math.random() * 8))),
        sleepDeepHours,
        sleepRemHours,
        sleepLightHours,
        stressLevel,
        stressHrv: Math.min(95, Math.max(38, Math.round(72 - stressLevel * 0.25 + Math.random() * 9))),
        stressPeak,
        stressPeakTime: ['9am', '11am', '1pm', '3pm'][Math.floor(Math.random() * 4)],
        stressRecovery,
        stressSeries: Array.from({ length: 12 }, (_, i) => {
            const wave = Math.sin((i / 12) * Math.PI * 2) * 9;
            return Math.round(Math.min(90, Math.max(8, stressLevel + wave + (Math.random() * 7 - 3.5))));
        }),
        restingHeartRate,
        heartRateMin,
        heartRateMax,
        heartRateSeries: Array.from({ length: 12 }, (_, i) => {
            const wave = Math.sin((i / 12) * Math.PI * 2) * 5;
            return Math.round(Math.min(heartRateMax, Math.max(heartRateMin, restingHeartRate + wave + (Math.random() * 5 - 2.5))));
        })
    };
};

const buildWeekDoc = (userId, deviceId, dates, sampleFn) => {
    const today = atStartOfDay(new Date());
    const windowStart = new Date(dates[0]);
    const samples = dates.map((date, i) => sampleFn(date, i - 3));
    const get = (field) => samples.map((s) => s[field]);
    return {
        userId,
        deviceId,
        dates,
        steps:            get('steps'),
        distanceKm:       get('distanceKm'),
        caloriesBurned:   get('caloriesBurned'),
        calorieIntake:    get('calorieIntake'),
        sleepHours:       get('sleepHours'),
        sleepScore:       get('sleepScore'),
        sleepDeepHours:   get('sleepDeepHours'),
        sleepRemHours:    get('sleepRemHours'),
        sleepLightHours:  get('sleepLightHours'),
        stressLevel:      get('stressLevel'),
        stressHrv:        get('stressHrv'),
        stressPeak:       get('stressPeak'),
        stressPeakTime:   get('stressPeakTime'),
        stressRecovery:   get('stressRecovery'),
        stressSeries:     get('stressSeries'),
        restingHeartRate: get('restingHeartRate'),
        heartRateMin:     get('heartRateMin'),
        heartRateMax:     get('heartRateMax'),
        heartRateSeries:  get('heartRateSeries'),
        windowStart,
        windowEnd: today,
        expiresAt: addDays(today, Number(process.env.DAILY_METRICS_RETENTION_DAYS || 7)),
    };
};

const seedInitialWeeklyMetrics = async (userId) => {
    const today = atStartOfDay(new Date());
    const windowStart = addDays(today, -(WEEK_DAYS - 1));
    const dates = Array.from({ length: WEEK_DAYS }, (_, i) => toDateKey(addDays(windowStart, i)));

    await Promise.all([
        WeeklyHealthMetrics.create(buildWeekDoc(userId, 'apple',  dates, buildAppleMetric)),
        WeeklyHealthMetrics.create(buildWeekDoc(userId, 'fitbit', dates, buildFitbitMetric)),
    ]);
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
    console.log("🟢 SIGNUP ROUTE TRIGGERED!");
    console.log("📦 Incoming Data:", req.body);
    try {
        const { fullName, email, password, confirmPassword, role, healthProgram } = req.body;
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }
        //vlidates to ensure patients select a health program
        if (role === 'patient' && !healthProgram) {
            return res.status(400).json({ error: 'A health program is required for patients.' });
        }

        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const username = await deriveUsername(email);

        // NEW: Added role and healthProgram to the creation payload
        const user = await User.create({ 
            fullName, 
            username, 
            email, 
            password, 
            role: role || 'patient',  
        });

        // Create initial UserStats document for the new user
        const stats = await UserStats.create({ userId: user.id });
        await Promise.all([
            seedInitialHealthData(user.id),
            seedInitialWeeklyMetrics(user.id),
            initializeUserAvatar(user.id),
            assignStarterChallenges(user.id)
        ]);

        const token = generateToken(user.id);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,            
                healthProgram: user.healthProgram 
            },
            stats: {
                level: stats.level,
                totalXp: stats.totalXp,
                coins: stats.coins ?? 0,
                hp: stats.hp,
                totalEnergy: stats.totalEnergy,
                totalDiscipline: stats.totalDiscipline,
                totalActivitiesLogged: stats.totalActivitiesLogged,
                totalCaloriesBurned: stats.totalCaloriesBurned,
                totalDistance: stats.totalDistance
            }
        });
    } catch (error) {
        console.error("🔥 SIGNUP CRASHED:", error);
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

        // Fetch stats to include in login response; backfill if missing
        let stats = await UserStats.findOne({ userId: user.id });
        if (!stats) {
            stats = await UserStats.create({ userId: user.id });
        }

        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                email: user.email, 
                role: user.role,                
                healthProgram: user.healthProgram 
            },
            stats: stats ? {
                level: stats.level,
                totalXp: stats.totalXp,
                coins: stats.coins ?? 0,
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



const assignStarterChallenges = async (userId) => {
    const challengePool = {
        'endurance': [
            { title: 'Walk 10,000 steps today', rewardXp: 50, rewardEnergy: 5, rewardDiscipline: 0, challengeType: 'daily' },
            { title: 'Run a total distance of 20 km in a week', rewardXp: 150, rewardEnergy: 50, rewardDiscipline: 20, challengeType: 'weekly' }
        ],
        'weight-loss': [
            { title: 'No Sugary snacks', rewardXp: 30, rewardEnergy: 0, rewardDiscipline: 3, challengeType: 'daily' }
        ],
        'general': [
            { title: 'Drink 2L of water', rewardXp: 20, rewardEnergy: 0, rewardDiscipline: 0, rewardHp: 3, challengeType: 'daily' },
            { title: 'Share progress with a friend', rewardXp: 60, rewardEnergy: 20, rewardDiscipline: 0, challengeType: 'weekly' },
            { title: 'Drink 14L water total this week', rewardXp: 100, rewardEnergy: 30, rewardDiscipline: 0, challengeType: 'weekly' }
        ],
        'stress': [
            { title: 'Morning Stretch', rewardXp: 15, rewardEnergy: 2, rewardDiscipline: 0, challengeType: 'daily' }
        ],
        'muscle-gain': [
            { title: 'Daily Workout Complete', rewardXp: 50, rewardEnergy: 5, rewardDiscipline: 2, challengeType: 'daily' }
        ],
        'sleep': [
            { title: 'Sleep 7-8 hours per night for 5 nights', rewardXp: 120, rewardEnergy: 40, rewardDiscipline: 0, challengeType: 'weekly' }
        ]
    };

    // Flatten the entire pool so the user owns ALL challenges from the start
    const allChallenges = Object.entries(challengePool).flatMap(([program, challenges]) => 
        challenges.map(ch => ({
            ...ch,
            userId: userId,
            programType: program, // Assigns the correct category (e.g., 'stress')
            progress: 0,
            isCompleted: false
        }))
    );

    await Challenge.insertMany(allChallenges);
};