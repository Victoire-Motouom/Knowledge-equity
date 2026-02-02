import type { Review, ReviewRating } from "@shared/api";

export type ReviewSortMode = "new" | "top" | "controversial";

const ratingScore: Record<ReviewRating, number> = {
  confirmed_correct: 1.0,
  novel_insight: 1.3,
  valuable_incomplete: 0.7,
  incorrect_constructive: 0.4,
  not_credible: 0.0,
};

/**
 * Heuristic controversy score:
 * - higher confidence increases controversy weight
 * - ratings near the middle are more "arguable" than extremes
 */
function controversyScore(r: Review) {
  const rs = ratingScore[r.rating];
  // distance from middle (~0.65) -> closer means more controversial
  const dist = Math.abs(rs - 0.65);
  const middleCloseness = 1 - Math.min(1, dist / 0.65);
  return middleCloseness * (r.confidence / 100);
}

export function sortReviews(reviews: Review[], mode: ReviewSortMode): Review[] {
  const arr = [...reviews];

  if (mode === "new") {
    return arr.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  if (mode === "top") {
    return arr.sort((a, b) => (b.ke_awarded ?? 0) - (a.ke_awarded ?? 0));
  }

  // controversial
  return arr.sort((a, b) => controversyScore(b) - controversyScore(a));
}
