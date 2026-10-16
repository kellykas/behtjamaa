import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;const SegmentedControl = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, "className"> & { options: { value: string; label: string }[]; className?: string }
>(({ className, options = [], ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(
        "flex rounded-md border bg-background p-0.5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-sm [&_input]:border-0 [&_input]:clip-none [&_input]:h-4 [&_input]:w-4 [&_input]:appearance-none [&_input]:accent-foreground",
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <label key={option.value} className="relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm outline-none [&:has([role=radio]:checked)]:shadow-sm">
          <input type="radio" name={props.name ?? "segmented"} value={option.value} className="peer sr-only" />
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground [&>svg]:hidden peer-checked:[&>svg]:block">
            <Check className="h-3 w-3" />
            <Circle className="h-2.5 w-2.5 fill-current text-current peer-checked:hidden" />
          </span>
          {option.label}
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
});
SegmentedControl.displayName = RadioGroupPrimitive.Root.displayName;

export { RadioGroup, RadioGroupItem, SegmentedControl };
