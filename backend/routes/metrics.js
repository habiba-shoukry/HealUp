const express = require('express');
const WeeklyHealthMetrics = require('../models/WeeklyHealthMetrics');

const router = express.Router();

const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_DAYS = Number(process.env.DAILY_METRICS_RETENTION_DAYS || 7);
const WEEK_DAYS = 7;

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

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const getWindowStart = (today) => addDays(atStartOfDay(today), -(WEEK_DAYS - 1));

const dayLabel = (dateValue) => {
  const name = new Date(dateValue).toLocaleDateString('en-US', { weekday: 'short' });
  return name.slice(0, 1);
};

const generateSeries = (base, min, max, jitter) => {
  const arr = [];
  for (let i = 0; i < 12; i += 1) {
    const wave = Math.sin((i / 12) * Math.PI * 2) * jitter;
    const value = Math.round(Math.min(max, Math.max(min, base + wave + (Math.random() * jitter - jitter / 2))));
    arr.push(value);
  }
  return arr;
};

const emptyWeekDoc = (userId, deviceId, today) => {
  const windowEnd = atStartOfDay(today);
  const windowStart = getWindowStart(windowEnd);
  const dates = Array.from({ length: WEEK_DAYS }, (_, i) => toDateKey(addDays(windowStart, i)));

  return {
    userId,
    deviceId,
    dates,
    steps: Array.from({ length: WEEK_DAYS }, () => 0),
    distanceKm: Array.from({ length: WEEK_DAYS }, () => 0),
    caloriesBurned: Array.from({ length: WEEK_DAYS }, () => 0),
    calorieIntake: Array.from({ length: WEEK_DAYS }, () => 0),
    sleepHours: Array.from({ length: WEEK_DAYS }, () => 0),
    sleepScore: Array.from({ length: WEEK_DAYS }, () => 0),
    sleepDeepHours: Array.from({ length: WEEK_DAYS }, () => 0),
    sleepRemHours: Array.from({ length: WEEK_DAYS }, () => 0),
    sleepLightHours: Array.from({ length: WEEK_DAYS }, () => 0),
    stressLevel: Array.from({ length: WEEK_DAYS }, () => 0),
    stressHrv: Array.from({ length: WEEK_DAYS }, () => 0),
    stressPeak: Array.from({ length: WEEK_DAYS }, () => 0),
    stressPeakTime: Array.from({ length: WEEK_DAYS }, () => ''),
    stressRecovery: Array.from({ length: WEEK_DAYS }, () => 0),
    stressSeries: Array.from({ length: WEEK_DAYS }, () => Array.from({ length: 12 }, () => 0)),
    restingHeartRate: Array.from({ length: WEEK_DAYS }, () => 0),
    heartRateMin: Array.from({ length: WEEK_DAYS }, () => 0),
    heartRateMax: Array.from({ length: WEEK_DAYS }, () => 0),
    heartRateSeries: Array.from({ length: WEEK_DAYS }, () => Array.from({ length: 12 }, () => 0)),
    windowStart,
    windowEnd,
    expiresAt: addDays(windowEnd, RETENTION_DAYS)
  };
};

const generateSampleForDate = (dateValue, dayOffset) => {
  const date = atStartOfDay(dateValue);
  const steps = Math.max(3500, 7800 + dayOffset * 280 + Math.round(Math.random() * 1300));
  const distanceKm = Number((steps * 0.00075).toFixed(1));
  const caloriesBurned = Math.max(200, Math.round(steps * 0.045));
  const calorieIntake = 1850 + Math.round(Math.random() * 600);
  const sleepHours = Number((6.2 + Math.random() * 2.2).toFixed(1));
  const sleepScore = Math.min(98, Math.max(58, Math.round(60 + sleepHours * 4 + Math.random() * 10)));
  const sleepDeepHours = Number((sleepHours * 0.22).toFixed(1));
  const sleepRemHours = Number((sleepHours * 0.27).toFixed(1));
  const sleepLightHours = Number(Math.max(0, sleepHours - sleepDeepHours - sleepRemHours).toFixed(1));
  const stressLevel = Math.min(85, Math.max(22, Math.round(42 + (Math.random() * 30 - 15))));
  const stressHrv = Math.min(90, Math.max(36, Math.round(68 - stressLevel * 0.28 + Math.random() * 8)));
  const stressPeak = Math.min(95, Math.max(stressLevel + 8, stressLevel + Math.round(Math.random() * 20)));
  const stressRecovery = Math.min(96, Math.max(42, Math.round(95 - stressLevel + Math.random() * 12)));
  const restingHeartRate = Math.min(88, Math.max(56, Math.round(66 + (sleepHours < 7 ? 4 : 0) + Math.random() * 6)));
  const heartRateMin = Math.max(48, restingHeartRate - (8 + Math.round(Math.random() * 4)));
  const heartRateMax = restingHeartRate + 16 + Math.round(Math.random() * 14);

  return {
    date: toDateKey(date),
    steps,
    distanceKm,
    caloriesBurned,
    calorieIntake,
    sleepHours,
    sleepScore,
    sleepDeepHours,
    sleepRemHours,
    sleepLightHours,
    stressLevel,
    stressHrv,
    stressPeak,
    stressPeakTime: ['10am', '12pm', '2pm', '4pm'][Math.floor(Math.random() * 4)],
    stressRecovery,
    stressSeries: generateSeries(stressLevel, 10, 95, 13),
    restingHeartRate,
    heartRateMin,
    heartRateMax,
    heartRateSeries: generateSeries(restingHeartRate + 5, heartRateMin, heartRateMax, 8)
  };
};

