import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "ke_install_prompt_dismissed";

export default function InstallPrompt() {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!user || !deferredPrompt) {
      setVisible(false);
      return;
    }
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    setVisible(!dismissed);
  }, [user, deferredPrompt]);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "dismissed") {
      localStorage.setItem(DISMISS_KEY, "1");
    }
    setVisible(false);
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-border bg-background/95 p-4 shadow-lg">
      <div className="text-sm font-semibold text-foreground">
        Install Knowledge Equity
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Get faster access and offline-ready support by installing the app.
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={onInstall}>
          Install
        </Button>
        <Button size="sm" variant="secondary" onClick={onDismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
}
