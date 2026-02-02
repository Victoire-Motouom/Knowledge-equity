import type { RequestHandler } from "express";

/**
 * Very small in-memory rate limiter.
 * Suitable for single-instance deployments; for multi-instance use Redis, Upstash, etc.
 */
export function rateLimit(options: {
  windowMs: number;
  max: number;
  key?: (req: Parameters<RequestHandler>[0]) => string;
}): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();

  const keyFn = options.key ?? ((req) => req.ip ?? "unknown");

  return (req, res, next) => {
    const now = Date.now();
    const key = keyFn(req);

    const current = hits.get(key);
    if (!current || now >= current.resetAt) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    current.count += 1;
    hits.set(key, current);

    if (current.count > options.max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      return res.status(429).json({
        error: "Too many requests",
        retryAfterSeconds,
      });
    }

    next();
  };
}
