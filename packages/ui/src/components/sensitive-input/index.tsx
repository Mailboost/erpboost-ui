import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../button";
/** Only reveal state is owned here; the consumer supplies the input and value lifecycle. */
export function SensitiveInput({
  children,
  disabled = false,
  revealLabel,
  concealLabel,
}: {
  children: (props: { type: "text" | "password" }) => ReactNode;
  disabled?: boolean;
  revealLabel: string;
  concealLabel: string;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div
      className={cn(
        "erpui-sensitive-input astw:flex astw:w-full astw:items-center astw:gap-2 astw:[&>input]:min-w-0",
        "astw:[&>input]:flex-1 astw:[&>button]:shrink-0",
      )}
    >
      {children({ type: revealed ? "text" : "password" })}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        aria-label={revealed ? concealLabel : revealLabel}
        aria-pressed={revealed}
        disabled={disabled}
        onClick={() => setRevealed(!revealed)}
      >
        {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
      </Button>
    </div>
  );
}
