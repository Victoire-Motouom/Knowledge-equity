import type { RequestHandler } from "express";
import type { User } from "@supabase/supabase-js";
import { supabasePublic } from "./supabaseServer";

export interface AuthContext {
  token: string;
  user: User;
}

function getBearerToken(req: Parameters<RequestHandler>[0]) {
  const header = req.header("authorization") || req.header("Authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1] ?? null;
}

/**
 * Require a Supabase access token in Authorization: Bearer <token>.
 * Attaches `req.auth` with the resolved user.
 */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return res
      .status(401)
      .json({ error: "Missing Authorization bearer token" });
  }

  const { data, error } = await supabasePublic.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: error?.message || "Invalid token" });
  }

  req.auth = { token, user: data.user };
  next();
};
