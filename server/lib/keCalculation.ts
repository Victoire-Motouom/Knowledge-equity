/**
 * Knowledge Equity (KE) Calculation Algorithm
 *
 * This module handles the core logic for calculating KE rewards
 * based on contributions and expert reviews.
 *
 * Formula (simplified):
 * KE = base_value × log(1 + reviewer_KE) × confidence_factor × rating_multiplier
 *
 * Where:
 * - base_value: Contribution type baseline (research=30, explanation=25, etc.)
 * - reviewer_KE: Reviewer's existing KE in that domain (reduces gaming)
 * - confidence_factor: Reviewer's stated confidence (0-100%)
 * - rating_multiplier: Rating quality multiplier (novel=1.3x, correct=1.0x, etc.)
 */

import {
  ReviewRating,
  ContributionType,
  BASE_KE_VALUES,
  REVIEW_RATING_MULTIPLIERS,
} from "../../shared/api";

export interface ReviewInput {
  rating: ReviewRating;
  confidence: number; // 0-100
  reviewer_ke_in_domain: number;
}

export interface ContributionInput {
  type: ContributionType;
  effort_minutes?: number; // Normalized to minutes
  existing_reviews?: ReviewInput[];
}

export interface KECalculationResult {
  base_ke: number;
  ke_from_reviews: number;
  total_ke: number;
  review_breakdown: Array<{
    rating: ReviewRating;
    confidence: number;
    reviewer_weight: number;
    ke_contribution: number;
  }>;
}

/**
 * Calculate the weight of a reviewer based on their domain expertise
 * Uses logarithmic scaling to prevent extreme dominance by high-KE reviewers
 *
 * @param reviewer_ke - Reviewer's KE in the specific domain
 * @returns Weight factor (typically 0.5 to 4.0)
 */
export function calculateReviewerWeight(reviewer_ke: number): number {
  // Minimum weight for new reviewers (no KE yet)
  const MIN_WEIGHT = 0.5;

  // Use a gentle logarithmic scale with a hard cap.
  // We intentionally avoid huge weights so one high-KE reviewer can't dominate.
  //
  // Rough examples (with multiplier=1.5):
  // - 0 KE     → 0.5
  // - 100 KE   → ~3.5
  // - 1000 KE  → ~5.0
  // - 5000 KE  → ~6.0
  //
  // This keeps KE values in the ranges expected by the UI/tests.
  const MAX_WEIGHT = 8.0;

  if (reviewer_ke <= 0) return MIN_WEIGHT;

  // log10(1+ke) grows slowly: 1000 → ~3, 10000 → ~4
  const weight = MIN_WEIGHT + Math.log10(1 + reviewer_ke) * 1.05;
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, weight));
}

/**
 * Calculate the confidence factor
 * Low confidence reduces the weight of a review
 *
 * @param confidence - Confidence percentage (0-100)
 * @returns Confidence factor (0.0 to 1.0)
 */
export function calculateConfidenceFactor(confidence: number): number {
  // Normalize to 0-1 range
  const normalized = Math.max(0, Math.min(1, confidence / 100));

  // Apply slight curve to emphasize high confidence
  // Low confidence (< 40%) gets heavily penalized
  let factor: number;

  if (normalized < 0.4) {
    factor = normalized * 0.5; // Max 0.2
  } else if (normalized < 0.7) {
    factor = 0.2 + (normalized - 0.4) * 1.0; // 0.2 to 0.5
  } else {
    factor = 0.5 + (normalized - 0.7) * 1.67; // 0.5 to ~1.0
  }

  // Avoid floating drift (e.g. 1.001 at 100%)
  return Math.max(0, Math.min(1, factor));
}

/**
 * Calculate KE from a single review
 *
 * @param base_ke - Base KE value for the contribution type
 * @param review - Review details with rating, confidence, and reviewer KE
 * @returns Calculated KE from this review
 */
export function calculateKEFromReview(
  base_ke: number,
  review: ReviewInput,
): number {
  const reviewer_weight = calculateReviewerWeight(review.reviewer_ke_in_domain);
  const confidence_factor = calculateConfidenceFactor(review.confidence);
  const rating_multiplier = REVIEW_RATING_MULTIPLIERS[review.rating];

  const ke = base_ke * reviewer_weight * confidence_factor * rating_multiplier;

  return Math.round(ke);
}

/**
 * Calculate total KE for a contribution based on all reviews
 * Uses weighted averaging to aggregate multiple reviews
 *
 * @param contribution - Contribution details
 * @returns Complete KE calculation result with breakdown
 */
