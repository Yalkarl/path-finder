/**
 * Utility functions for managing daily assessment attempt limits (Max 2 times per day).
 * Separated independently per mode ('discovery' vs 'target-lock').
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
 * Resolves the target mode key ('discovery' or 'target-lock')
 */
export function resolveModeKey(profile, mode = null) {
  if (mode === 'target-lock' || mode === 'discovery') {
    return mode;
  }
  if (profile?.analysisMode === 'target-lock') {
    return 'target-lock';
  }
  return 'discovery';
}

/**
 * Gets user-specific localStorage key per mode
 */
function getUserStorageKey(profile, modeKey) {
  if (profile?.uid) {
    return `pathfinder_daily_attempts_${profile.uid}_${modeKey}`;
  }
  return null;
}

/**
 * Gets today's assessment attempt data for the specified mode from profile or user-scoped localStorage.
 * Automatically resets count to 0 if stored date is from a previous day.
 * Caps count at MAX_DAILY_ATTEMPTS to prevent overflow errors.
 * 
 * @param {Object} [profile] - User profile object from Firestore
 * @param {string} [mode] - Optional mode ('discovery' or 'target-lock')
 * @returns {Object} { date: string, count: number, attempts: string[], mode: string }
 */
export function getDailyAssessmentAttempts(profile, mode = null) {
  const today = getTodayDateString();
  const modeKey = resolveModeKey(profile, mode);
  let stored = null;

  // 1. Check profile from Firestore first (Primary Source of Truth)
  if (profile?.dailyAssessmentAttempts) {
    const rawAttempts = profile.dailyAssessmentAttempts;
    // Check mode-scoped sub-object
    if (rawAttempts[modeKey] && typeof rawAttempts[modeKey] === 'object') {
      stored = rawAttempts[modeKey];
    } else if (rawAttempts.date === today && typeof rawAttempts.count === 'number') {
      // Legacy single object fallback: assign to matching profile mode
      const activeProfileMode = profile?.analysisMode === 'target-lock' ? 'target-lock' : 'discovery';
      if (modeKey === activeProfileMode) {
        stored = rawAttempts;
      }
    }
  }

  // 2. Check user-scoped localStorage key if not found in Firestore
  if (!stored && typeof window !== 'undefined') {
    const key = getUserStorageKey(profile, modeKey);
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
      attempts: Array.isArray(stored.attempts) ? stored.attempts : [],
      mode: modeKey
    };
  }

  return {
    date: today,
    count: 0,
    attempts: [],
    mode: modeKey
  };
}

/**
 * Checks if the user is allowed to take another assessment today for the specified mode.
 * 
 * @param {Object} [profile] - User profile object from Firestore
 * @param {string} [mode] - Optional mode ('discovery' or 'target-lock')
 * @returns {Object} { canTake: boolean, count: number, remaining: number, max: number, mode: string }
 */
export function checkAssessmentQuota(profile, mode = null) {
  const modeKey = resolveModeKey(profile, mode);
  const current = getDailyAssessmentAttempts(profile, modeKey);
  const safeCount = Math.min(current.count, MAX_DAILY_ATTEMPTS);
  const remaining = Math.max(0, MAX_DAILY_ATTEMPTS - safeCount);
  
  return {
    canTake: safeCount < MAX_DAILY_ATTEMPTS,
    count: safeCount,
    remaining,
    max: MAX_DAILY_ATTEMPTS,
    mode: modeKey
  };
}

/**
 * Increments today's assessment attempt count for the specified mode and persists to localStorage & Firestore.
 * 
 * @param {Object} profile - User profile object
 * @param {Function} [updateProfileFn] - Firestore updateUserProfile function
 * @param {string} [mode] - Optional mode ('discovery' or 'target-lock')
 * @returns {Promise<Object>} Updated attempt record
 */
export async function recordAssessmentAttempt(profile, updateProfileFn = null, mode = null) {
  const today = getTodayDateString();
  const modeKey = resolveModeKey(profile, mode);
  const current = getDailyAssessmentAttempts(profile, modeKey);
  
  const newCount = Math.min(current.count + 1, MAX_DAILY_ATTEMPTS);
  const newAttempts = [...current.attempts, new Date().toISOString()];
  
  const modeRecord = {
    date: today,
    count: newCount,
    attempts: newAttempts
  };

  // 1. Save to user-scoped localStorage for this mode
  if (typeof window !== 'undefined' && profile?.uid) {
    try {
      const key = getUserStorageKey(profile, modeKey);
      if (key) {
        localStorage.setItem(key, JSON.stringify(modeRecord));
      }
      // Clean legacy un-scoped key
      localStorage.removeItem('pathfinder_daily_assessment_attempts');
    } catch (e) {
      console.warn('Failed to save daily attempts to localStorage', e);
    }
  }

  // 2. Save to Firestore profile (merging mode-scoped records)
  if (profile?.uid && typeof updateProfileFn === 'function') {
    try {
      const existing = profile?.dailyAssessmentAttempts || {};
      const updatedFullRecord = {
        ...existing,
        date: today,
        [modeKey]: modeRecord
      };
      await updateProfileFn(profile.uid, {
        dailyAssessmentAttempts: updatedFullRecord
      });
    } catch (e) {
      console.warn('Failed to save daily attempts to Firestore', e);
    }
  }

  return modeRecord;
}

/**
 * Resets today's assessment attempt count for the specified mode to 0.
 * 
 * @param {Object} profile - User profile object
 * @param {Function} [updateProfileFn] - Firestore updateUserProfile function
 * @param {string} [mode] - Optional mode ('discovery' or 'target-lock')
 * @returns {Promise<Object>} Reset attempt record
 */
export async function resetAssessmentQuota(profile, updateProfileFn = null, mode = null) {
  const today = getTodayDateString();
  const modeKey = resolveModeKey(profile, mode);
  
  const resetRecord = {
    date: today,
    count: 0,
    attempts: []
  };

  if (typeof window !== 'undefined' && profile?.uid) {
    try {
      const key = getUserStorageKey(profile, modeKey);
      if (key) {
        localStorage.setItem(key, JSON.stringify(resetRecord));
      }
    } catch (e) {
      console.warn('Failed to reset daily attempts in localStorage', e);
    }
  }

  if (profile?.uid && typeof updateProfileFn === 'function') {
    try {
      const existing = profile?.dailyAssessmentAttempts || {};
      const updatedFullRecord = {
        ...existing,
        date: today,
        [modeKey]: resetRecord
      };
      await updateProfileFn(profile.uid, {
        dailyAssessmentAttempts: updatedFullRecord
      });
    } catch (e) {
      console.warn('Failed to reset daily attempts in Firestore', e);
    }
  }

  return resetRecord;
}
