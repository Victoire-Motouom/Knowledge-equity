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
  email: "newuser@example.com",
  user_metadata: {},
} as unknown as User;

describe("/api/profile/me (route)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUser.mockReset();
    mocks.from.mockReset();
  });

  it("auto-creates a public.users row when missing", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: authUser }, error: null });

    let usersLookupCount = 0;

    mocks.from.mockImplementation((table: string) => {
      if (table === "users") {
        // First two lookups (by id, then by email) return null.
        // Then uniqueness check for candidate handle returns null.
        // Finally insert returns inserted row.
        usersLookupCount += 1;

        if (usersLookupCount <= 2) {
          return createQuery({ maybeSingle: { data: null, error: null } });
        }

        // handle uniqueness check
        if (usersLookupCount === 3) {
          return createQuery({ maybeSingle: { data: null, error: null } });
        }

        // insert
        return createQuery({
          single: {
            data: {
              id: authUser.id,
              handle: "newuser",
              email: authUser.email,
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
      .get("/api/profile/me")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(authUser.id);
    expect(res.body.handle).toBeTruthy();
    expect(res.body.ke_global).toBeDefined();
  });
});
