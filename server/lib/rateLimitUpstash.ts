import type { RequestHandler } from "express";
import { Redis } from "@upstash/redis";

function getRedisFromEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * Upstash-backed rate limiter.
 * Falls back to `next()` if Upstash env vars are not configured.
 */
export function rateLimitUpstash(options: {
  windowMs: number;
  max: number;
  prefix?: string;
  key?: (req: Parameters<RequestHandler>[0]) => string;
}): RequestHandler {
  const redis = getRedisFromEnv();
  const keyFn = options.key ?? ((req) => req.ip ?? "unknown");
  const prefix = options.prefix ?? "rl";

  if (!redis) {
    return (_req, _res, next) => next();
  }

  return async (req, res, next) => {
    const now = Date.now();
    const windowId = Math.floor(now / options.windowMs);
    const key = `${prefix}:${windowId}:${keyFn(req)}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) {
        // only set expire on first hit
        await redis.pexpire(key, options.windowMs);
      }

      if (count > options.max) {
        const resetAt = (windowId + 1) * options.windowMs;
        const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
        res.setHeader("Retry-After", retryAfterSeconds.toString());
        return res.status(429).json({
          error: "Too many requests",
          retryAfterSeconds,
        });
      }

      next();
    } catch (e) {
      // Fail open to avoid taking down the API if Redis is unavailable.
      next();
    }
  };
}
