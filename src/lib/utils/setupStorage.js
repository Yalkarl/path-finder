/**
 * Utility functions for managing temporary setup cache in localStorage.
 * Ensures data is isolated per user session and cleared across accounts.
 */

export const SETUP_STORAGE_KEYS = [
  'setup_educationLevel',
  'setup_characterId',
  'setup_accessoryId',
  'setup_name',
  'setup_grade',
  'setup_grades',
  'setup_analysisMode',
  'setup_targetPath',
  'setup_targetPaths',
  'setup_portfolio',
  'setup_customActivities',
  'setup_selfAssessment',
  'setup_targetProgramType',
  'setup_likes',
  'setup_dislikes',
  'pathfinder_current_setup_uid'
];

/**
 * Completely clears all temporary setup wizard state from localStorage.
 */
export function clearSetupStorage() {
  if (typeof window === 'undefined') return;
  try {
    SETUP_STORAGE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (err) {
    console.warn('Error clearing setup storage:', err);
  }
}

/**
 * Verifies if the setup storage belongs to the current user's UID.
 * If not, clears stale data so a new account starts with a clean slate.
 */
export function ensureCleanSetupForUid(uid) {
  if (typeof window === 'undefined' || !uid) return;
  try {
    const currentUid = localStorage.getItem('pathfinder_current_setup_uid');
    if (currentUid !== uid) {
      clearSetupStorage();
      localStorage.setItem('pathfinder_current_setup_uid', uid);
    }
  } catch (err) {
    console.warn('Error ensuring clean setup storage:', err);
  }
}
