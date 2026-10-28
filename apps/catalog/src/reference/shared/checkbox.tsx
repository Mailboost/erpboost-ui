import * as Primitive from "@radix-ui/react-checkbox";
import {
  forwardRef,
  type ElementRef,
  type ComponentPropsWithoutRef,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
export const Checkbox = forwardRef<
  ElementRef<typeof Primitive.Root>,
  ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      "peer border-input dark:bg-transparent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <Primitive.Indicator className="flex items-center justify-center text-current">
      <Check className="size-3.5" />
    </Primitive.Indicator>
  </Primitive.Root>
));
Checkbox.displayName = "Checkbox";
