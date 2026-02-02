import type { RequestHandler } from "express";
import crypto from "crypto";

export function requestLogger(): RequestHandler {
  // Allow disabling logs in tests/CI for speed and noise.
  if (process.env.DISABLE_REQUEST_LOGS === "1") {
    return (_req, _res, next) => next();
  }

  return (req, res, next) => {
    const start = Date.now();
    const requestId = (req.header("x-request-id") ||
      crypto.randomUUID()) as string;

    // Attach for downstream usage
    (req as any).requestId = requestId;
    res.setHeader("x-request-id", requestId);

    res.on("finish", () => {
      const durationMs = Date.now() - start;
      const entry = {
        level: "info",
        msg: "http_request",
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
        ip: req.ip,
        userAgent: req.header("user-agent"),
      };

      // eslint-disable-next-line no-console
      console.log(JSON.stringify(entry));
    });

    next();
  };
}
