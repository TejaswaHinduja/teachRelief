import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1",
        "text-base md:text-sm outline-none transition-[border-color,box-shadow]",
        "placeholder:text-muted-foreground file:text-foreground selection:bg-primary selection:text-primary-foreground",
        "dark:bg-input/30",

        // File input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",

        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

        // Focus (NO ring, NO layout shift)
        "focus-visible:border-ring focus-visible:ring-0",
        "focus-visible:shadow-[0_0_0_2px_hsl(var(--ring))]",

        // Error state
        "aria-invalid:border-destructive",
        "aria-invalid:shadow-[0_0_0_2px_hsl(var(--destructive)/0.2)]",
        "dark:aria-invalid:shadow-[0_0_0_2px_hsl(var(--destructive)/0.4)]",

        className
      )}
      {...props}
    />  
  )
}

export { Input }
