import * as React from "react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export function SegmentedControl<T extends string>(props: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
  className?: string;
}) {
  const { value, options, onChange } = props;

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-muted/40 p-1",
        "shadow-sm",
        props.className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              haptic("tap");
              onChange(opt.value);
            }}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
              "focus:outline-none focus:ring-2 focus:ring-primary/40",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
