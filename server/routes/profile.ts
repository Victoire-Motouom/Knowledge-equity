import { RequestHandler } from "express";
import { supabaseAdmin, supabasePublic } from "../lib/supabaseServer";
import { ProfileMeUpdateSchema } from "../lib/validation";
import { validateWikidataDomain } from "../lib/wikidata";

type UserRow = {
  id: string;
  handle: string;
  email?: string;
  website?: string;
  twitter?: string;
  github?: string;
  created_at: string;
};

type DomainKERow = {
  domain: string;
  ke_amount: number;
  contributions_count: number;
  reviews_given_count: number;
};

function buildProfile(
  user: UserRow,
  domainRows: Partial<DomainKERow>[],
  expertise?: string[],
) {
  const totalKe = (domainRows || []).reduce(
    (sum, r: any) => sum + Number(r.ke_amount ?? 0),
    0,
  );
  const totalContrib = (domainRows || []).reduce(
    (sum, r: any) => sum + Number(r.contributions_count ?? 0),
    0,
  );
  const totalReviews = (domainRows || []).reduce(
    (sum, r: any) => sum + Number(r.reviews_given_count ?? 0),
    0,
  );

  const breakdownRaw = (domainRows || [])
    .map((r: any) => ({ domain: r.domain, ke: Number(r.ke_amount ?? 0) }))
    .filter((r) => r.domain);

  const breakdown = breakdownRaw
    .sort((a, b) => b.ke - a.ke)
    .map((r) => ({
      domain: r.domain,
      ke: Math.round(r.ke),
      percentage: totalKe > 0 ? Math.round((r.ke / totalKe) * 100) : 0,
    }));

  return {
    id: user.id,
    handle: user.handle,
    email: user.email ?? undefined,
    website: (user as any).website ?? undefined,
    twitter: (user as any).twitter ?? undefined,
    github: (user as any).github ?? undefined,
    expertise: expertise ?? undefined,
    ke_global: Math.round(totalKe),
    domain_breakdown: breakdown,
    contributions_count: totalContrib,
    reviews_count: totalReviews,
    joined_at: user.created_at,
  };
}

