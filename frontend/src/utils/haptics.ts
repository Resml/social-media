/**
 * Haptic feedback utility using the Navigator Vibrate API.
 * Provides subtle tactile feedback for touch devices.
 */
export const haptics = {
  /** Short burst for success or clicking a navigation item */
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  },

  /** Two short bursts for errors or warnings */
  error: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  },

  /** A sharp single pulse for impactful interactions */
  impact: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  },

  /** Medium pulse for secondary interactions */
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }
};
