export type HapticPattern = "tap" | "success" | "warning" | "error";

/**
 * Very small, optional haptic feedback for mobile.
 * Uses the Vibration API when available.
 * Respects reduced motion preferences implicitly by being optional and short.
 */
export function haptic(pattern: HapticPattern = "tap") {
  if (typeof window === "undefined") return;
  if (!("vibrate" in navigator)) return;

  // Some browsers require a user gesture; call from click handlers.
  const map: Record<HapticPattern, number | number[]> = {
    tap: 10,
    success: [10, 30, 10],
    warning: [20, 40, 20],
    error: [30, 40, 30],
  };

  try {
    navigator.vibrate(map[pattern]);
  } catch {
    // ignore
  }
}
