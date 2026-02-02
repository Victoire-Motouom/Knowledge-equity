import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";

const mocks = vi.hoisted(() => {
  return {
    getUser: vi.fn(),
    from: vi.fn(),
    rpc: vi.fn(),
  };
});

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

describe("review comments routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("GET /api/reviews/:id/comments returns 400 for invalid id", async () => {
    const app = createServer();
    const res = await request(app).get("/api/reviews/not-a-number/comments");
    expect(res.status).toBe(400);
  });

  it("POST /api/review-comments returns 401 when missing auth", async () => {
    const app = createServer();
    const res = await request(app)
      .post("/api/review-comments")
      .send({ review_id: 1, body: "hello" });
    expect(res.status).toBe(401);
  });

  it("POST /api/review-comments creates a comment (201)", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "u@e.com", user_metadata: {} } },
      error: null,
    });

    // Query builder mocks (ordered calls):
    // 1) ensureUserRow: users select by id -> maybeSingle() => none
    // 2) ensureUserRow: users insert -> select -> single
    // 3) verify review exists: reviews select -> eq -> maybeSingle
    // 4) insert comment: review_comments insert -> select -> single

    const qbUsers: any = {
      select: vi.fn(() => qbUsers),
      eq: vi.fn(() => qbUsers),
      maybeSingle: vi.fn(),
      insert: vi.fn(() => qbUsers),
      single: vi.fn(async () => ({
        data: { id: "u1", handle: "u1", email: "u@e.com", created_at: "now" },
        error: null,
      })),
    };

    // ensureUserRow does 1-2 maybeSingle reads (by id, maybe by email)
    const maybeSingleCalls = { n: 0 };
    qbUsers.maybeSingle.mockImplementation(async () => {
      maybeSingleCalls.n += 1;
      if (maybeSingleCalls.n <= 2) return { data: null, error: null };
      return { data: { id: "u1" }, error: null };
    });

    const qbReviewSelect: any = {
      select: vi.fn(() => qbReviewSelect),
      eq: vi.fn(() => qbReviewSelect),
      maybeSingle: vi.fn(async () => ({ data: { id: 1 }, error: null })),
    };

    const qbCommentInsert: any = {
      insert: vi.fn(() => qbCommentInsert),
      select: vi.fn(() => qbCommentInsert),
      single: vi.fn(async () => ({
        data: {
          id: 10,
          review_id: 1,
          author: "u1",
          parent_id: null,
          body: "hello",
          created_at: "now",
          updated_at: null,
          users: { handle: "u1" },
        },
        error: null,
      })),
    };

    mocks.from.mockImplementation((table: string) => {
      if (table === "users") return qbUsers;
      if (table === "reviews") return qbReviewSelect;
      if (table === "review_comments") return qbCommentInsert;
      return qbUsers;
    });

    const app = createServer();
    const res = await request(app)
      .post("/api/review-comments")
      .set("Authorization", "Bearer good")
      .send({ review_id: 1, body: "hello" });

    expect(res.status).toBe(201);
    expect(res.body.comment.body).toBe("hello");
    expect(res.body.comment.review_id).toBe(1);
  });
});
