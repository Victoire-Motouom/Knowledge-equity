/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// ============================================================================
// CONTRIBUTION TYPES
// ============================================================================

export type ContributionType = "research" | "explanation" | "bug" | "debate";

export interface Contribution {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  domain: string;
  type: ContributionType;
  author: string; // handle
  author_id?: string; // uuid
  reviews_count: number;
  ke_gained: number;
  effort?: number;
  effort_unit?: "minutes" | "hours";
  external_link?: string;
  views: number;
  created_at: string;
  updated_at?: string;
}

export interface ContributionCreate {
  title: string;
  content: string;
  excerpt?: string;
  domain: string;
  type: ContributionType;
  effort?: number;
  effortUnit?: "minutes" | "hours";
  external?: string;
}

export interface ContributionUpdate {
  title?: string;
  content?: string;
  excerpt?: string;
  domain?: string;
  type?: ContributionType;
  effort?: number;
  effortUnit?: "minutes" | "hours";
  external?: string;
}

export interface ContributionListResponse {
  contributions: Contribution[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ContributionDetailResponse extends Contribution {
  reviews: Review[];
  stats: {
    views: number;
    reviews: number;
    keGained: number;
    avgConfidence: number;
  };
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export type ReviewRating =
  | "confirmed_correct"
  | "novel_insight"
  | "valuable_incomplete"
  | "incorrect_constructive"
  | "not_credible";

export interface Review {
  id: number;
  contribution_id: number;
  reviewer: string; // handle
  reviewer_id: string; // uuid
  rating: ReviewRating;
  confidence: number; // 0-100
  comment: string;
  ke_awarded: number;
  created_at: string;
}

export interface ReviewComment {
  id: number;
  review_id: number;
  author: string; // handle
  author_id: string; // uuid
  parent_id: number | null;
  body: string;
  created_at: string;
  updated_at: string | null;
}

export interface ReviewCommentsResponse {
  comments: ReviewComment[];
}

export interface ReviewCommentCreate {
  review_id: number;
  parent_id?: number | null;
  body: string;
}

export interface ReviewCommentCreateResponse {
  comment: ReviewComment;
}

export interface ReviewSubmit {
  contribution_id: number;
  rating: ReviewRating;
  confidence: number;
  comment: string;
}

export interface ReviewResponse {
  review: Review;
  contribution_ke_updated: number; // New KE total for the contribution
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  handle: string;
  email?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  handle: string;
  email?: string;
  website?: string;
  twitter?: string;
  github?: string;
  expertise?: string[];
  ke_global: number;
  domain_breakdown: DomainKE[];
  contributions_count: number;
  reviews_count: number;
  joined_at: string;
}

export interface DomainKE {
  domain: string;
  ke: number;
  percentage: number;
}

export interface UserStats {
  total_ke: number;
  contributions: number;
  reviews: number;
  domains: number;
}

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  badge?: string;
  handle: string;
  ke: number;
  contributions: number;
  reviews: number;
  domains: string[];
}

export interface LeaderboardResponse {
  leaders: LeaderboardEntry[];
  domain?: string;
  total: number;
}

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export interface Domain {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface DomainStats {
  domain: string;
  total_contributions: number;
  total_contributors: number;
  total_ke: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError {
  error: string;
  details?: string;
  code?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  domain?: string;
  type?: ContributionType;
  author?: string;
  search?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const REVIEW_RATING_MULTIPLIERS: Record<ReviewRating, number> = {
  confirmed_correct: 1.0,
  novel_insight: 1.3,
  valuable_incomplete: 0.7,
  incorrect_constructive: 0.4,
  not_credible: 0.0,
};

export const BASE_KE_VALUES: Record<ContributionType, number> = {
  research: 30,
  explanation: 25,
  bug: 20,
  debate: 25,
};

/**
 * Runtime list of contribution types for UI filters.
 * Keep in sync with the `ContributionType` union.
 */
export const CONTRIBUTION_TYPES = [
  "research",
  "explanation",
  "bug",
  "debate",
] as const satisfies readonly ContributionType[];

export type SolveIssueStatus = "open" | "closed";

export type SolveIssueAction = "awareness" | "funding" | "code" | "policy";

export type SolveIssue = {
  id: number | string;
  title: string;
  summary: string;
  domain: string;
  impact: number;
  actionNeeded: SolveIssueAction;
  status: SolveIssueStatus;
  authorId?: string;
  authorHandle?: string;
  createdAt?: string;
};

export type SolveIssueResponse = {
  issues: SolveIssue[];
};

export type SolveIssueComment = {
  id: number;
  issueId: number;
  author: string;
  authorId?: string;
  parentId?: number | null;
  body: string;
  createdAt: string;
  updatedAt?: string;
};

export type SolveIssueCommentResponse = {
  comments: SolveIssueComment[];
};
