import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import type { NotificationItem } from "@shared/api";

const POLL_MS = 30000;

function playNotificationSound() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (_e) {
    // Ignore audio errors
  }
}

export function useNotifications() {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastSeenId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    let mounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchNotifications = async () => {
      try {
        const resp = await fetch("/api/notifications?limit=25", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-store",
          },
          cache: "no-store",
        });
        if (!resp.ok) {
          throw new Error(`Notifications request failed: ${resp.status}`);
        }
        const data = await resp.json().catch(() => ({}));
        if (!mounted) return;
        const items = (data.notifications || []) as NotificationItem[];
        setNotifications(items);
        const unread = items.filter((n) => !n.read_at).length;
        setUnreadCount(unread);
        setError(null);

        const newest = items[0]?.id ?? null;
        if (newest && lastSeenId.current && newest !== lastSeenId.current) {
          playNotificationSound();
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification(items[0]?.title ?? "New notification", {
              body: items[0]?.body ?? "",
            });
          }
        }
        if (!lastSeenId.current && newest) {
          lastSeenId.current = newest;
        } else if (newest) {
          lastSeenId.current = newest;
        }
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError("Unable to load notifications");
      }
    };

    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    fetchNotifications();
    interval = setInterval(fetchNotifications, POLL_MS);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
      if (interval) clearInterval(interval);
    };
  }, [accessToken]);

  const markRead = async (id: number) => {
    if (!accessToken) return;
    await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
  };

  const markAllRead = async () => {
    if (!accessToken) return;
    await fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setNotifications((prev) =>
      prev.map((n) =>
        n.read_at ? n : { ...n, read_at: new Date().toISOString() },
      ),
    );
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markRead, markAllRead, error };
}
