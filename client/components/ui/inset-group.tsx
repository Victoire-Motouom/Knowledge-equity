import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * iOS-like inset grouped section (like Settings app).
 */
export function InsetGroup(props: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", props.className)}>
      {props.title && (
        <div className="px-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {props.title}
          </div>
          {props.description && (
            <div className="mt-1 text-xs text-muted-foreground">
              {props.description}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {props.children}
      </div>
    </section>
  );
}

export function InsetRow(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-3", props.className)}>{props.children}</div>
  );
}

export function InsetDivider() {
  return <div className="h-px bg-border" />;
}
