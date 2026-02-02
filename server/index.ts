import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import {
  handleContributions,
  handleCreateContribution,
  handleMyContributions,
} from "./routes/contributions";
import { handleSubmitReview, handleGetReviews } from "./routes/reviews";
import {
  handleCreateReviewComment,
  handleGetReviewComments,
} from "./routes/reviewComments";
import { handleDomains } from "./routes/domains";
import {
  handleDomainSearch,
  handleDomainValidate,
} from "./routes/domainLookup";
import { handleLeaderboard } from "./routes/leaderboard";
import {
  handleProfile,
  handleProfileMe,
  handleProfileMeUpdate,
} from "./routes/profile";
import { handleContributionDetail } from "./routes/contributionDetail";
import {
  handleCreateSolveIssue,
  handleSolveIssueDetail,
  handleSolveIssues,
  handleUpdateSolveIssueStatus,
} from "./routes/solveIssues";
import {
  handleCreateSolveIssueComment,
  handleGetSolveIssueComments,
} from "./routes/solveIssueComments";
import { requireAuth } from "./lib/authMiddleware";
import { rateLimit } from "./lib/rateLimit";
import { rateLimitUpstash } from "./lib/rateLimitUpstash";
import { requestLogger } from "./lib/logger";

export function createServer() {
  const app = express();

  // Middleware
  app.disable("x-powered-by");

  const isProd =
    process.env.NODE_ENV === "production" &&
    process.env.VITE_DEV_SERVER !== "true";

  if (isProd) {
    // In production, enable Helmet including CSP.
    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
      }),
    );
  } else {
    // In development, disable CSP so Vite (inline scripts + blob workers) works.
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    // Extra safety: ensure CSP header is not set by any upstream middleware.
    app.use((_req, res, next) => {
      res.removeHeader("Content-Security-Policy");
      next();
    });
  }

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        // Dev: allow everything (including Vite HMR WebSocket Origin)
        if (!isProd) return cb(null, true);

        // Prod: allow same-origin / curl / server-to-server
        if (!origin) return cb(null, true);
        if (allowedOrigins.length === 0) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("CORS blocked"));
      },
      credentials: true,
    }),
  );

  app.use(requestLogger());

  // Limit request sizes to reduce DoS risk
  app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "200kb" }));
  app.use(
    express.urlencoded({
      extended: true,
      limit: process.env.URLENCODED_BODY_LIMIT || "200kb",
    }),
  );

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/contributions", handleContributions);
  app.get("/api/contributions/:id", handleContributionDetail);
  const maybeLocalRateLimit = (options: Parameters<typeof rateLimit>[0]) =>
    isProd
      ? (
          _req: express.Request,
          _res: express.Response,
          next: express.NextFunction,
        ) => next()
      : rateLimit(options);

  app.post(
    "/api/contributions",
    rateLimitUpstash({ windowMs: 60_000, max: 20, prefix: "contrib" }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 20 }),
    requireAuth,
    handleCreateContribution,
  );

  app.get("/api/domains", handleDomains);
  app.get("/api/domains/search", handleDomainSearch);
  app.get("/api/domains/validate", handleDomainValidate);
  app.get("/api/leaderboard", handleLeaderboard);
  app.get("/api/solve-issues", handleSolveIssues);
  app.get("/api/solve-issues/:id", handleSolveIssueDetail);
  app.post(
    "/api/solve-issues",
    rateLimitUpstash({ windowMs: 60_000, max: 20, prefix: "solve_issues" }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 20 }),
    requireAuth,
    handleCreateSolveIssue,
  );
  app.patch(
    "/api/solve-issues/:id",
    rateLimitUpstash({ windowMs: 60_000, max: 20, prefix: "solve_issues" }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 20 }),
    requireAuth,
    handleUpdateSolveIssueStatus,
  );
  app.get("/api/solve-issues/:id/comments", handleGetSolveIssueComments);
  app.post(
    "/api/solve-issue-comments",
    rateLimitUpstash({
      windowMs: 60_000,
      max: 60,
      prefix: "solve_issue_comments",
    }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 60 }),
    requireAuth,
    handleCreateSolveIssueComment,
  );
  app.get("/api/profile/me", requireAuth, handleProfileMe);
  app.patch(
    "/api/profile/me",
    rateLimitUpstash({ windowMs: 60_000, max: 30, prefix: "profile_me" }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 30 }),
    requireAuth,
    handleProfileMeUpdate,
  );

  // Aliases (documented in README)
  app.get("/api/settings/me", requireAuth, handleProfileMe);
  app.patch(
    "/api/settings/me",
    rateLimitUpstash({ windowMs: 60_000, max: 30, prefix: "settings_me" }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 30 }),
    requireAuth,
    handleProfileMeUpdate,
  );

  app.get("/api/profile/:handle", handleProfile);

  app.get(
    "/api/users/me/contributions",
    rateLimitUpstash({ windowMs: 60_000, max: 60, prefix: "my_contribs" }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 60 }),
    requireAuth,
    handleMyContributions,
  );

  // Review comment routes
  app.get("/api/reviews/:id/comments", handleGetReviewComments);
  app.post(
    "/api/review-comments",
    rateLimitUpstash({ windowMs: 60_000, max: 60, prefix: "review_comments" }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 60 }),
    requireAuth,
    handleCreateReviewComment,
  );

  // Review routes
  app.post(
    "/api/reviews",
    rateLimitUpstash({ windowMs: 60_000, max: 30, prefix: "reviews" }),
    maybeLocalRateLimit({ windowMs: 60_000, max: 30 }),
    requireAuth,
    handleSubmitReview,
  );
  app.get("/api/contributions/:id/reviews", handleGetReviews);

  return app;
}