const toClientMetric = (item, i) => {
  return {
    id: `${item.userId}-${item.deviceId}-${item.dates[i]}`,
    userId: item.userId,
    deviceId: item.deviceId,
    date: item.dates[i],
    day: dayLabel(item.dates[i]),
    steps: item.steps[i],
    distanceKm: item.distanceKm[i],
    caloriesBurned: item.caloriesBurned[i],
    calorieIntake: item.calorieIntake[i],
    sleepHours: item.sleepHours[i],
    sleepScore: item.sleepScore[i],
    sleepDeepHours: item.sleepDeepHours[i],
    sleepRemHours: item.sleepRemHours[i],
    sleepLightHours: item.sleepLightHours[i],
    stressLevel: item.stressLevel[i],
    stressHrv: item.stressHrv[i],
    stressPeak: item.stressPeak[i],
    stressPeakTime: item.stressPeakTime[i],
    stressRecovery: item.stressRecovery[i],
    stressSeries: item.stressSeries[i],
    restingHeartRate: item.restingHeartRate[i],
    heartRateMin: item.heartRateMin[i],
    heartRateMax: item.heartRateMax[i],
    heartRateSeries: item.heartRateSeries[i]
  };
};

const weekFields = [
  'steps', 'distanceKm', 'caloriesBurned', 'calorieIntake',
  'sleepHours', 'sleepScore', 'sleepDeepHours', 'sleepRemHours', 'sleepLightHours',
  'stressLevel', 'stressHrv', 'stressPeak', 'stressPeakTime', 'stressRecovery', 'stressSeries',
  'restingHeartRate', 'heartRateMin', 'heartRateMax', 'heartRateSeries'
];

const normalizeToCurrentWindow = (doc, today) => {
  const windowEnd = atStartOfDay(today);
  const windowStart = getWindowStart(windowEnd);
  const currentDates = Array.from({ length: WEEK_DAYS }, (_, i) => toDateKey(addDays(windowStart, i)));
  const indexByDate = new Map((doc.dates || []).map((d, i) => [d, i]));

  const next = { ...doc.toObject(), dates: currentDates, windowStart, windowEnd, expiresAt: addDays(windowEnd, RETENTION_DAYS) };
  weekFields.forEach((field) => {
    next[field] = Array.from({ length: WEEK_DAYS }, (_, i) => {
      const oldIndex = indexByDate.get(currentDates[i]);
      if (oldIndex === undefined) {
        // calorieIntake is driven by food logs — default to 0 for new dates
        if (field === 'calorieIntake') return 0;
        const sample = generateSampleForDate(currentDates[i], i - 3);
        return sample[field];
      }
      const currentValue = doc[field]?.[oldIndex];
      if (currentValue === undefined || currentValue === null) {
        if (field === 'calorieIntake') return 0;
        const sample = generateSampleForDate(currentDates[i], i - 3);
        return sample[field];
      }
      return currentValue;
    });
  });

  return next;
};

