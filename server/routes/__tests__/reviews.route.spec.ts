import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";
import type { User } from "@supabase/supabase-js";

// --- Mock supabaseServer before importing server ---
const mocks = vi.hoisted(() => {
  return {
    getUser: vi.fn(),
    from: vi.fn(),
    rpc: vi.fn(),
  };
});

const createQuery = (result: any) => {
  // Supabase query builder is a "thenable"; awaiting it resolves { data, error }.
  const q: any = {
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    in: vi.fn(() => q),
    order: vi.fn(() => q),
    maybeSingle: vi.fn(
      async () => result.maybeSingle ?? { data: null, error: null },
    ),
    single: vi.fn(async () => result.single ?? { data: null, error: null }),
    then: (resolve: any) =>
      resolve(result.await ?? { data: null, error: null }),
  };
  return q;
};

vi.mock("../../lib/supabaseServer", () => {
  return {
    supabasePublic: {
      auth: {
        getUser: mocks.getUser,
      },
      from: mocks.from,
    },
    supabaseAdmin: {
      from: mocks.from,
      rpc: mocks.rpc,
    },
  };
});

import { createServer } from "../../index";

const user = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "test@example.com",
  user_metadata: {},
} as unknown as User;

describe("/api/reviews (route)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUser.mockReset();
    mocks.from.mockReset();
    mocks.rpc.mockReset();
  });

  it("returns 401 if Authorization header is missing", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const app = createServer();
    const res = await request(app).post("/api/reviews").send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Missing Authorization/i);
  });

  it("returns 409 if user already reviewed", async () => {
    mocks.getUser.mockResolvedValue({ data: { user }, error: null });

    // ensureUserRow - users lookup by id
    mocks.from.mockImplementation((table: string) => {
      if (table === "users") {
        return createQuery({
          maybeSingle: { data: { id: user.id, handle: "tester" }, error: null },
        });
      }
      if (table === "contributions") {
        return createQuery({
          single: {
            data: {
              id: 1,
              author: "someone-else",
              domain: "React",
              type: "research",
              ke_gained: 0,
            },
            error: null,
          },
        });
      }
      if (table === "reviews") {
        // existing review fast-path
        return createQuery({ maybeSingle: { data: { id: 123 }, error: null } });
      }
      return createQuery({});
    });

    const app = createServer();
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", "Bearer token")
      .send({
        contribution_id: 1,
        rating: "confirmed_correct",
        confidence: 80,
        comment: "a".repeat(60),
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already reviewed/i);
  });

  it("returns 403 if user attempts to self-review", async () => {
    mocks.getUser.mockResolvedValue({ data: { user }, error: null });

    mocks.from.mockImplementation((table: string) => {
      if (table === "users") {
        return createQuery({
          maybeSingle: { data: { id: user.id, handle: "tester" }, error: null },
        });
      }
      if (table === "contributions") {
        return createQuery({
          single: {
            data: {
              id: 1,
              author: user.id,
              domain: "React",
              type: "research",
              ke_gained: 0,
            },
            error: null,
          },
        });
      }
      if (table === "reviews") {
        return createQuery({ maybeSingle: { data: null, error: null } });
      }
      return createQuery({});
    });

    const app = createServer();
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", "Bearer token")
      .send({
        contribution_id: 1,
        rating: "confirmed_correct",
        confidence: 80,
        comment: "a".repeat(60),
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/own contributions/i);
  });

  it("creates a review via atomic RPC (201)", async () => {
    mocks.getUser.mockResolvedValue({ data: { user }, error: null });

    mocks.from.mockImplementation((table: string) => {
      if (table === "users") {
        return createQuery({
          maybeSingle: { data: { id: user.id, handle: "tester" }, error: null },
        });
      }
      if (table === "contributions") {
        return createQuery({
          single: {
            data: {
              id: 1,
              author: "someone-else",
              domain: "React",
              type: "research",
              ke_gained: 0,
            },
            error: null,
          },
        });
      }
      if (table === "reviews") {
        // no existing review + list existing reviews
        return createQuery({
          maybeSingle: { data: null, error: null },
          await: { data: [], error: null },
        });
      }
      if (table === "user_ke") {
        // fetch ke rows for reviewers
        return createQuery({ await: { data: [], error: null } });
      }
      return createQuery({});
    });

    mocks.rpc.mockResolvedValue({
      data: [
        {
          review_id: 999,
          review_created_at: new Date().toISOString(),
        },
      ],
      error: null,
    });

    const app = createServer();
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", "Bearer token")
      .send({
        contribution_id: 1,
        rating: "confirmed_correct",
        confidence: 80,
        comment: "a".repeat(60),
      });

    expect(res.status).toBe(201);
    expect(res.body.review.id).toBe(999);
    expect(res.body.review.ke_awarded).toBeTypeOf("number");
  });
});
