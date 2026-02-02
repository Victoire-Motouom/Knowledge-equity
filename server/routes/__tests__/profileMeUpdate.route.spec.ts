import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";
import type { User } from "@supabase/supabase-js";

const mocks = vi.hoisted(() => {
  return {
    getUser: vi.fn(),
    from: vi.fn(),
  };
});

const createQuery = (result: any) => {
  const q: any = {
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    maybeSingle: vi.fn(
      async () => result.maybeSingle ?? { data: null, error: null },
    ),
    single: vi.fn(async () => result.single ?? { data: null, error: null }),
    then: (resolve: any) =>
      resolve(result.await ?? { data: null, error: null }),
    insert: vi.fn(() => q),
    update: vi.fn(() => q),
    delete: vi.fn(() => q),
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
    },
  };
});

import { createServer } from "../../index";

const authUser = {
  id: "00000000-0000-0000-0000-0000000000aa",
  email: "me@example.com",
  user_metadata: {},
} as unknown as User;

describe("PATCH /api/profile/me (route)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUser.mockReset();
    mocks.from.mockReset();
  });

  it("updates profile fields", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: authUser }, error: null });

    let usersFromCall = 0;

    mocks.from.mockImplementation((table: string) => {
      if (table === "users") {
        usersFromCall += 1;

        // 1) existingUser lookup (select...maybeSingle)
        if (usersFromCall === 1) {
          return createQuery({
            maybeSingle: {
              data: {
                id: authUser.id,
                handle: "old",
                created_at: new Date().toISOString(),
              },
              error: null,
            },
          });
        }

        // 2) handle uniqueness check (select...maybeSingle)
        if (usersFromCall === 2) {
          return createQuery({ maybeSingle: { data: null, error: null } });
        }

        // 3) update users row (update...eq => await)
        if (usersFromCall === 3) {
          return createQuery({ await: { data: null, error: null } });
        }

        // 4) userAfter (select...single)
        return createQuery({
          single: {
            data: {
              id: authUser.id,
              handle: "new",
              created_at: new Date().toISOString(),
            },
            error: null,
          },
        });
      }

      if (table === "user_expertise") {
        return createQuery({ await: { data: [], error: null } });
      }

      if (table === "user_ke") {
        return createQuery({ await: { data: [], error: null } });
      }

      return createQuery({});
    });

    const app = createServer();
    const res = await request(app)
      .patch("/api/profile/me")
      .set("Authorization", "Bearer token")
      .send({ handle: "new" });

    expect(res.status).toBe(200);
    expect(res.body.handle).toBe("new");
  });

  it("replaces expertise", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: authUser }, error: null });

    let expPhase = 0;

    mocks.from.mockImplementation((table: string) => {
      if (table === "users") {
        // existing + userAfter
        expPhase++;
        if (expPhase === 1) {
          return createQuery({
            maybeSingle: {
              data: { id: authUser.id, handle: "me" },
              error: null,
            },
          });
        }
        return createQuery({
          single: {
            data: {
              id: authUser.id,
              handle: "me",
              created_at: new Date().toISOString(),
            },
            error: null,
          },
        });
      }

      if (table === "user_expertise") {
        // delete then insert then select
        return createQuery({
          await: { data: [{ domain: "React" }], error: null },
        });
      }

      if (table === "user_ke") {
        return createQuery({ await: { data: [], error: null } });
      }

      return createQuery({});
    });

    const app = createServer();
    const res = await request(app)
      .patch("/api/profile/me")
      .set("Authorization", "Bearer token")
      .send({ expertise: ["React", "Distributed Systems"] });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.expertise)).toBe(true);
  });

  it("returns 409 when handle is taken", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: authUser }, error: null });

    let usersCall = 0;
    mocks.from.mockImplementation((table: string) => {
      if (table === "users") {
        usersCall++;
        if (usersCall === 1) {
          return createQuery({
            maybeSingle: {
              data: { id: authUser.id, handle: "me" },
              error: null,
            },
          });
        }
        // handleOwner is someone else
        if (usersCall === 2) {
          return createQuery({
            maybeSingle: { data: { id: "someone-else" }, error: null },
          });
        }
        return createQuery({});
      }
      return createQuery({ await: { data: [], error: null } });
    });

    const app = createServer();
    const res = await request(app)
      .patch("/api/profile/me")
      .set("Authorization", "Bearer token")
      .send({ handle: "taken" });

    expect(res.status).toBe(409);
  });
});