export function calculateTotalKE(
  contribution: ContributionInput,
): KECalculationResult {
  // Get base KE value for contribution type
  const base_ke = BASE_KE_VALUES[contribution.type];

  // Adjust for effor if provided (optional 10% bonus for longer efforts)
  let adjusted_base = base_ke;
  if (contribution.effort_minutes) {
    // Bonus for efforts > 60 minutes, up to 10% more
    const effort_bonus = Math.min(contribution.effort_minutes / 600, 0.1);
    adjusted_base = Math.round(base_ke * (1 + effort_bonus));
  }

  // If no reviews yet, return base value
  if (
    !contribution.existing_reviews ||
    contribution.existing_reviews.length === 0
  ) {
    return {
      base_ke: adjusted_base,
      ke_from_reviews: 0,
      total_ke: 0, // No KE until reviewed
      review_breakdown: [],
    };
  }

  // Calculate KE from each review
  const review_breakdown = contribution.existing_reviews.map((review) => {
    const reviewer_weight = calculateReviewerWeight(
      review.reviewer_ke_in_domain,
    );
    const confidence_factor = calculateConfidenceFactor(review.confidence);
    const rating_multiplier = REVIEW_RATING_MULTIPLIERS[review.rating];
    const ke_contribution =
      adjusted_base * reviewer_weight * confidence_factor * rating_multiplier;

    return {
      rating: review.rating,
      confidence: review.confidence,
      reviewer_weight: Math.round(reviewer_weight * 100) / 100,
      ke_contribution: Math.round(ke_contribution),
    };
  });

  // Aggregate reviews using weighted average
  // Higher reviewer weights have more influence
  const total_weight = review_breakdown.reduce(
    (sum, r) => sum + r.reviewer_weight,
    0,
  );
  const weighted_ke = review_breakdown.reduce(
    (sum, r) => sum + r.ke_contribution * r.reviewer_weight,
    0,
  );

  const ke_from_reviews =
    total_weight > 0 ? Math.round(weighted_ke / total_weight) : 0;

  return {
    base_ke: adjusted_base,
    ke_from_reviews: ke_from_reviews,
    total_ke: ke_from_reviews, // Final KE is from reviews
    review_breakdown,
  };
}

/**
 * Calculate the "age decay" factor for older reviews
 * Newer reviews should have slightly more weight
 *
 * @param review_age_days - Days since review was created
 * @returns Decay factor (0.8 to 1.0)
 */
export function calculateAgeDecay(review_age_days: number): number {
  // No decay for first 30 days
  if (review_age_days <= 30) {
    return 1.0;
  }

  // Gradual decay: 20% over 6 months
  const months = review_age_days / 30;
  const decay = Math.max(0.8, 1.0 - (months - 1) * 0.04);

  return decay;
}

/**
 * Detect potential gaming/fraud in reviews
 * Returns warnings if suspicious patterns detected
 *
 * @param reviews - All reviews for a contribution
 * @returns List of warnings (empty if clean)
 */
export function detectReviewAnomalies(reviews: ReviewInput[]): string[] {
  const warnings: string[] = [];

  if (reviews.length === 0) {
    return warnings;
  }

  // Check for suspiciously uniform reviews
  const unique_confidences = new Set(reviews.map((r) => r.confidence)).size;
  if (reviews.length >= 3 && unique_confidences === 1) {
    warnings.push("All reviews have identical confidence levels");
  }

  // Check for coordinated high ratings
  const high_ratings = reviews.filter(
    (r) => r.rating === "novel_insight" || r.rating === "confirmed_correct",
  );
  if (reviews.length >= 3 && high_ratings.length === reviews.length) {
    warnings.push("All reviews are maximally positive");
  }

  // Check for reviews from very low-KE reviewers all giving high ratings
  const low_ke_high_rating = reviews.filter(
    (r) =>
      r.reviewer_ke_in_domain < 50 &&
      (r.rating === "novel_insight" || r.rating === "confirmed_correct"),
  );
  if (low_ke_high_rating.length >= 3) {
    warnings.push("Multiple low-KE reviewers giving high ratings");
  }

  return warnings;
}

/**
 * Helper to calculate KE for a reviewer who submitted a review
 * Reviewers also earn KE for providing quality reviews
 *
 * @param contribution_ke - Final KE of the contribution they reviewed
 * @param reviewer_confidence - Their stated confidence
 * @returns KE earned by the reviewer
 */
export function calculateReviewerKE(
  contribution_ke: number,
  reviewer_confidence: number,
): number {
  // Reviewer earns ~10-20% of contribution's KE
  // Scales with their confidence (encourages honest confidence reporting)
  const confidence_factor = calculateConfidenceFactor(reviewer_confidence);
  const reviewer_ke = contribution_ke * 0.15 * confidence_factor;

  return Math.round(Math.max(1, reviewer_ke));
}
