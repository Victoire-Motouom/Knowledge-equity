import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight iOS-feeling left drawer.
 */
export function IosDrawer(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => props.onOpenChange(false)}
      />

      <aside
        className={cn(
          "absolute left-0 top-0 bottom-0 w-80 max-w-[85vw]",
          "border-r border-border bg-popover shadow-2xl",
          "p-4",
          "ios-transition",
        )}
        style={{ animation: "ios-drawer-in var(--dur-ios) var(--ease-ios)" }}
      >
        {/* Header intentionally minimal (no title/close button). Tap outside to close. */}
        {props.children}
      </aside>

      <style>{`
        @keyframes ios-drawer-in {
          from { transform: translateX(-16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
