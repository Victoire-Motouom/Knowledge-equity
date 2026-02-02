import type { RequestHandler } from "express";
import { supabaseAdmin } from "../lib/supabaseServer";

export const handleGetNotifications: RequestHandler = async (req, res) => {
  try {
    const authUser = req.auth?.user;
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 25));

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("id, title, body, link, created_at, read_at")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Fetch notifications error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ notifications: data || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};

export const handleMarkNotificationRead: RequestHandler = async (req, res) => {
  try {
    const authUser = req.auth?.user;
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "Invalid id" });

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", authUser.id);

    if (error) {
      console.error("Mark notification read error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};

export const handleMarkAllRead: RequestHandler = async (req, res) => {
  try {
    const authUser = req.auth?.user;
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", authUser.id)
      .is("read_at", null);

    if (error) {
      console.error("Mark all notifications read error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};
