import type {
  BackgroundActivity,
  BackgroundActivityResult,
} from "@/lib/background/types";

/**
 * Runs a list of background activities sequentially and aggregates the result.
 */
export async function runBackgroundActivities(
  activities: BackgroundActivity[],
): Promise<BackgroundActivityResult> {
  if (!activities.length) return "no-data";

  let sawSuccess = false;
  let sawFailure = false;

  for (const activity of activities) {
    const result = await activity();
    if (result === "failed") sawFailure = true;
    if (result === "success") sawSuccess = true;
  }

  if (sawFailure) return "failed";
  if (sawSuccess) return "success";
  return "no-data";
}
