import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      setIsInstalled(standalone);
    };
    checkInstalled();
    window.addEventListener("appinstalled", checkInstalled);
    return () => window.removeEventListener("appinstalled", checkInstalled);
  }, []);

  useEffect(() => {
    setVisible(Boolean(deferredPrompt));
  }, [deferredPrompt]);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setVisible(false);
  };

  const onDismiss = () => {
    setVisible(false);
  };

  if (isInstalled || !visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-border bg-background/95 p-4 shadow-lg space-y-3">
      <div>
        <div className="text-sm font-semibold text-foreground">
          Install Knowledge Equity
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Get faster access and offline-ready support by installing the app.
        </div>
      </div>
      {visible && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onInstall}>
            Install
          </Button>
          <Button size="sm" variant="secondary" onClick={onDismiss}>
            Not now
          </Button>
        </div>
      )}
    </div>
  );
}
