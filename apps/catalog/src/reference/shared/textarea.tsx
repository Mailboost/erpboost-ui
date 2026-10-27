import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea"> & { variant?: "default" | "plain" }
>(({ className, variant = "default", ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      variant === "plain"
        ? "min-h-[28px] w-full flex-1 resize-none border-0 bg-transparent px-0 py-0 text-sm leading-relaxed shadow-none outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
        : "min-h-0 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
