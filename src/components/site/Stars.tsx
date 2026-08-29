import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toBn } from "@/lib/format";

export function Stars({
  rating,
  count,
  size = 14,
  className,
}: {
  rating: number;
  count?: number | null;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              "transition-colors",
              i <= Math.round(rating)
                ? "fill-accent text-accent"
                : "fill-muted text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {toBn(rating.toFixed(1))}
        {count != null ? ` (${toBn(count)})` : ""}
      </span>
    </div>
  );
}
