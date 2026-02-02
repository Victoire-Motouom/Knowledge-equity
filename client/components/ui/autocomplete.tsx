import React, { useState, useRef, useEffect } from "react";

interface AutocompleteProps {
  suggestions: string[];
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  onSelect?: (v: string) => void;
}

export default function Autocomplete({
  suggestions,
  value = "",
  placeholder,
  onChange,
  onSelect,
}: AutocompleteProps) {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => setInput(value), [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = suggestions
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 8);

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={input}
        placeholder={placeholder}
        onChange={(e) => {
          setInput(e.target.value);
          onChange?.(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg max-h-56 overflow-auto">
          {filtered.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                onSelect?.(s);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-accent/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
