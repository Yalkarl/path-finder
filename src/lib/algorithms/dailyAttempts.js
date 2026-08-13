/**
 * Utility functions for managing daily assessment attempt limits (Max 2 times per day).
 */

export const MAX_DAILY_ATTEMPTS = 2;

/**
 * Returns today's date string in local timezone formatted as YYYY-MM-DD
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's assessment attempt data from profile or localStorage.
 * Automatically resets count to 0 if stored date is from a previous day.
 * 
 * @param {Object} [profile] - User profile object from Firestore
 * @returns {Object} { date: string, count: number, attempts: string[] }
 */
export function getDailyAssessmentAttempts(profile) {
  const today = getTodayDateString();
  let stored = null;

  // 1. Check profile from Firestore first
  if (profile?.dailyAssessmentAttempts) {
    stored = profile.dailyAssessmentAttempts;
  } else if (typeof window !== 'undefined') {
    // 2. Fallback to localStorage
    try {
      const raw = localStorage.getItem('pathfinder_daily_assessment_attempts');
      if (raw) stored = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse daily attempts from localStorage', e);
    }
  }

  // If date is today, return stored record; otherwise reset to today with 0 count
  if (stored && stored.date === today && typeof stored.count === 'number') {
    return {
      date: today,
      count: stored.count,
      attempts: Array.isArray(stored.attempts) ? stored.attempts : []
    };
  }

  return {
    date: today,
    count: 0,
    attempts: []
  };
}

/**
 * Checks if the user is allowed to take another assessment today.
 * 
 * @param {Object} [profile] - User profile object from Firestore
 * @returns {Object} { canTake: boolean, count: number, remaining: number, max: number }
 */
export function checkAssessmentQuota(profile) {
  const current = getDailyAssessmentAttempts(profile);
  const remaining = Math.max(0, MAX_DAILY_ATTEMPTS - current.count);
  
  return {
    canTake: current.count < MAX_DAILY_ATTEMPTS,
    count: current.count,
    remaining,
    max: MAX_DAILY_ATTEMPTS
  };
}

/**
 * Increments today's assessment attempt count and persists to localStorage & Firestore.
 * 
 * @param {Object} profile - User profile object
 * @param {Function} [updateProfileFn] - Firestore updateUserProfile function
 * @returns {Promise<Object>} Updated attempt record
 */
export async function recordAssessmentAttempt(profile, updateProfileFn = null) {
  const today = getTodayDateString();
  const current = getDailyAssessmentAttempts(profile);
  
  const newCount = current.count + 1;
  const newAttempts = [...current.attempts, new Date().toISOString()];
  
  const record = {
    date: today,
    count: newCount,
    attempts: newAttempts
  };

  // 1. Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pathfinder_daily_assessment_attempts', JSON.stringify(record));
    } catch (e) {
      console.warn('Failed to save daily attempts to localStorage', e);
    }
  }

  // 2. Save to Firestore profile
  if (profile?.uid && typeof updateProfileFn === 'function') {
    try {
      await updateProfileFn(profile.uid, {
        dailyAssessmentAttempts: record
      });
    } catch (e) {
      console.warn('Failed to save daily attempts to Firestore', e);
    }
  }

  return record;
}
