import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight iOS-feeling bottom sheet (standalone, not Radix).
 * - backdrop blur
 * - slide-up animation
 * - respects reduced motion via global CSS vars
 */
export function IosSheet(props: {
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

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0",
          "rounded-t-2xl border border-border bg-popover shadow-2xl",
          "p-4 pb-6",
          "ios-transition",
        )}
        style={{
          animation: "ios-sheet-up var(--dur-ios) var(--ease-ios)",
        }}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />

        {props.title && (
          <div className="mb-3 text-sm font-semibold text-foreground">
            {props.title}
          </div>
        )}

        {props.children}
      </div>

      <style>{`
        @keyframes ios-sheet-up {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
