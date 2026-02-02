import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";

const mocks = vi.hoisted(() => {
  return {
    getUser: vi.fn(),
  };
});

vi.mock("../../lib/supabaseServer", () => {
  return {
    supabasePublic: {
      auth: {
        getUser: mocks.getUser,
      },
      from: vi.fn(),
    },
    supabaseAdmin: {
      from: vi.fn(() => {
        // Not reached in these auth-only tests
        return {
          insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })),
        } as any;
      }),
    },
    // NOTE: supabasePublic is already defined above (auth + from).
  };
});

import { createServer } from "../../index";

describe("/api/contributions (route)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUser.mockReset();
  });

  it("returns 401 if Authorization header is missing", async () => {
    const app = createServer();
    const res = await request(app).post("/api/contributions").send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Missing Authorization/i);
  });

  it("returns 401 if token is invalid", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "bad token" },
    });

    const app = createServer();
    const res = await request(app)
      .post("/api/contributions")
      .set("Authorization", "Bearer bad")
      .send({});

    expect(res.status).toBe(401);
  });
});