// GET /api/metrics/weekly/:userId?device=apple
router.get('/weekly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const deviceId = String(req.query.device || 'apple');
    const today = new Date();

    let weekly = await WeeklyHealthMetrics.findOne({ userId, deviceId });
    if (!weekly) {
      const base = emptyWeekDoc(userId, deviceId, today);
      weekFields.forEach((field) => {
        base[field] = Array.from({ length: WEEK_DAYS }, (_, i) => {
          if (field === 'calorieIntake') return 0;
          return generateSampleForDate(base.dates[i], i - 3)[field];
        });
      });
      // Copy calorieIntake from an existing device doc so all devices stay in sync
      const refDoc = await WeeklyHealthMetrics.findOne({ userId, deviceId: { $ne: deviceId } });
      if (refDoc) {
        const intakeByDate = {};
        (refDoc.dates || []).forEach((d, i) => { intakeByDate[d] = refDoc.calorieIntake[i]; });
        base.calorieIntake = base.dates.map(d => intakeByDate[d] ?? 0);
      }
      weekly = await WeeklyHealthMetrics.create(base);
    } else {
      const normalized = normalizeToCurrentWindow(weekly, today);
      weekFields.forEach((field) => {
        weekly[field] = normalized[field];
      });
      weekly.dates = normalized.dates;
      weekly.windowStart = normalized.windowStart;
      weekly.windowEnd = normalized.windowEnd;
      weekly.expiresAt = normalized.expiresAt;
      weekly.updatedAt = new Date();
      await weekly.save();
    }

    const item = weekly.toObject();
    const metrics = Array.from({ length: WEEK_DAYS }, (_, i) => toClientMetric(item, i));

    res.json({
      userId,
      deviceId,
      generatedAt: new Date().toISOString(),
      retentionDays: RETENTION_DAYS,
      metrics
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly metrics.' });
  }
});

// PATCH /api/metrics/:userId/:date?device=apple (date format: YYYY-MM-DD)
router.patch('/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    const deviceId = String(req.query.device || req.body.device || 'apple');
    const dateValue = atStartOfDay(date);

    if (Number.isNaN(dateValue.getTime())) {
      return res.status(400).json({ error: 'Invalid date. Expected YYYY-MM-DD.' });
    }

    let weekly = await WeeklyHealthMetrics.findOne({ userId, deviceId });
    if (!weekly) {
      const base = emptyWeekDoc(userId, deviceId, new Date());
      weekFields.forEach((field) => {
        base[field] = Array.from({ length: WEEK_DAYS }, (_, i) => generateSampleForDate(base.dates[i], i - 3)[field]);
      });
      weekly = await WeeklyHealthMetrics.create(base);
    }

    const normalized = normalizeToCurrentWindow(weekly, new Date());
    weekFields.forEach((field) => { weekly[field] = normalized[field]; });
    weekly.dates = normalized.dates;
    weekly.windowStart = normalized.windowStart;
    weekly.windowEnd = normalized.windowEnd;
    weekly.expiresAt = normalized.expiresAt;

    const dateKey = toDateKey(dateValue);
    const idx = weekly.dates.findIndex((d) => d === dateKey);
    if (idx === -1) {
      return res.status(400).json({ error: 'Date must be inside the current rolling 7-day window.' });
    }

    const patch = {};
    for (const key of weekFields) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    Object.entries(patch).forEach(([key, value]) => {
      const nextArr = Array.isArray(weekly[key]) ? [...weekly[key]] : Array.from({ length: WEEK_DAYS }, () => 0);
      nextArr[idx] = value;
      weekly[key] = nextArr;
    });

    weekly.updatedAt = new Date();
    await weekly.save();

    const item = weekly.toObject();
    return res.json({ metric: toClientMetric(item, idx) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update daily metrics.' });
  }
});

// DELETE /api/metrics/:userId?device=apple&scope=day|week&date=YYYY-MM-DD
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const deviceId = String(req.query.device || 'apple');
    const scope = String(req.query.scope || 'week').toLowerCase();
    const weekly = await WeeklyHealthMetrics.findOne({ userId, deviceId });

    if (!weekly) {
      return res.json({ message: 'No metrics found.', deletedCount: 0 });
    }

    if (scope === 'day') {
      const date = String(req.query.date || toDateKey(new Date()));
      const idx = weekly.dates.findIndex((d) => d === date);
      if (idx === -1) {
        return res.json({ message: 'Day not in current weekly window.', deletedCount: 0 });
      }

      const sample = generateSampleForDate(date, idx - 3);
      weekFields.forEach((field) => {
        const nextArr = Array.isArray(weekly[field]) ? [...weekly[field]] : Array.from({ length: WEEK_DAYS }, () => 0);
        if (field === 'stressPeakTime') {
          nextArr[idx] = '';
        } else if (field === 'stressSeries' || field === 'heartRateSeries') {
          nextArr[idx] = Array.from({ length: 12 }, () => 0);
        } else {
          nextArr[idx] = sample[field] !== undefined ? sample[field] : 0;
        }
        weekly[field] = nextArr;
      });

      weekly.updatedAt = new Date();
      await weekly.save();
      return res.json({ message: 'Day metrics reset.', deletedCount: 1 });
    }

    const result = await WeeklyHealthMetrics.deleteOne({ userId, deviceId });
    return res.json({ message: 'Weekly metrics deleted.', deletedCount: result.deletedCount || 0 });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete metrics.' });
  }
});

module.exports = router;
