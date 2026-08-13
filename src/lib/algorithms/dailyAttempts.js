/**
 * Utility functions for managing daily assessment attempt limits (Max 2 times per day).
 * Properly user-scoped per account to prevent cross-account quota leaking.
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
 * Gets user-specific localStorage key to prevent quota state leaking across different accounts
 */

function getUserStorageKey(profile) {
  if (profile?.uid) {
    return `pathfinder_daily_attempts_${profile.uid}`;
  }
  return null;
}

/**
 * Gets today's assessment attempt data from profile or user-scoped localStorage.
 * Automatically resets count to 0 if stored date is from a previous day.
 * Caps count at MAX_DAILY_ATTEMPTS to prevent 3/2 or overflow errors.
 * 
 * @param {Object} [profile] - User profile object from Firestore
 * @returns {Object} { date: string, count: number, attempts: string[] }
 */
export function getDailyAssessmentAttempts(profile) {
  const today = getTodayDateString();
  let stored = null;

  // 1. Check profile from Firestore first (Primary Source of Truth)
  if (profile?.dailyAssessmentAttempts) {
    stored = profile.dailyAssessmentAttempts;
  } else if (typeof window !== 'undefined') {
    // 2. Check user-scoped localStorage key only if profile exists
    const key = getUserStorageKey(profile);
    if (key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) stored = JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse daily attempts from localStorage', e);
      }
    }
  }

  // If date is today, return stored record (capped at MAX_DAILY_ATTEMPTS); otherwise reset to today with 0 count
  if (stored && stored.date === today && typeof stored.count === 'number') {
    const safeCount = Math.min(Math.max(0, stored.count), MAX_DAILY_ATTEMPTS);
    return {
      date: today,
      count: safeCount,
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
  const safeCount = Math.min(current.count, MAX_DAILY_ATTEMPTS);
  const remaining = Math.max(0, MAX_DAILY_ATTEMPTS - safeCount);
  
  return {
    canTake: safeCount < MAX_DAILY_ATTEMPTS,
    count: safeCount,
    remaining,
    max: MAX_DAILY_ATTEMPTS
  };
}

/**
 * Increments today's assessment attempt count and persists to user-scoped localStorage & Firestore.
 * 
 * @param {Object} profile - User profile object
 * @param {Function} [updateProfileFn] - Firestore updateUserProfile function
 * @returns {Promise<Object>} Updated attempt record
 */
export async function recordAssessmentAttempt(profile, updateProfileFn = null) {
  const today = getTodayDateString();
  const current = getDailyAssessmentAttempts(profile);
  
  // Cap new count strictly at MAX_DAILY_ATTEMPTS (e.g. max 2/2)
  const newCount = Math.min(current.count + 1, MAX_DAILY_ATTEMPTS);
  const newAttempts = [...current.attempts, new Date().toISOString()];
  
  const record = {
    date: today,
    count: newCount,
    attempts: newAttempts
  };

  // 1. Save to user-scoped localStorage
  if (typeof window !== 'undefined' && profile?.uid) {
    try {
      const key = getUserStorageKey(profile);
      if (key) {
        localStorage.setItem(key, JSON.stringify(record));
      }
      // Remove any legacy global un-scoped key
      localStorage.removeItem('pathfinder_daily_assessment_attempts');
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
