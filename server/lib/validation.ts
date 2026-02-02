import { z } from "zod";
import { CONTRIBUTION_TYPES } from "../../shared/api";

export const ContributionCreateSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(50),
  excerpt: z.string().min(10).max(400).optional(),
  domain: z.string().min(2).max(80),
  type: z.enum(CONTRIBUTION_TYPES),
  effort: z.number().int().positive().max(100000).optional(),
  effortUnit: z.enum(["minutes", "hours"]).optional(),
  external: z.string().url().optional(),
});

export const ReviewSubmitSchema = z.object({
  contribution_id: z.number().int().positive(),
  rating: z.enum([
    "confirmed_correct",
    "novel_insight",
    "valuable_incomplete",
    "incorrect_constructive",
    "not_credible",
  ]),
  confidence: z.number().int().min(0).max(100),
  comment: z.string().min(50).max(5000),
});

export const ReviewCommentCreateSchema = z.object({
  review_id: z.number().int().positive(),
  parent_id: z.number().int().positive().nullable().optional(),
  body: z.string().min(1).max(5000),
});

export const ProfileMeUpdateSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(24)
    .regex(
      /^[a-z0-9_]+$/i,
      "Handle can contain letters, numbers, and underscore",
    )
    .optional(),
  website: z.string().max(200).optional(),
  twitter: z.string().max(80).optional(),
  github: z.string().max(120).optional(),
  expertise: z.array(z.string().min(2).max(80)).optional(),
});

export const SolveIssueCreateSchema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().min(10).max(800),
  domain: z.string().min(2).max(80),
  impact: z.number().int().min(1).max(10),
  actionNeeded: z.enum(["awareness", "funding", "code", "policy"]),
});

export const SolveIssueStatusUpdateSchema = z.object({
  status: z.enum(["open", "closed"]),
});

export const SolveIssueCommentCreateSchema = z.object({
  issue_id: z.number().int().positive(),
  parent_id: z.number().int().positive().nullable().optional(),
  body: z.string().min(1).max(5000),
});
