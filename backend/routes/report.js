const express = require('express');
const puppeteer = require('puppeteer');
const WeeklyHealthMetrics = require('../models/WeeklyHealthMetrics');
const FoodIntake = require('../models/FoodIntake');

const router = express.Router();

router.get('/download', async (req, res) => {

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get latest weekly data
    const data = await WeeklyHealthMetrics.findOne({ userId }).sort({ createdAt: -1 });

    if (!data) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Calculations 
    const totalSteps = data.steps.reduce((a, b) => a + b, 0);

    const avgSleep = (
      data.sleepHours.reduce((a, b) => a + b, 0) / data.sleepHours.length
    ).toFixed(1);

    const totalCaloriesBurned = data.caloriesBurned.reduce((a, b) => a + b, 0);
    const totalCaloriesIntake = data.calorieIntake.reduce((a, b) => a + b, 0);

    const avgHR = (
      data.restingHeartRate.reduce((a, b) => a + b, 0) / data.restingHeartRate.length
    ).toFixed(0);

    const avgStress = (
      data.stressLevel.reduce((a, b) => a + b, 0) / data.stressLevel.length
    ).toFixed(0);

    // Nutrition from FoodIntake 
    const foodLogs = await FoodIntake.find({ userId }) || [];

    const totalProtein = foodLogs.reduce((sum, f) => sum + (f.protein || 0), 0);
    const totalCarbs = foodLogs.reduce((sum, f) => sum + (f.carbohydrates || 0), 0);
    const totalFat = foodLogs.reduce((sum, f) => sum + (f.fat || 0), 0);

    // ACTIVITY
    const avgSteps = totalSteps / data.steps.length;
    const activityScore = Math.min((avgSteps / 10000) * 100, 100);

    // SLEEP
    const sleepScoreFinal = Math.min((avgSleep / 8) * 100, 100);

    // HEART
    const heartScore = avgHR <= 70 ? 100 : Math.max(60, 100 - (avgHR - 70) * 2);

    // STRESS
    const stressScore = Math.max(0, 100 - avgStress);

    // NUTRITION
    const totalMacros = totalProtein + totalCarbs + totalFat;
    const proteinRatio = totalMacros > 0 ? totalProtein / totalMacros : 0;

    const nutritionScore =
      proteinRatio > 0.2 && proteinRatio < 0.35 ? 100 : 70;

    // FINAL SCORE
    const healthScore = Math.round(
      activityScore * 0.25 +
      sleepScoreFinal * 0.25 +
      heartScore * 0.2 +
      stressScore * 0.15 +
      nutritionScore * 0.15
    );

    const summaryText =
    healthScore > 80
      ? "Excellent overall health. Maintain your current lifestyle."
      : healthScore > 60
      ? "Good health with some areas to improve."
      : "Your health metrics show areas that need attention.";


    // Simple status logic
    const heartStatus = avgHR < 75 ? "Good" : "Elevated";
    const sleepStatus = avgSleep >= 7 ? "Good" : "Moderate";
    const stressStatus = avgStress < 50 ? "Low" : "High";

    // Colors
    const heartStatusColor = avgHR < 75 ? "#4CAF50" : "#e74c3c";
    const sleepStatusColor = avgSleep >= 7 ? "#4CAF50" : "#f39c12";
    const stressStatusColor = avgStress < 50 ? "#4CAF50" : "#e74c3c";


    const html = `
    <html>
    <head>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        padding: 30px;
        color: #1f2d3d;
        background: #ffffff;
      }

      /* HEADER */
      .header {
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #5b8def;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }

      .title {
        font-size: 22px;
        font-weight: bold;
        color: #2c3e50;
      }

      .meta {
        text-align: right;
        font-size: 12px;
        color: #7f8c8d;
      }

      /* PATIENT INFO */
      .patient-box {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 20px;
        font-size: 13px;
      }

      /* SECTION TITLES */
      h2 {
        margin-top: 25px;
        font-size: 15px;
        border-left: 4px solid #5b8def;
        padding-left: 8px;
      }

      /* SCORE */
      .score-header {
        text-align: center;
        margin: 20px 0;
      }

      .score-value {
        font-size: 42px;
        font-weight: bold;
        color: #5b8def;
      }

      .status-row {
        display: flex;
        justify-content: space-around;
        margin-top: 10px;
        font-size: 13px;
      }

      /* CARDS */
      .card {
        background: #f9fbff;
        padding: 12px;
        margin-top: 10px;
        border-radius: 8px;
        border: 1px solid #e3eaf5;
      }

      canvas {
        max-height: 160px !important;
      }

      .insight {
        background: #eef3ff;
        padding: 10px;
        border-left: 4px solid #5b8def;
        margin-top: 10px;
        font-size: 12px;
      }

    </style>
    </head>

    <body>

    <!-- HEADER -->
    <div class="header">
      <div class="title">Weekly Health Report</div>

      <div class="meta">
        Generated: ${new Date().toLocaleDateString()}<br>
        Report ID: ${userId}
      </div>
    </div>

    <!-- PATIENT INFO -->
    <div class="patient-box">
      <strong>Patient ID:</strong> ${userId} <br>
      <strong>Monitoring Period:</strong> ${data.windowStart?.toDateString()} - ${data.windowEnd?.toDateString()} <br>
      <strong>Device:</strong> ${data.deviceId}
    </div>

    <!-- HEALTH SCORE -->
    <div class="score-header">

      <div style="font-size:14px; color:#6b7c93;">
        Overall Health Score
      </div>

      <div class="score-value">${healthScore}/100</div>

      <div style="font-size:12px; color:#7f8c8d;">
        Based on activity, sleep, heart rate, stress and nutrition 
      </div>

      <div class="status-row">
        <div>
          Heart<br>
          <strong style="color:${heartStatusColor}">${heartStatus}</strong>
        </div>

        <div>
          Sleep<br>
          <strong style="color:${sleepStatusColor}">${sleepStatus}</strong>
        </div>

        <div>
          Stress<br>
          <strong style="color:${stressStatusColor}">${stressStatus}</strong>
        </div>
      </div>

    </div>

    <div class="insight">
      ${summaryText}
    </div>

    <!-- ACTIVITY -->
    <h2>Physical Activity</h2>
    <div class="card">
      <canvas id="stepsChart"></canvas>
    </div>

    <div class="insight">
      Total steps recorded: ${totalSteps}. ${
        Math.max(...data.steps) > 9000
          ? "Activity levels meet recommended guidelines."
          : "Activity levels are below recommended guidelines."
      }
    </div>

    <!-- SLEEP -->
    <h2>Sleep Analysis</h2>
    <div class="card">
      <canvas id="sleepChart"></canvas>
    </div>

    <div class="insight">
      Average sleep duration: ${avgSleep} hours. ${
        avgSleep >= 7
          ? "Sleep duration is within healthy range."
          : "Sleep duration is below recommended levels."
      }
    </div>

    <!-- HEART -->
    <h2>Heart Rate</h2>
    <div class="card">
      <canvas id="heartChart"></canvas>
    </div>

    <div class="insight">
      Average resting heart rate: ${avgHR} bpm. ${
        avgHR < 75
          ? "Within normal range."
          : "Elevated values observed."
      }
    </div>

    <!-- STRESS -->
    <h2>Stress Levels</h2>
    <div class="card">
      <canvas id="stressChart"></canvas>
    </div>

    <div class="insight">
      Average stress level: ${avgStress}. ${
        avgStress < 50
          ? "Stress levels appear controlled."
          : "Elevated stress patterns detected."
      }
    </div>

    <!-- NUTRITION -->
    <h2>Nutrition Summary</h2>
    <div class="card">
      <canvas id="nutritionChart"></canvas>
    </div>

    <div class="insight">
      Macronutrient distribution based on logged intake.
    </div>

    <script>

    const labels = ${JSON.stringify(data.dates.map((d, i) => d || 'Day ' + (i+1)))};

    // STEPS
    new Chart(document.getElementById('stepsChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Steps',
          data: ${JSON.stringify(data.steps)},
          borderColor: '#5b8def',
          backgroundColor: 'rgba(91,141,239,0.15)',
          tension: 0.4,
          fill: true
        }]
      }
    });

    // SLEEP
    new Chart(document.getElementById('sleepChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Deep',
            data: ${JSON.stringify(data.sleepDeepHours)},
            backgroundColor: '#3f51b5'
          },
          {
            label: 'REM',
            data: ${JSON.stringify(data.sleepRemHours)},
            backgroundColor: '#9c27b0'
          },
          {
            label: 'Light',
            data: ${JSON.stringify(data.sleepLightHours)},
            backgroundColor: '#bbdefb'
          }
        ]
      },
      options: {
        plugins: { legend: { position: 'bottom' } }
      }
    });

    // HEART
    new Chart(document.getElementById('heartChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Max HR',
          data: ${JSON.stringify(data.heartRateMax)},
          borderColor: '#e74c3c',
          tension: 0.3
        }]
      }
    });

    // STRESS
    new Chart(document.getElementById('stressChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Stress',
          data: ${JSON.stringify(data.stressLevel)},
          borderColor: '#f39c12',
          tension: 0.3
        }]
      }
    });

    // NUTRITION
    new Chart(document.getElementById('nutritionChart'), {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbs', 'Fat'],
        datasets: [{
          data: [${totalProtein}, ${totalCarbs}, ${totalFat}],
          backgroundColor: ['#27ae60', '#3498db', '#e67e22']
        }]
      }
    });

    </script>

    </body>
    </html>
    `;

    // Generate PDF
 const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process"
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    headless: "new",
  });
    
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#stepsChart');
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=health-report.pdf');
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;