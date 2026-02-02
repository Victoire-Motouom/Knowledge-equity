/**
 * Tests for KE Calculation Algorithm
 */

import { describe, it, expect } from "vitest";
import {
  calculateReviewerWeight,
  calculateConfidenceFactor,
  calculateKEFromReview,
  calculateTotalKE,
  calculateAgeDecay,
  detectReviewAnomalies,
  calculateReviewerKE,
} from "./keCalculation";
import type { ReviewInput, ContributionInput } from "./keCalculation";

describe("KE Calculation Algorithm", () => {
  describe("calculateReviewerWeight", () => {
    it("should give minimum weight to reviewers with no KE", () => {
      expect(calculateReviewerWeight(0)).toBe(0.5);
    });

    it("should scale logarithmically with reviewer KE", () => {
      const weight_100 = calculateReviewerWeight(100);
      const weight_500 = calculateReviewerWeight(500);
      const weight_1000 = calculateReviewerWeight(1000);

      // Weights should increase but not linearly
      expect(weight_500).toBeGreaterThan(weight_100);
      expect(weight_1000).toBeGreaterThan(weight_500);

      // Log scaling means doubling KE doesn't double weight
      expect(weight_1000 - weight_500).toBeLessThan(weight_500 - weight_100);
    });
  });

  describe("calculateConfidenceFactor", () => {
    it("should heavily penalize low confidence", () => {
      expect(calculateConfidenceFactor(20)).toBeLessThan(0.2);
      expect(calculateConfidenceFactor(30)).toBeLessThan(0.2);
    });

    it("should give full weight to high confidence", () => {
      expect(calculateConfidenceFactor(90)).toBeGreaterThan(0.8);
      expect(calculateConfidenceFactor(100)).toBe(1.0);
    });

    it("should scale moderately for medium confidence", () => {
      const factor_60 = calculateConfidenceFactor(60);
      expect(factor_60).toBeGreaterThan(0.3);
      expect(factor_60).toBeLessThan(0.7);
    });
  });

  describe("calculateKEFromReview", () => {
    it("should calculate KE correctly for a typical review", () => {
      const base_ke = 30; // research contribution
      const review: ReviewInput = {
        rating: "confirmed_correct",
        confidence: 95,
        reviewer_ke_in_domain: 1200,
      };

      const ke = calculateKEFromReview(base_ke, review);

      // Should be positive and significant
      expect(ke).toBeGreaterThan(0);
      expect(ke).toBeLessThan(200); // Sanity check
    });

    it("should give zero KE for not_credible rating", () => {
      const review: ReviewInput = {
        rating: "not_credible",
        confidence: 100,
        reviewer_ke_in_domain: 1000,
      };

      const ke = calculateKEFromReview(30, review);
      expect(ke).toBe(0);
    });

    it("should give bonus KE for novel_insight", () => {
      const base_review: ReviewInput = {
        rating: "confirmed_correct",
        confidence: 100,
        reviewer_ke_in_domain: 1000,
      };

      const novel_review: ReviewInput = {
        ...base_review,
        rating: "novel_insight",
      };

      const ke_confirmed = calculateKEFromReview(30, base_review);
      const ke_novel = calculateKEFromReview(30, novel_review);

      expect(ke_novel).toBeGreaterThan(ke_confirmed);
      // Novel should be ~30% more
      expect(ke_novel / ke_confirmed).toBeCloseTo(1.3, 1);
    });
  });

  describe("calculateTotalKE", () => {
    it("should return zero KE with no reviews", () => {
      const contribution: ContributionInput = {
        type: "research",
        existing_reviews: [],
      };

      const result = calculateTotalKE(contribution);
      expect(result.total_ke).toBe(0);
      expect(result.base_ke).toBeGreaterThan(0);
    });

    it("should aggregate multiple reviews correctly", () => {
      const contribution: ContributionInput = {
        type: "research",
        existing_reviews: [
          {
            rating: "confirmed_correct",
            confidence: 95,
            reviewer_ke_in_domain: 1200,
          },
          {
            rating: "novel_insight",
            confidence: 85,
            reviewer_ke_in_domain: 800,
          },
          {
            rating: "valuable_incomplete",
            confidence: 90,
            reviewer_ke_in_domain: 1500,
          },
        ],
      };

      const result = calculateTotalKE(contribution);

      expect(result.total_ke).toBeGreaterThan(0);
      expect(result.review_breakdown).toHaveLength(3);
      expect(result.ke_from_reviews).toBeGreaterThan(0);
    });

    it("should give bonus for high-effort contributions", () => {
      const low_effort: ContributionInput = {
        type: "research",
        effort_minutes: 30,
        existing_reviews: [],
      };

      const high_effort: ContributionInput = {
        type: "research",
        effort_minutes: 300,
        existing_reviews: [],
      };

      const result_low = calculateTotalKE(low_effort);
      const result_high = calculateTotalKE(high_effort);

      expect(result_high.base_ke).toBeGreaterThan(result_low.base_ke);
    });

    it("should weight expert reviewers more heavily", () => {
      const contribution_expert: ContributionInput = {
        type: "research",
        existing_reviews: [
          {
            rating: "confirmed_correct",
            confidence: 95,
            reviewer_ke_in_domain: 3000, // Expert
          },
        ],
      };

      const contribution_novice: ContributionInput = {
        type: "research",
        existing_reviews: [
          {
            rating: "confirmed_correct",
            confidence: 95,
            reviewer_ke_in_domain: 50, // Novice
          },
        ],
      };

      const ke_expert = calculateTotalKE(contribution_expert).total_ke;
      const ke_novice = calculateTotalKE(contribution_novice).total_ke;

      expect(ke_expert).toBeGreaterThan(ke_novice);
    });
  });

  describe("calculateAgeDecay", () => {
    it("should not decay fresh reviews", () => {
      expect(calculateAgeDecay(1)).toBe(1.0);
      expect(calculateAgeDecay(15)).toBe(1.0);
      expect(calculateAgeDecay(30)).toBe(1.0);
    });

    it("should apply decay to old reviews", () => {
      expect(calculateAgeDecay(60)).toBeLessThan(1.0);
      expect(calculateAgeDecay(180)).toBeLessThan(0.9);
    });

    it("should not decay below minimum", () => {
      expect(calculateAgeDecay(365)).toBeGreaterThanOrEqual(0.8);
      expect(calculateAgeDecay(1000)).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("detectReviewAnomalies", () => {
    it("should detect uniform confidence levels", () => {
      const reviews: ReviewInput[] = [
        {
          rating: "confirmed_correct",
          confidence: 85,
          reviewer_ke_in_domain: 100,
        },
        { rating: "novel_insight", confidence: 85, reviewer_ke_in_domain: 200 },
        {
          rating: "confirmed_correct",
          confidence: 85,
          reviewer_ke_in_domain: 150,
        },
      ];

      const warnings = detectReviewAnomalies(reviews);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.includes("identical confidence"))).toBe(
        true,
      );
    });

    it("should detect all-positive reviews", () => {
      const reviews: ReviewInput[] = [
        { rating: "novel_insight", confidence: 90, reviewer_ke_in_domain: 100 },
        {
          rating: "confirmed_correct",
          confidence: 85,
          reviewer_ke_in_domain: 200,
        },
        { rating: "novel_insight", confidence: 95, reviewer_ke_in_domain: 150 },
      ];

      const warnings = detectReviewAnomalies(reviews);
      expect(warnings.some((w) => w.includes("maximally positive"))).toBe(true);
    });

    it("should not flag normal review patterns", () => {
      const reviews: ReviewInput[] = [
        {
          rating: "confirmed_correct",
          confidence: 90,
          reviewer_ke_in_domain: 1000,
        },
        {
          rating: "valuable_incomplete",
          confidence: 75,
          reviewer_ke_in_domain: 800,
        },
      ];

      const warnings = detectReviewAnomalies(reviews);
      expect(warnings.length).toBe(0);
    });
  });

  describe("calculateReviewerKE", () => {
    it("should award KE to reviewers", () => {
      const reviewer_ke = calculateReviewerKE(100, 95);
      expect(reviewer_ke).toBeGreaterThan(0);
      expect(reviewer_ke).toBeLessThan(100);
    });

    it("should scale with contribution KE", () => {
      const ke_small = calculateReviewerKE(50, 90);
      const ke_large = calculateReviewerKE(200, 90);

      expect(ke_large).toBeGreaterThan(ke_small);
    });

    it("should scale with reviewer confidence", () => {
      const ke_low_conf = calculateReviewerKE(100, 40);
      const ke_high_conf = calculateReviewerKE(100, 95);

      expect(ke_high_conf).toBeGreaterThan(ke_low_conf);
    });

    it("should give at least 1 KE even for small contributions", () => {
      const reviewer_ke = calculateReviewerKE(5, 50);
      expect(reviewer_ke).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Integration test: Real-world scenario", () => {
    it("should calculate KE for Alice's bug analysis (from onboarding)", () => {
      // Scenario: Alice writes a bug analysis, gets reviewed by Bob
      const contribution: ContributionInput = {
        type: "research",
        effort_minutes: 120,
        existing_reviews: [
          {
            rating: "confirmed_correct",
            confidence: 95,
            reviewer_ke_in_domain: 1200, // Bob has 1200 KE
          },
        ],
      };

      const result = calculateTotalKE(contribution);

      // From onboarding: Should be around 88 KE
      // (This is approximate - exact formula may vary slightly)
      expect(result.total_ke).toBeGreaterThan(60);
      expect(result.total_ke).toBeLessThan(120);

      // Bob should also earn KE for reviewing
      const bob_ke = calculateReviewerKE(result.total_ke, 95);
      expect(bob_ke).toBeGreaterThan(0);
    });
  });
});
