import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { rateLimit } from "../rateLimit";

describe("rateLimit middleware", () => {
  it("returns 429 and Retry-After after exceeding max", async () => {
    const app = express();
    // Force all requests to share the same key
    app.use(rateLimit({ windowMs: 60_000, max: 2, key: () => "k" }));
    app.get("/", (_req, res) => res.json({ ok: true }));

    const r1 = await request(app).get("/");
    const r2 = await request(app).get("/");
    const r3 = await request(app).get("/");

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
    expect(r3.headers["retry-after"]).toBeTruthy();
    expect(r3.body.error).toMatch(/too many/i);
    expect(r3.body.retryAfterSeconds).toBeTypeOf("number");
  });
});
