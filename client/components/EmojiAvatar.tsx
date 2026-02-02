import { emojiForHandle } from "@/lib/emoji";
import { cn } from "@/lib/utils";

type EmojiAvatarProps = {
  handle?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<EmojiAvatarProps["size"]>, string> = {
  sm: "h-6 w-6 text-sm",
  md: "h-8 w-8 text-base",
  lg: "h-12 w-12 text-xl",
};

export default function EmojiAvatar({
  handle,
  size = "md",
  className,
}: EmojiAvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-muted/60 border border-border",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <span aria-hidden>{emojiForHandle(handle)}</span>
    </div>
  );
}
