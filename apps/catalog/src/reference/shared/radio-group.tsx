import * as React from "react";
import * as Primitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
export const RadioGroup=React.forwardRef<React.ElementRef<typeof Primitive.Root>,React.ComponentPropsWithoutRef<typeof Primitive.Root>>(({className,...props},ref)=><Primitive.Root ref={ref} className={cn("grid gap-2",className)} {...props}/>);
export const RadioGroupItem=React.forwardRef<React.ElementRef<typeof Primitive.Item>,React.ComponentPropsWithoutRef<typeof Primitive.Item>>(({className,...props},ref)=><Primitive.Item ref={ref} className={cn("aspect-square size-4 rounded-full border border-primary text-primary shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",className)} {...props}><Primitive.Indicator className="flex items-center justify-center"><Circle className="size-2.5 fill-current"/></Primitive.Indicator></Primitive.Item>);
RadioGroup.displayName="RadioGroup"; RadioGroupItem.displayName="RadioGroupItem";
