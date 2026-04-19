/**
 * Whoop REST API v1 client.
 * Docs: https://developer.whoop.com/api
 */

import axios from 'axios';
import { getAccessToken } from './auth.js';

const BASE = 'https://api.prod.whoop.com/developer/v1';

async function get(path, params = {}) {
  const token = await getAccessToken();
  const { data } = await axios.get(`${BASE}${path}`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
    timeout: 15_000,
  });
  return data;
}

/**
 * Get recovery records. Includes recovery score, HRV, resting heart rate.
 * @param {Object} opts
 * @param {string} [opts.start] - ISO date string e.g. "2026-04-12T00:00:00.000Z"
 * @param {string} [opts.end]   - ISO date string
 * @param {number} [opts.limit] - max records (default 25)
 */
export async function getRecoveries({ start, end, limit = 25 } = {}) {
  const params = { limit };
  if (start) params.start = start;
  if (end)   params.end = end;
  return get('/recovery', params);
}

/**
 * Get the most recent recovery record.
 */
export async function getLatestRecovery() {
  const data = await getRecoveries({ limit: 1 });
  return data.records?.[0] ?? null;
}

/**
 * Get sleep records. Includes sleep performance, stages, disturbances.
 * @param {Object} opts
 * @param {string} [opts.start]
 * @param {string} [opts.end]
 * @param {number} [opts.limit]
 */
export async function getSleepCollection({ start, end, limit = 7 } = {}) {
  const params = { limit };
  if (start) params.start = start;
  if (end)   params.end = end;
  return get('/activity/sleep', params);
}

/**
 * Get workout records.
 * @param {Object} opts
 * @param {string} [opts.start]
 * @param {string} [opts.end]
 * @param {number} [opts.limit]
 */
export async function getWorkouts({ start, end, limit = 10 } = {}) {
  const params = { limit };
  if (start) params.start = start;
  if (end)   params.end = end;
  return get('/activity/workout', params);
}

/**
 * Get cycle (day-level strain) records.
 * @param {Object} opts
 * @param {string} [opts.start]
 * @param {string} [opts.end]
 * @param {number} [opts.limit]
 */
export async function getCycles({ start, end, limit = 7 } = {}) {
  const params = { limit };
  if (start) params.start = start;
  if (end)   params.end = end;
  return get('/cycle', params);
}

/**
 * Get body measurement data (height, weight, max heart rate, vo2max).
 */
export async function getBodyMeasurement() {
  return get('/user/measurement/body');
}

/**
 * Build a 7-day summary from recovery, sleep, and cycle data.
 * @param {Object[]} recoveries - array of recovery records
 * @param {Object[]} sleeps - array of sleep records
 * @param {Object[]} cycles - array of cycle records
 * @param {Object[]} workouts - array of workout records
 */
export function formatWeeklySummary(recoveries, sleeps, cycles, workouts) {
  const avg = (arr, fn) => {
    const vals = arr.map(fn).filter(v => v != null && !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 'N/A';
  };

  const avgRecovery = avg(recoveries, r => r.score?.recovery_score);
  const avgSleep = avg(sleeps, s => s.score?.sleep_performance_percentage);
  const avgStrain = avg(cycles, c => c.score?.strain);

  const topWorkout = workouts.reduce((best, w) => {
    const strain = w.score?.strain ?? 0;
    return strain > (best?.score?.strain ?? 0) ? w : best;
  }, null);

  const lines = [
    '📊 Weekly Whoop Summary (last 7 days)',
    '',
    `💚 Avg recovery:      ${avgRecovery}%`,
    `😴 Avg sleep perf:    ${avgSleep}%`,
    `⚡ Avg daily strain:  ${avgStrain}`,
  ];

  if (topWorkout) {
    const sport = topWorkout.sport_id ? `Sport #${topWorkout.sport_id}` : 'Workout';
    const strain = topWorkout.score?.strain?.toFixed(1) ?? 'N/A';
    const date = topWorkout.created_at ? new Date(topWorkout.created_at).toLocaleDateString() : '';
    lines.push('', `🏆 Top workout:       ${sport} — strain ${strain}${date ? ' on ' + date : ''}`);
  }

  return lines.join('\n');
}

/**
 * Format recovery record as human-readable string.
 * @param {Object|null} rec - record from getLatestRecovery()
 */
export function formatRecovery(rec) {
  if (!rec) return 'No recovery data found.';
  const score = rec.score;
  const date = rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'unknown';
  const lines = [
    `📅 Date: ${date}`,
    `💚 Recovery score:  ${score?.recovery_score ?? 'N/A'}%`,
    `❤️  Resting HR:     ${score?.resting_heart_rate ?? 'N/A'} bpm`,
    `📊 HRV rMSSD:       ${score?.hrv_rmssd_milli != null ? score.hrv_rmssd_milli.toFixed(1) : 'N/A'} ms`,
    `🌡️  Skin temp:       ${score?.skin_temp_celsius != null ? score.skin_temp_celsius.toFixed(1) : 'N/A'} °C`,
    `🫁 SpO₂:            ${score?.spo2_percentage != null ? score.spo2_percentage.toFixed(1) : 'N/A'}%`,
  ];
  return lines.join('\n');
}