// GET /api/profile/:handle
export const handleProfile: RequestHandler = async (req, res) => {
  try {
    const handle = req.params.handle;
    if (!handle) return res.status(400).json({ error: "Missing handle" });

    const { data: user, error: userErr } = await supabasePublic
      .from("users")
      .select("id, handle, email, website, twitter, github, created_at")
      .eq("handle", handle)
      .single();

    if (userErr || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { data: domainRows, error: keErr } = await supabasePublic
      .from("user_ke")
      .select("domain, ke_amount, contributions_count, reviews_given_count")
      .eq("user_id", (user as any).id);

    if (keErr) {
      console.error("Fetch profile user_ke error:", keErr);
      return res.status(500).json({ error: keErr.message });
    }

    return res.json(buildProfile(user as any, domainRows as any));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};

// GET /api/profile/me
// Requires an Authorization: Bearer <access_token> header from Supabase Auth.
// Public profile lookup uses anon key.
// Authenticated profile uses admin key (may need to insert into users and read private columns).

export const handleProfileMe: RequestHandler = async (req, res) => {
  try {
    const authUser = req.auth?.user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const authUserId = authUser.id; // Supabase Auth user UUID
    const email = authUser.email ?? null;

    // 1) Prefer lookup by auth user id (stable), fall back to email (legacy).
    let user: any = null;

    const { data: byIdUser } = await supabaseAdmin
      .from("users")
      .select("id, handle, email, website, twitter, github, created_at")
      .eq("id", authUserId)
      .maybeSingle();

    user = byIdUser ?? null;

    if (!user && email) {
      const { data: byEmailUser } = await supabaseAdmin
        .from("users")
        .select("id, handle, email, website, twitter, github, created_at")
        .eq("email", email)
        .maybeSingle();
      user = byEmailUser ?? null;
    }

    // 2) Auto-create a profile row when missing.
    if (!user) {
      const baseFromEmail = email ? email.split("@")[0] : null;
      const baseFromMeta =
        (authUser.user_metadata as any)?.handle ||
        (authUser.user_metadata as any)?.username ||
        null;

      const baseHandleRaw = (
        baseFromMeta ||
        baseFromEmail ||
        "user"
      ).toString();
      const baseHandle = baseHandleRaw
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 24);

      // Ensure unique handle (users.handle has UNIQUE constraint).
      const suffixSeed = authUserId.replace(/-/g, "").slice(-6);
      let candidate = baseHandle || `user_${suffixSeed}`;

      for (let i = 0; i < 5; i++) {
        const { data: existing } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("handle", candidate)
          .maybeSingle();

        if (!existing) break;
        candidate = `${(baseHandle || "user").slice(0, 18)}_${suffixSeed}${i || ""}`;
      }

      const insertPayload: any = {
        id: authUserId,
        handle: candidate,
        email,
      };

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("users")
        .insert(insertPayload)
        .select("id, handle, email, website, twitter, github, created_at")
        .single();

      if (insertErr || !inserted) {
        console.error("Create profile user row error:", insertErr);
        return res
          .status(500)
          .json({ error: insertErr?.message || "Failed to create profile" });
      }

      user = inserted;
    }

    const { data: expertiseRows, error: expErr } = await supabaseAdmin
      .from("user_expertise")
      .select("domain")
      .eq("user_id", (user as any).id);

    if (expErr) {
      console.error("Fetch profile user_expertise error:", expErr);
      return res.status(500).json({ error: expErr.message });
    }

    const expertise = (expertiseRows || [])
      .map((r: any) => r.domain)
      .filter(Boolean);

    const { data: domainRows, error: keErr } = await supabaseAdmin
      .from("user_ke")
      .select("domain, ke_amount, contributions_count, reviews_given_count")
      .eq("user_id", (user as any).id);

    if (keErr) {
      console.error("Fetch profile user_ke error:", keErr);
      return res.status(500).json({ error: keErr.message });
    }

    return res.json(buildProfile(user as any, domainRows as any, expertise));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};

// PATCH /api/profile/me
// Updates profile fields (handle/links) and replaces expertise list.
export const handleProfileMeUpdate: RequestHandler = async (req, res) => {
  try {
    const authUser = req.auth?.user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = ProfileMeUpdateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid payload",
        details: parsed.error.issues.map((i) => i.message).join(", "),
      });
    }

    const authUserId = authUser.id;
    const input = parsed.data;

    const { data: existingUser, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id, handle, email, website, twitter, github, created_at")
      .eq("id", authUserId)
      .maybeSingle();

    if (userErr) {
      console.error("Fetch user for profile update error:", userErr);
      return res.status(500).json({ error: userErr.message });
    }

    if (!existingUser) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const normalizedHandle = input.handle?.toLowerCase();

    if (normalizedHandle && normalizedHandle !== (existingUser as any).handle) {
      const { data: handleOwner, error: handleErr } = await supabaseAdmin
        .from("users")
        .select("id")
        .ilike("handle", normalizedHandle)
        .maybeSingle();

      if (handleErr) {
        console.error("Handle uniqueness check error:", handleErr);
        return res.status(500).json({ error: handleErr.message });
      }

      if (handleOwner && (handleOwner as any).id !== authUserId) {
        return res.status(409).json({ error: "Handle already taken" });
      }
    }

    const normalizeOptional = (v: unknown) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      if (typeof v === "string" && v.trim() === "") return null;
      return v;
    };

    const updates: any = {};
    if (input.handle !== undefined) {
      updates.handle = normalizeOptional(normalizedHandle ?? input.handle);
    }
    if (input.website !== undefined)
      updates.website = normalizeOptional(input.website);
    if (input.twitter !== undefined)
      updates.twitter = normalizeOptional(input.twitter);
    if (input.github !== undefined)
      updates.github = normalizeOptional(input.github);

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabaseAdmin
        .from("users")
        .update(updates)
        .eq("id", authUserId);

      if (updateErr) {
        console.error("Update users row error:", updateErr);
        return res.status(500).json({ error: updateErr.message });
      }
    }

    if (input.expertise !== undefined) {
      const desired = Array.from(
        new Set((input.expertise || []).map((d) => d.trim()).filter(Boolean)),
      ).slice(0, 50);

      if (desired.length > 0) {
        const validations = await Promise.all(
          desired.map((domain) => validateWikidataDomain(domain)),
        );
        const invalid = validations.findIndex((v) => !v.valid || !v.exact);
        if (invalid !== -1) {
          return res.status(400).json({
            error:
              "Domain not found. Please select exact short single-word matches.",
            matches: validations[invalid].matches,
          });
        }
      }

      const { error: delErr } = await supabaseAdmin
        .from("user_expertise")
        .delete()
        .eq("user_id", authUserId);

      if (delErr) {
        console.error("Replace expertise delete error:", delErr);
        return res.status(500).json({ error: delErr.message });
      }

      if (desired.length > 0) {
        const { error: insErr } = await supabaseAdmin
          .from("user_expertise")
          .insert(desired.map((domain) => ({ user_id: authUserId, domain })));

        if (insErr) {
          console.error("Replace expertise insert error:", insErr);
          return res.status(500).json({ error: insErr.message });
        }
      }
    }

    const { data: userAfter, error: userAfterErr } = await supabaseAdmin
      .from("users")
      .select("id, handle, email, website, twitter, github, created_at")
      .eq("id", authUserId)
      .single();

    if (userAfterErr || !userAfter) {
      return res.status(500).json({
        error: userAfterErr?.message || "Failed to load updated profile",
      });
    }

    const { data: expertiseRows, error: expErr } = await supabaseAdmin
      .from("user_expertise")
      .select("domain")
      .eq("user_id", authUserId);

    if (expErr) {
      console.error("Fetch updated user_expertise error:", expErr);
      return res.status(500).json({ error: expErr.message });
    }

    const expertise = (expertiseRows || [])
      .map((r: any) => r.domain)
      .filter(Boolean);

    const { data: domainRows, error: keErr } = await supabaseAdmin
      .from("user_ke")
      .select("domain, ke_amount, contributions_count, reviews_given_count")
      .eq("user_id", authUserId);

    if (keErr) {
      console.error("Fetch updated profile user_ke error:", keErr);
      return res.status(500).json({ error: keErr.message });
    }

    return res.json(
      buildProfile(userAfter as any, domainRows as any, expertise),
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};
