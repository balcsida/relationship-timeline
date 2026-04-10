# shadcn/ui Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Relationship Timeline app with shadcn/ui components, Calm Studio theme, timeline-first layout with synchronized chart/timeline/table interactions.

**Architecture:** Decompose the monolithic RelationshipTimeline.jsx into focused components communicating via React context. App.jsx owns state, EventContext distributes it, and individual components handle rendering. shadcn/ui provides the component primitives.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4, shadcn/ui (latest), Recharts 3, Bun test runner

**Spec:** `docs/superpowers/specs/2026-04-10-shadcn-redesign-design.md`

---

## File Structure

```
src/
├── App.jsx                              (MODIFY - state owner + context provider)
├── index.css                            (MODIFY - add shadcn theme tokens)
├── main.jsx                             (unchanged)
├── i18n/
│   └── translations.js                  (CREATE - extracted translations)
├── context/
│   └── EventContext.jsx                 (CREATE - context + provider + hooks)
├── hooks/
│   └── useEventSync.js                 (CREATE - synchronized scroll/highlight)
├── components/
│   ├── AppHeader.jsx                    (CREATE - header bar)
│   ├── MainLayout.jsx                   (CREATE - orchestrates views)
│   ├── SatisfactionChart.jsx            (CREATE - interactive Recharts chart)
│   ├── VerticalTimeline.jsx             (CREATE - vertical timeline with spine)
│   ├── EventTable.jsx                   (CREATE - shadcn table with actions)
│   ├── EventFormDialog.jsx              (CREATE - add/edit dialog)
│   ├── SettingsDialog.jsx               (CREATE - settings + JSON + export)
│   ├── PrintPreviewDialog.jsx           (CREATE - print preview with fields)
│   ├── DeleteConfirmDialog.jsx          (CREATE - alert dialog for delete)
│   ├── PrintableTimelineChart.jsx       (MODIFY - minor theme updates)
│   ├── TimelineChart.jsx                (DELETE - replaced by SatisfactionChart)
│   ├── PrintDebugger.jsx                (DELETE - no longer needed)
│   ├── RelationshipTimeline.jsx         (DELETE - decomposed into new components)
│   └── ui/                              (CREATE - shadcn component primitives)
│       ├── button.jsx
│       ├── dialog.jsx
│       ├── alert-dialog.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── table.jsx
│       ├── dropdown-menu.jsx
│       ├── checkbox.jsx
│       ├── separator.jsx
│       ├── scroll-area.jsx
│       └── textarea.jsx
├── lib/
│   └── utils.js                         (CREATE - shadcn cn() utility)
├── utils/
│   └── eventUtils.js                    (unchanged)
├── styles/
│   └── print.css                        (MODIFY - updated typography)
├── test/
│   ├── setup.bun.js                     (unchanged)
│   └── test-utils.js                    (MODIFY - add context wrapper)
```

---

### Task 1: Install shadcn/ui and Configure Project

**Files:**
- Create: `src/lib/utils.js`
- Create: `src/components/ui/` (directory for shadcn primitives)
- Modify: `vite.config.js` (add path alias)
- Modify: `src/index.css` (add CSS theme tokens)
- Modify: `package.json` (new dependencies)

- [ ] **Step 1: Install shadcn/ui dependencies**

```bash
cd /Users/hu901131/github.com/relationship-timeline
bun add clsx tailwind-merge class-variance-authority @radix-ui/react-dialog @radix-ui/react-alert-dialog @radix-ui/react-dropdown-menu @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-scroll-area @radix-ui/react-slot
```

- [ ] **Step 2: Create the cn() utility**

Create `src/lib/utils.js`:

```js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Add path alias to vite.config.js**

Modify `vite.config.js` to add the `@/` alias:

```js
/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: process.env.PUBLIC_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react'
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'recharts'
          }
        },
      },
    },
  },
})
```

- [ ] **Step 4: Add jsconfig.json for editor path resolution**

Create `jsconfig.json` in project root:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 5: Add Calm Studio theme tokens to index.css**

Replace `src/index.css` with:

```css
@import "tailwindcss";

@theme {
  --color-background: #f8fafc;
  --color-card: #ffffff;
  --color-primary: #c084fc;
  --color-primary-foreground: #ffffff;
  --color-accent: #fda4af;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-border: #e2e8f0;
  --color-foreground: #1e293b;
  --color-destructive: #ef4444;
  --color-score-very-positive: #10b981;
  --color-score-positive: #84cc16;
  --color-score-neutral: #6b7280;
  --color-score-negative: #f59e0b;
  --color-score-very-negative: #ef4444;
}

@media print {
  .no-print {
    display: none !important;
  }
}
```

- [ ] **Step 6: Verify the build works**

```bash
cd /Users/hu901131/github.com/relationship-timeline
bun run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/utils.js vite.config.js jsconfig.json src/index.css package.json bun.lock
git commit -m "build: install shadcn/ui dependencies and configure theme"
```

---

### Task 2: Create shadcn/ui Component Primitives

**Files:**
- Create: `src/components/ui/button.jsx`
- Create: `src/components/ui/dialog.jsx`
- Create: `src/components/ui/alert-dialog.jsx`
- Create: `src/components/ui/input.jsx`
- Create: `src/components/ui/label.jsx`
- Create: `src/components/ui/table.jsx`
- Create: `src/components/ui/dropdown-menu.jsx`
- Create: `src/components/ui/checkbox.jsx`
- Create: `src/components/ui/separator.jsx`
- Create: `src/components/ui/scroll-area.jsx`
- Create: `src/components/ui/textarea.jsx`

These are standard shadcn/ui component files adapted for JSX (no TypeScript). Each wraps the corresponding Radix UI primitive with Tailwind styling.

- [ ] **Step 1: Create Button component**

Create `src/components/ui/button.jsx`:

```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
        outline: "border border-border bg-card hover:bg-muted text-foreground",
        ghost: "hover:bg-muted text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Step 2: Create Dialog component**

Create `src/components/ui/dialog.jsx`:

```jsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none cursor-pointer">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

- [ ] **Step 3: Create AlertDialog component**

Create `src/components/ui/alert-dialog.jsx`:

```jsx
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

- [ ] **Step 4: Create Input component**

Create `src/components/ui/input.jsx`:

```jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 5: Create Label component**

Create `src/components/ui/label.jsx`:

```jsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

- [ ] **Step 6: Create Table component**

Create `src/components/ui/table.jsx`:

```jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-primary/5",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-3 py-3 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
```

- [ ] **Step 7: Create DropdownMenu component**

Create `src/components/ui/dropdown-menu.jsx`:

```jsx
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-card p-1 text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
```

- [ ] **Step 8: Create Checkbox component**

Create `src/components/ui/checkbox.jsx`:

```jsx
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-border shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary cursor-pointer",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

- [ ] **Step 9: Create Separator component**

Create `src/components/ui/separator.jsx`:

```jsx
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
```

- [ ] **Step 10: Create ScrollArea component**

Create `src/components/ui/scroll-area.jsx`:

```jsx
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
```

- [ ] **Step 11: Create Textarea component**

Create `src/components/ui/textarea.jsx`:

```jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
```

- [ ] **Step 12: Verify build still works**

```bash
cd /Users/hu901131/github.com/relationship-timeline
bun run build
```

Expected: Build succeeds.

- [ ] **Step 13: Commit**

```bash
git add src/components/ui/ src/lib/utils.js
git commit -m "feat(ui): add shadcn/ui component primitives"
```

---

### Task 3: Extract Translations and Create EventContext

**Files:**
- Create: `src/i18n/translations.js`
- Create: `src/context/EventContext.jsx`
- Modify: `src/test/test-utils.js` (add context wrapper)

- [ ] **Step 1: Extract translations to dedicated file**

Create `src/i18n/translations.js`:

```js
export const translations = {
  en: {
    title: 'Relationship Timeline',
    addEvent: 'Add Event',
    editEvent: 'Edit Event',
    eventDescription: 'Event Description',
    descriptionPlaceholder: 'What happened?',
    satisfactionScore: 'Satisfaction (-8 to +8)',
    date: 'Date',
    monthOnly: 'Only record the month',
    save: 'Save',
    cancel: 'Cancel',
    update: 'Update',
    events: 'Events',
    noEvents: 'No events yet. Add your first event to get started.',
    edit: 'Edit',
    delete: 'Delete',
    exportData: 'Export JSON',
    importData: 'Import JSON',
    print: 'Print Timeline',
    viewJSON: 'View JSON',
    copied: 'Copied!',
    copyJSON: 'Copy JSON',
    lineStyle: 'Line Style',
    curved: 'Curved',
    straight: 'Straight',
    satisfactionLevel: 'Satisfaction Level',
    timeline: 'Timeline',
    satisfactionOverTime: 'Satisfaction Over Time',
    deleteConfirmTitle: 'Are you sure?',
    deleteConfirmDescription: 'This will permanently delete the event:',
    importSuccess: 'Data imported successfully!',
    importError: 'Error importing data. Please check the file format.',
    settings: 'Settings',
    chartStyle: 'Chart Style',
    data: 'Data',
    dangerZone: 'Danger Zone',
    clearAllEvents: 'Clear All Events',
    clearConfirmTitle: 'Clear all events?',
    clearConfirmDescription: 'This will permanently delete all events. This action cannot be undone.',
    printTimeline: 'Print Timeline',
    patientName: 'Patient/Client',
    therapistName: 'Therapist',
    sessionDate: 'Session Date',
    sessionNotes: 'Session Notes',
    periodCovered: 'Period Covered',
    totalEvents: 'Total Events',
    eventSummary: 'Event Summary',
    emotionalState: 'Emotional State',
    sessionTitle: 'Relationship Timeline - Therapy Session',
  },
  hu: {
    title: 'Kapcsolat Idővonal',
    addEvent: 'Esemény Hozzáadása',
    editEvent: 'Esemény Szerkesztése',
    eventDescription: 'Esemény Leírása',
    descriptionPlaceholder: 'Mi történt?',
    satisfactionScore: 'Elégedettség (-8-tól +8-ig)',
    date: 'Dátum',
    monthOnly: 'Csak a hónap rögzítése',
    save: 'Mentés',
    cancel: 'Mégse',
    update: 'Frissítés',
    events: 'Események',
    noEvents: 'Még nincsenek események. Add hozzá az elsőt a kezdéshez.',
    edit: 'Szerkesztés',
    delete: 'Törlés',
    exportData: 'JSON Exportálása',
    importData: 'JSON Importálása',
    print: 'Idővonal Nyomtatása',
    viewJSON: 'JSON Megtekintése',
    copied: 'Másolva!',
    copyJSON: 'JSON Másolása',
    lineStyle: 'Vonal Stílus',
    curved: 'Ívelt',
    straight: 'Egyenes',
    satisfactionLevel: 'Elégedettségi Szint',
    timeline: 'Idővonal',
    satisfactionOverTime: 'Elégedettség az Idő Folyamán',
    deleteConfirmTitle: 'Biztosan törölni szeretnéd?',
    deleteConfirmDescription: 'Ez véglegesen törli az eseményt:',
    importSuccess: 'Adatok sikeresen importálva!',
    importError: 'Hiba az importálás során. Kérlek ellenőrizd a fájl formátumát.',
    settings: 'Beállítások',
    chartStyle: 'Diagram Stílus',
    data: 'Adatok',
    dangerZone: 'Veszélyes Zóna',
    clearAllEvents: 'Összes Esemény Törlése',
    clearConfirmTitle: 'Összes esemény törlése?',
    clearConfirmDescription: 'Ez véglegesen törli az összes eseményt. Ez a művelet nem vonható vissza.',
    printTimeline: 'Idővonal Nyomtatása',
    patientName: 'Páciens/Kliens',
    therapistName: 'Terapeuta',
    sessionDate: 'Ülés Dátuma',
    sessionNotes: 'Ülés Jegyzetek',
    periodCovered: 'Vizsgált Időszak',
    totalEvents: 'Összes Esemény',
    eventSummary: 'Esemény Összefoglaló',
    emotionalState: 'Érzelmi Állapot',
    sessionTitle: 'Kapcsolat Idővonal - Terápiás Ülés',
  }
};
```

- [ ] **Step 2: Create EventContext with provider and hooks**

Create `src/context/EventContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sortEventsByDate } from '@/utils/eventUtils';
import { translations } from '@/i18n/translations';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [language, setLanguageState] = useState('en');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [lineType, setLineType] = useState('monotone');

  // Load from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('relationshipEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Persist events
  useEffect(() => {
    localStorage.setItem('relationshipEvents', JSON.stringify(events));
  }, [events]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const addEvent = useCallback((event) => {
    setEvents((prev) => sortEventsByDate([...prev, { ...event, id: Date.now() }]));
  }, []);

  const updateEvent = useCallback((id, updatedEvent) => {
    setEvents((prev) =>
      sortEventsByDate(prev.map((e) => (e.id === id ? { ...updatedEvent, id } : e)))
    );
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEventId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleSelectedEvent = useCallback((id) => {
    setSelectedEventId((prev) => (prev === id ? null : id));
  }, []);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
  }, []);

  const importEvents = useCallback((newEvents) => {
    setEvents(sortEventsByDate(newEvents));
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setSelectedEventId(null);
  }, []);

  const value = {
    events,
    language,
    selectedEventId,
    lineType,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleSelectedEvent,
    setLanguage,
    setLineType,
    importEvents,
    clearEvents,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}

export function useTranslation() {
  const { language } = useEvents();
  return translations[language];
}
```

- [ ] **Step 3: Update test-utils.js with context wrapper**

Replace `src/test/test-utils.js` with:

```js
import { render as rtlRender, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventProvider } from '@/context/EventContext';

// Re-export everything
export * from '@testing-library/react';
export { userEvent, fireEvent, waitFor };

// Custom render function that wraps with EventProvider
export function render(ui, options = {}) {
  const { wrapper: Wrapper, ...rest } = options;

  function AllProviders({ children }) {
    if (Wrapper) {
      return (
        <EventProvider>
          <Wrapper>{children}</Wrapper>
        </EventProvider>
      );
    }
    return <EventProvider>{children}</EventProvider>;
  }

  return rtlRender(ui, { wrapper: AllProviders, ...rest });
}

// Render without providers (for testing components in isolation)
export function renderRaw(ui, options = {}) {
  return rtlRender(ui, options);
}

// Helper for getting elements by text with partial matching
export function getByTextContent(container, text) {
  const elements = [...container.querySelectorAll('*')];
  return elements.find(element => element.textContent?.includes(text));
}

// Helper for async operations
export async function waitForElement(fn, options = {}) {
  const { timeout = 3000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = fn();
      if (result) return result;
    } catch { /* retry */ }
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  throw new Error('Timed out waiting for element');
}
```

- [ ] **Step 4: Verify tests still pass (they will fail since we haven't rewired App.jsx yet, that's expected)**

```bash
cd /Users/hu901131/github.com/relationship-timeline
bun run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/translations.js src/context/EventContext.jsx src/test/test-utils.js
git commit -m "feat: extract translations and create EventContext"
```

---

### Task 4: Create useEventSync Hook

**Files:**
- Create: `src/hooks/useEventSync.js`

- [ ] **Step 1: Create the synchronized scroll/highlight hook**

Create `src/hooks/useEventSync.js`:

```js
import { useRef, useCallback, useEffect } from 'react';
import { useEvents } from '@/context/EventContext';

export function useEventSync() {
  const { selectedEventId } = useEvents();
  const timelineRefs = useRef({});
  const tableRowRefs = useRef({});

  const registerTimelineRef = useCallback((id, el) => {
    if (el) {
      timelineRefs.current[id] = el;
    } else {
      delete timelineRefs.current[id];
    }
  }, []);

  const registerTableRowRef = useCallback((id, el) => {
    if (el) {
      tableRowRefs.current[id] = el;
    } else {
      delete tableRowRefs.current[id];
    }
  }, []);

  // Scroll to selected event when selectedEventId changes
  useEffect(() => {
    if (selectedEventId == null) return;

    const timelineEl = timelineRefs.current[selectedEventId];
    if (timelineEl) {
      timelineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const tableEl = tableRowRefs.current[selectedEventId];
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedEventId]);

  return {
    registerTimelineRef,
    registerTableRowRef,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useEventSync.js
git commit -m "feat: add useEventSync hook for synchronized scrolling"
```

---

### Task 5: Create AppHeader Component

**Files:**
- Create: `src/components/AppHeader.jsx`

- [ ] **Step 1: Create AppHeader**

Create `src/components/AppHeader.jsx`:

```jsx
import { Heart, Settings, Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvents, useTranslation } from '@/context/EventContext';

export default function AppHeader({ onAddEvent, onOpenSettings }) {
  const { language, setLanguage } = useEvents();
  const t = useTranslation();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Heart className="text-white" size={18} />
        </div>
        <h1 className="text-xl font-semibold text-foreground">{t.title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'hu' : 'en')}
        >
          <Globe size={16} />
          {language === 'en' ? 'HU' : 'EN'}
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings size={18} />
        </Button>
        <Button variant="gradient" onClick={onAddEvent}>
          <Plus size={16} />
          {t.addEvent}
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AppHeader.jsx
git commit -m "feat: add AppHeader component"
```

---

### Task 6: Create SatisfactionChart Component

**Files:**
- Create: `src/components/SatisfactionChart.jsx`

- [ ] **Step 1: Create the interactive chart component**

Create `src/components/SatisfactionChart.jsx`:

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useEvents, useTranslation } from '@/context/EventContext';
import { getScoreColor } from '@/utils/eventUtils';

function CustomDot({ cx, cy, payload, selectedEventId, onDotClick }) {
  const isSelected = payload.id === selectedEventId;
  const color = getScoreColor(payload.score);

  return (
    <g onClick={() => onDotClick(payload.id)} className="cursor-pointer">
      {isSelected && (
        <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.2} />
      )}
      <circle
        cx={cx} cy={cy}
        r={isSelected ? 8 : 6}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
}

export default function SatisfactionChart() {
  const { events, lineType, selectedEventId, toggleSelectedEvent } = useEvents();
  const t = useTranslation();

  const chartData = events.map((event) => ({
    date: event.displayDate,
    satisfaction: event.score,
    score: event.score,
    id: event.id,
    description: event.description,
  }));

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground">{t.satisfactionOverTime}</h2>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            stroke="var(--color-border)"
          />
          <YAxis
            domain={[-8, 8]}
            ticks={[-8, -6, -4, -2, 0, 2, 4, 6, 8]}
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            stroke="var(--color-border)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              fontSize: '13px',
            }}
          />
          <ReferenceLine
            y={0}
            stroke="var(--color-muted-foreground)"
            strokeDasharray="5 5"
            strokeWidth={1}
          />
          <Line
            type={lineType}
            dataKey="satisfaction"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            dot={<CustomDot selectedEventId={selectedEventId} onDotClick={toggleSelectedEvent} />}
            activeDot={false}
            name={t.satisfactionLevel}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SatisfactionChart.jsx
git commit -m "feat: add SatisfactionChart with interactive dots"
```

---

### Task 7: Create VerticalTimeline Component

**Files:**
- Create: `src/components/VerticalTimeline.jsx`

- [ ] **Step 1: Create the vertical timeline**

Create `src/components/VerticalTimeline.jsx`:

```jsx
import { useEvents, useTranslation } from '@/context/EventContext';
import { getScoreColor, formatScore } from '@/utils/eventUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function VerticalTimeline({ registerTimelineRef }) {
  const { events, selectedEventId, toggleSelectedEvent } = useEvents();
  const t = useTranslation();

  if (events.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex-1">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t.timeline}</h2>
        <p className="text-sm text-muted-foreground text-center py-8">{t.noEvents}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex-1">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t.timeline}</h2>
      <ScrollArea className="h-[400px]">
        <div className="relative pl-7">
          {/* Gradient spine */}
          <div
            className="absolute left-[7px] top-0 bottom-0 w-0.5"
            style={{ background: 'linear-gradient(to bottom, var(--color-primary), var(--color-accent))' }}
          />

          {events.map((event) => {
            const isSelected = event.id === selectedEventId;
            const color = getScoreColor(event.score);

            return (
              <div
                key={event.id}
                ref={(el) => registerTimelineRef(event.id, el)}
                onClick={() => toggleSelectedEvent(event.id)}
                className={cn(
                  "relative mb-6 last:mb-0 cursor-pointer rounded-lg p-2 -ml-2 transition-all duration-200",
                  isSelected && "bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                {/* Node dot */}
                <div
                  className={cn(
                    "absolute -left-[13px] top-3 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform duration-200",
                    isSelected && "scale-125"
                  )}
                  style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}40` }}
                />

                <div className="text-xs text-muted-foreground mb-0.5">{event.displayDate}</div>
                <div className="text-sm font-medium text-foreground">{event.description}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color }}>
                  {formatScore(event.score)}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/VerticalTimeline.jsx
git commit -m "feat: add VerticalTimeline component with gradient spine"
```

---

### Task 8: Create EventTable Component

**Files:**
- Create: `src/components/EventTable.jsx`

- [ ] **Step 1: Create the event table**

Create `src/components/EventTable.jsx`:

```jsx
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useEvents, useTranslation } from '@/context/EventContext';
import { getScoreColor, formatScore } from '@/utils/eventUtils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function EventTable({ registerTableRowRef, onEditEvent, onDeleteEvent }) {
  const { events, selectedEventId, toggleSelectedEvent } = useEvents();
  const t = useTranslation();

  if (events.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex-1">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t.events}</h2>
        <p className="text-sm text-muted-foreground text-center py-8">{t.noEvents}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex-1">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t.events}</h2>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">{t.date}</TableHead>
              <TableHead className="text-xs">{t.eventDescription}</TableHead>
              <TableHead className="text-xs text-right">{t.satisfactionLevel}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const isSelected = event.id === selectedEventId;
              const color = getScoreColor(event.score);

              return (
                <TableRow
                  key={event.id}
                  ref={(el) => registerTableRowRef(event.id, el)}
                  onClick={() => toggleSelectedEvent(event.id)}
                  className={cn(
                    "cursor-pointer",
                    isSelected && "bg-primary/5"
                  )}
                  data-state={isSelected ? "selected" : undefined}
                >
                  <TableCell className="text-sm text-muted-foreground">{event.displayDate}</TableCell>
                  <TableCell className="text-sm text-foreground">{event.description}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold" style={{ color }}>
                      {formatScore(event.score)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditEvent(event)}>
                          <Edit2 size={14} />
                          {t.edit}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => onDeleteEvent(event)}>
                          <Trash2 size={14} />
                          {t.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EventTable.jsx
git commit -m "feat: add EventTable with dropdown actions"
```

---

### Task 9: Create EventFormDialog Component

**Files:**
- Create: `src/components/EventFormDialog.jsx`

- [ ] **Step 1: Create the add/edit event dialog**

Create `src/components/EventFormDialog.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useEvents, useTranslation } from '@/context/EventContext';

const emptyForm = {
  description: '',
  score: 0,
  date: new Date().toISOString().split('T')[0],
  monthOnly: false,
};

export default function EventFormDialog({ open, onOpenChange, editingEvent }) {
  const { addEvent, updateEvent } = useEvents();
  const t = useTranslation();
  const [form, setForm] = useState(emptyForm);

  const isEditing = editingEvent != null;

  useEffect(() => {
    if (editingEvent) {
      setForm({
        description: editingEvent.description,
        score: editingEvent.score,
        date: editingEvent.date,
        monthOnly: editingEvent.monthOnly || false,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingEvent, open]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const displayDate = form.monthOnly
      ? form.date.substring(0, 7)
      : form.date;

    const eventData = {
      description: form.description,
      score: Number(form.score),
      date: form.date,
      displayDate,
      monthOnly: form.monthOnly,
    };

    if (isEditing) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t.editEvent : t.addEvent}</DialogTitle>
          <DialogDescription>
            {isEditing ? t.editEvent : t.addEvent}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t.eventDescription}</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t.descriptionPlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">{t.satisfactionScore}</Label>
            <Input
              id="score"
              type="number"
              min={-8}
              max={8}
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t.date}</Label>
            <Input
              id="date"
              type={form.monthOnly ? "month" : "date"}
              value={form.monthOnly ? form.date.substring(0, 7) : form.date}
              onChange={(e) => {
                const value = e.target.value;
                setForm({
                  ...form,
                  date: form.monthOnly ? value + '-01' : value,
                });
              }}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="monthOnly"
              checked={form.monthOnly}
              onCheckedChange={(checked) => setForm({ ...form, monthOnly: checked })}
            />
            <Label htmlFor="monthOnly" className="cursor-pointer">{t.monthOnly}</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="gradient">
              {isEditing ? t.update : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EventFormDialog.jsx
git commit -m "feat: add EventFormDialog for add/edit events"
```

---

### Task 10: Create DeleteConfirmDialog Component

**Files:**
- Create: `src/components/DeleteConfirmDialog.jsx`

- [ ] **Step 1: Create the delete confirmation dialog**

Create `src/components/DeleteConfirmDialog.jsx`:

```jsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/context/EventContext';

export default function DeleteConfirmDialog({ open, onOpenChange, event, onConfirm }) {
  const t = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteConfirmDescription} &ldquo;{event?.description}&rdquo;
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => {
              onConfirm(event.id);
              onOpenChange(false);
            }}
          >
            {t.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DeleteConfirmDialog.jsx
git commit -m "feat: add DeleteConfirmDialog with AlertDialog"
```

---

### Task 11: Create SettingsDialog Component

**Files:**
- Create: `src/components/SettingsDialog.jsx`

- [ ] **Step 1: Create the settings dialog**

Create `src/components/SettingsDialog.jsx`:

```jsx
import { useState, useRef } from 'react';
import { Download, Upload, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useEvents, useTranslation } from '@/context/EventContext';
import { exportEventsToJSON, validateImportedData } from '@/utils/eventUtils';

export default function SettingsDialog({ open, onOpenChange, onOpenPrint }) {
  const { events, lineType, setLineType, importEvents, clearEvents } = useEvents();
  const t = useTranslation();
  const [showJSON, setShowJSON] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const { dataUri, filename } = exportEventsToJSON(events);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', filename);
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (validateImportedData(data)) {
          importEvents(data);
          alert(t.importSuccess);
        } else {
          alert(t.importError);
        }
      } catch {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be imported again
    e.target.value = '';
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.settings}</DialogTitle>
            <DialogDescription>{t.settings}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Chart Style */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">{t.chartStyle}</h3>
              <div className="flex gap-2">
                <Button
                  variant={lineType === 'monotone' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLineType('monotone')}
                >
                  {t.curved}
                </Button>
                <Button
                  variant={lineType === 'linear' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLineType('linear')}
                >
                  {t.straight}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Data */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">{t.data}</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download size={14} />
                  {t.exportData}
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} />
                  {t.importData}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={() => setShowJSON(!showJSON)}>
                  {showJSON ? <EyeOff size={14} /> : <Eye size={14} />}
                  {t.viewJSON}
                </Button>
              </div>
            </div>

            {showJSON && (
              <div className="bg-foreground/5 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">JSON</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyJSON}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? t.copied : t.copyJSON}
                  </Button>
                </div>
                <ScrollArea className="h-[200px]">
                  <pre className="text-xs text-foreground font-mono">
                    {JSON.stringify(events, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}

            <Separator />

            {/* Print */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onOpenPrint();
                }}
              >
                {t.printTimeline}
              </Button>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div>
              <h3 className="text-sm font-medium text-destructive mb-2">{t.dangerZone}</h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
              >
                {t.clearAllEvents}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clearConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.clearConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                clearEvents();
                setShowClearConfirm(false);
              }}
            >
              {t.clearAllEvents}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsDialog.jsx
git commit -m "feat: add SettingsDialog with import/export and JSON view"
```

---

### Task 12: Create PrintPreviewDialog Component

**Files:**
- Create: `src/components/PrintPreviewDialog.jsx`
- Modify: `src/components/PrintableTimelineChart.jsx` (minor theme color update)

- [ ] **Step 1: Create the print preview dialog**

Create `src/components/PrintPreviewDialog.jsx`:

```jsx
import { useState, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEvents, useTranslation } from '@/context/EventContext';
import { getScoreColor, formatScore } from '@/utils/eventUtils';

const PrintableTimelineChart = lazy(() => import('./PrintableTimelineChart'));

export default function PrintPreviewDialog({ open, onOpenChange }) {
  const { events } = useEvents();
  const t = useTranslation();
  const [patientName, setPatientName] = useState('');
  const [therapistName, setTherapistName] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState('');

  const chartData = events.map((event) => ({
    date: event.displayDate,
    satisfaction: event.score,
    description: event.description,
  }));

  const handlePrint = () => {
    // Populate the hidden print container with user-entered values
    const container = document.querySelector('.print-container');
    if (container) {
      const patientEl = container.querySelector('[data-field="patient"]');
      const therapistEl = container.querySelector('[data-field="therapist"]');
      const dateEl = container.querySelector('[data-field="session-date"]');
      const notesEl = container.querySelector('[data-field="notes"]');

      if (patientEl) patientEl.textContent = patientName || '_______________';
      if (therapistEl) therapistEl.textContent = therapistName || '_______________';
      if (dateEl) dateEl.textContent = sessionDate;
      if (notesEl) notesEl.textContent = sessionNotes || '';
    }

    onOpenChange(false);
    // Small delay so dialog closes before print
    setTimeout(() => window.print(), 100);
  };

  const getEmotionalState = (score) => {
    if (score >= 6) return 'Very Happy';
    if (score >= 3) return 'Happy';
    if (score > 0) return 'Slightly Happy';
    if (score === 0) return 'Neutral';
    if (score > -3) return 'Slightly Unhappy';
    if (score > -6) return 'Unhappy';
    return 'Very Unhappy';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.printTimeline}</DialogTitle>
          <DialogDescription>{t.printTimeline}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">{t.patientName}</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="therapistName">{t.therapistName}</Label>
              <Input
                id="therapistName"
                value={therapistName}
                onChange={(e) => setTherapistName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionDate">{t.sessionDate}</Label>
            <Input
              id="sessionDate"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>

          {/* Chart Preview */}
          {events.length > 0 && (
            <div className="border border-border rounded-lg p-3">
              <Suspense fallback={<div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div>}>
                <PrintableTimelineChart
                  data={chartData}
                  lineType="monotone"
                  showLabels={false}
                />
              </Suspense>
            </div>
          )}

          {/* Event Summary Preview */}
          {events.length > 0 && (
            <div className="border border-border rounded-lg p-3 text-sm">
              <h3 className="font-medium mb-2">{t.eventSummary}</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1 pr-2">{t.date}</th>
                    <th className="text-left py-1 pr-2">{t.eventDescription}</th>
                    <th className="text-right py-1">{t.satisfactionLevel}</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-border/50">
                      <td className="py-1 pr-2 text-muted-foreground">{event.displayDate}</td>
                      <td className="py-1 pr-2">{event.description}</td>
                      <td className="py-1 text-right font-medium" style={{ color: getScoreColor(event.score) }}>
                        {formatScore(event.score)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sessionNotes">{t.sessionNotes}</Label>
            <Textarea
              id="sessionNotes"
              rows={4}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button variant="gradient" onClick={handlePrint}>
            {t.print}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Update PrintableTimelineChart with theme colors**

In `src/components/PrintableTimelineChart.jsx`, make two edits:

Edit 1 — change CartesianGrid stroke (line 48):
```
old: stroke="#e5e7eb"
new: stroke="var(--color-border, #e5e7eb)"
```

Edit 2 — change Line stroke (line 106):
```
old: stroke="#ec4899"
new: stroke="var(--color-primary, #c084fc)"
```

- [ ] **Step 3: Update the hidden print container in the main layout**

This will be handled in Task 13 (MainLayout) where we rebuild the print container with `data-field` attributes to support the print dialog's population logic.

- [ ] **Step 4: Commit**

```bash
git add src/components/PrintPreviewDialog.jsx src/components/PrintableTimelineChart.jsx
git commit -m "feat: add PrintPreviewDialog with session fields"
```

---

### Task 13: Create MainLayout and Wire Everything Together

**Files:**
- Create: `src/components/MainLayout.jsx`
- Modify: `src/App.jsx` (rewrite to use EventProvider + MainLayout)

- [ ] **Step 1: Create MainLayout component**

Create `src/components/MainLayout.jsx`:

```jsx
import { useState, lazy, Suspense } from 'react';
import AppHeader from '@/components/AppHeader';
import SatisfactionChart from '@/components/SatisfactionChart';
import VerticalTimeline from '@/components/VerticalTimeline';
import EventTable from '@/components/EventTable';
import EventFormDialog from '@/components/EventFormDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import SettingsDialog from '@/components/SettingsDialog';
import PrintPreviewDialog from '@/components/PrintPreviewDialog';
import { useEvents, useTranslation } from '@/context/EventContext';
import { useEventSync } from '@/hooks/useEventSync';
import { getScoreColor } from '@/utils/eventUtils';

const PrintableTimelineChart = lazy(() => import('./PrintableTimelineChart'));

export default function MainLayout() {
  const { events, deleteEvent } = useEvents();
  const t = useTranslation();
  const { registerTimelineRef, registerTableRowRef } = useEventSync();

  // Dialog state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (event) => {
    setDeletingEvent(event);
  };

  const handleConfirmDelete = (id) => {
    deleteEvent(id);
    setDeletingEvent(null);
  };

  const chartData = events.map((event) => ({
    date: event.displayDate,
    satisfaction: event.score,
    description: event.description,
  }));

  return (
    <>
      {/* Print container - hidden on screen, visible on print */}
      <div className="print-container">
        <div className="print-header">
          <h1>{t.sessionTitle}</h1>
          <div className="print-info">
            <div className="print-info-item">
              <strong>{t.patientName}:</strong> <span data-field="patient">_______________</span>
            </div>
            <div className="print-info-item">
              <strong>{t.sessionDate}:</strong> <span data-field="session-date">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="print-info-item">
              <strong>{t.therapistName}:</strong> <span data-field="therapist">_______________</span>
            </div>
          </div>
          <div className="print-info">
            <div className="print-info-item">
              <strong>{t.periodCovered}:</strong>{' '}
              {events.length > 0
                ? `${events[0].displayDate} to ${events[events.length - 1].displayDate}`
                : 'N/A'}
            </div>
            <div className="print-info-item">
              <strong>{t.totalEvents}:</strong> {events.length}
            </div>
          </div>
        </div>

        {events.length > 0 && (
          <div className="print-chart">
            <Suspense fallback={<div>Loading chart...</div>}>
              <PrintableTimelineChart
                data={chartData}
                lineType="monotone"
                showLabels={true}
              />
            </Suspense>
          </div>
        )}

        <div className="print-summary">
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>{t.eventSummary}</h2>
          <table className="print-events-table">
            <thead>
              <tr>
                <th>{t.date}</th>
                <th>{t.eventDescription}</th>
                <th>{t.satisfactionLevel}</th>
                <th>{t.emotionalState}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.displayDate}</td>
                  <td>{event.description}</td>
                  <td>
                    <span
                      className="satisfaction-badge"
                      style={{
                        backgroundColor: getScoreColor(event.score) + '20',
                        color: getScoreColor(event.score),
                      }}
                    >
                      {event.score > 0 ? '+' : ''}{event.score}
                    </span>
                  </td>
                  <td>
                    {event.score >= 6 ? 'Very Happy' :
                     event.score >= 3 ? 'Happy' :
                     event.score > 0 ? 'Slightly Happy' :
                     event.score === 0 ? 'Neutral' :
                     event.score > -3 ? 'Slightly Unhappy' :
                     event.score > -6 ? 'Unhappy' : 'Very Unhappy'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-notes">
          <h3>{t.sessionNotes}</h3>
          <div data-field="notes"></div>
          <div className="print-notes-lines"></div>
          <div className="print-notes-lines"></div>
          <div className="print-notes-lines"></div>
        </div>
      </div>

      {/* Screen layout */}
      <div className="min-h-screen bg-background no-print">
        <AppHeader onAddEvent={handleAddEvent} onOpenSettings={() => setShowSettings(true)} />

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          {events.length > 0 && <SatisfactionChart />}

          <div className="flex gap-6 flex-col md:flex-row">
            <VerticalTimeline registerTimelineRef={registerTimelineRef} />
            <EventTable
              registerTableRowRef={registerTableRowRef}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        </main>

        {/* Dialogs */}
        <EventFormDialog
          open={showEventForm}
          onOpenChange={setShowEventForm}
          editingEvent={editingEvent}
        />

        <DeleteConfirmDialog
          open={deletingEvent != null}
          onOpenChange={(open) => !open && setDeletingEvent(null)}
          event={deletingEvent}
          onConfirm={handleConfirmDelete}
        />

        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          onOpenPrint={() => setShowPrintPreview(true)}
        />

        <PrintPreviewDialog
          open={showPrintPreview}
          onOpenChange={setShowPrintPreview}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Rewrite App.jsx**

Replace `src/App.jsx` with:

```jsx
import { EventProvider } from '@/context/EventContext';
import MainLayout from '@/components/MainLayout';

function App() {
  return (
    <EventProvider>
      <MainLayout />
    </EventProvider>
  );
}

export default App;
```

- [ ] **Step 3: Verify the app builds and runs**

```bash
cd /Users/hu901131/github.com/relationship-timeline
bun run build
```

Expected: Build succeeds.

- [ ] **Step 4: Manually verify in dev**

```bash
bun run dev
```

Open http://localhost:5173 and verify:
- Header renders with logo, language toggle, settings gear, "+ Add Event" button
- Empty state shows "No events yet" in both timeline and table panels
- Clicking "+ Add Event" opens the form dialog
- Adding an event makes the chart, timeline, and table appear
- Clicking events synchronizes selection across views
- Settings dialog opens with chart style, export/import, JSON view
- Language toggle switches EN/HU
- Print preview dialog works

- [ ] **Step 5: Delete old files that are no longer needed**

```bash
cd /Users/hu901131/github.com/relationship-timeline
rm src/components/RelationshipTimeline.jsx
rm src/components/TimelineChart.jsx
rm src/components/PrintDebugger.jsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/MainLayout.jsx src/App.jsx
git add -u src/components/RelationshipTimeline.jsx src/components/TimelineChart.jsx src/components/PrintDebugger.jsx
git commit -m "feat: wire up MainLayout with all components and EventProvider"
```

---

### Task 14: Update Print CSS

**Files:**
- Modify: `src/styles/print.css`

- [ ] **Step 1: Update print.css with Calm Studio typography**

Replace `src/styles/print.css` with:

```css
/* Hide print container on screen */
@media screen {
  .print-container {
    display: none !important;
  }
}

@media print {
  @page {
    size: landscape;
    margin: 0.5in;
  }

  /* Hide everything except print content */
  body * {
    visibility: hidden;
  }

  .print-container,
  .print-container * {
    visibility: visible;
  }

  .print-container {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .no-print {
    display: none !important;
  }

  .print-header {
    display: block !important;
    visibility: visible !important;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #1e293b;
  }

  .print-header h1 {
    font-size: 22px;
    margin-bottom: 10px;
    color: #1e293b;
    font-weight: 600;
  }

  .print-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .print-info-item {
    font-size: 12px;
    color: #1e293b;
  }

  .print-chart {
    display: block !important;
    visibility: visible !important;
    width: 100%;
    height: 600px;
    page-break-inside: avoid;
  }

  .event-label {
    font-size: 10px;
    background: white;
    padding: 2px 4px;
    border: 1px solid #333;
    border-radius: 6px;
    max-width: 120px;
    text-align: center;
    line-height: 1.2;
  }

  .event-label-positive {
    border-color: #10b981;
    background-color: #f0fdf4;
  }

  .event-label-negative {
    border-color: #ef4444;
    background-color: #fef2f2;
  }

  .event-label-neutral {
    border-color: #6b7280;
    background-color: #f9fafb;
  }

  .print-summary {
    margin-top: 30px;
    page-break-before: always;
  }

  .print-events-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }

  .print-events-table th,
  .print-events-table td {
    padding: 8px;
    border: 1px solid #e2e8f0;
    text-align: left;
  }

  .print-events-table th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #1e293b;
  }

  .satisfaction-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 10px;
  }

  svg {
    color: #000 !important;
  }

  .recharts-text {
    fill: #000 !important;
  }

  .recharts-cartesian-axis-tick-value {
    font-size: 10px !important;
  }

  .print-notes {
    margin-top: 30px;
    padding: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    min-height: 150px;
  }

  .print-notes h3 {
    font-size: 14px;
    margin-bottom: 10px;
    color: #1e293b;
    font-weight: 600;
  }

  .print-notes-lines {
    border-bottom: 1px solid #e2e8f0;
    height: 25px;
    width: 100%;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/print.css
git commit -m "style: update print CSS with Calm Studio typography"
```

---

### Task 15: Rewrite Tests

**Files:**
- Delete: `src/components/RelationshipTimeline.test.jsx`
- Modify: `src/App.test.jsx`
- Create: `src/components/AppHeader.test.jsx`
- Create: `src/components/EventFormDialog.test.jsx`
- Create: `src/components/EventTable.test.jsx`
- Create: `src/components/VerticalTimeline.test.jsx`
- Create: `src/components/SettingsDialog.test.jsx`

- [ ] **Step 1: Delete old monolithic test**

```bash
rm src/components/RelationshipTimeline.test.jsx
```

- [ ] **Step 2: Rewrite App.test.jsx**

Replace `src/App.test.jsx` with:

```jsx
import { describe, test, expect, beforeEach } from 'bun:test';
import { render, fireEvent, waitFor } from '@/test/test-utils';
import App from './App';

describe('App', () => {
  test('renders without crashing', () => {
    const { container } = render(App());
    expect(container).toBeTruthy();
  });

  test('renders the app header with title', () => {
    const { container } = render(App());
    const title = container.querySelector('h1');
    expect(title).toHaveTextContent('Relationship Timeline');
  });

  test('shows empty state when no events exist', () => {
    const { container } = render(App());
    expect(container.textContent).toContain('No events yet');
  });

  test('loads events from localStorage', () => {
    const events = [
      { id: 1, description: 'Test event', score: 5, date: '2024-01-15', displayDate: '2024-01-15', monthOnly: false }
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));

    const { container } = render(App());
    expect(container.textContent).toContain('Test event');
  });

  test('loads language from localStorage', () => {
    localStorage.setItem('appLanguage', 'hu');

    const { container } = render(App());
    expect(container.textContent).toContain('Kapcsolat Idővonal');
  });

  test('toggles language between EN and HU', () => {
    const { container } = render(App());
    const langButton = [...container.querySelectorAll('button')].find(b => b.textContent.includes('HU'));
    expect(langButton).toBeTruthy();

    fireEvent.click(langButton);
    expect(container.textContent).toContain('Kapcsolat Idővonal');
  });
});
```

- [ ] **Step 3: Create AppHeader.test.jsx**

Create `src/components/AppHeader.test.jsx`:

```jsx
import { describe, test, expect, mock } from 'bun:test';
import { render, fireEvent } from '@/test/test-utils';
import AppHeader from './AppHeader';

describe('AppHeader', () => {
  const defaultProps = {
    onAddEvent: mock(() => {}),
    onOpenSettings: mock(() => {}),
  };

  test('renders the app title', () => {
    const { container } = render(<AppHeader {...defaultProps} />);
    expect(container.textContent).toContain('Relationship Timeline');
  });

  test('renders language toggle button', () => {
    const { container } = render(<AppHeader {...defaultProps} />);
    const langButton = [...container.querySelectorAll('button')].find(b => b.textContent.includes('HU'));
    expect(langButton).toBeTruthy();
  });

  test('calls onAddEvent when add button is clicked', () => {
    const onAddEvent = mock(() => {});
    const { container } = render(<AppHeader {...defaultProps} onAddEvent={onAddEvent} />);
    const addButton = [...container.querySelectorAll('button')].find(b => b.textContent.includes('Add Event'));
    fireEvent.click(addButton);
    expect(onAddEvent).toHaveBeenCalled();
  });

  test('calls onOpenSettings when settings button is clicked', () => {
    const onOpenSettings = mock(() => {});
    const { container } = render(<AppHeader {...defaultProps} onOpenSettings={onOpenSettings} />);
    // Settings button is the icon button (no text, just the gear icon)
    const buttons = container.querySelectorAll('button');
    // Find the icon-only button that's not the language or add button
    const settingsButton = [...buttons].find(b =>
      !b.textContent.includes('HU') &&
      !b.textContent.includes('EN') &&
      !b.textContent.includes('Add Event') &&
      !b.textContent.includes('Esemény')
    );
    fireEvent.click(settingsButton);
    expect(onOpenSettings).toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Create EventFormDialog.test.jsx**

Create `src/components/EventFormDialog.test.jsx`:

```jsx
import { describe, test, expect, mock } from 'bun:test';
import { render, fireEvent, waitFor } from '@/test/test-utils';
import EventFormDialog from './EventFormDialog';

describe('EventFormDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: mock(() => {}),
    editingEvent: null,
  };

  test('renders add event form when open', () => {
    const { container } = render(<EventFormDialog {...defaultProps} />);
    expect(container.textContent).toContain('Add Event');
  });

  test('renders edit event form when editing', () => {
    const event = { id: 1, description: 'Test', score: 5, date: '2024-01-15', monthOnly: false };
    const { container } = render(<EventFormDialog {...defaultProps} editingEvent={event} />);
    expect(container.textContent).toContain('Edit Event');
  });

  test('populates form with event data when editing', () => {
    const event = { id: 1, description: 'Test event', score: 5, date: '2024-01-15', monthOnly: false };
    const { container } = render(<EventFormDialog {...defaultProps} editingEvent={event} />);
    const descInput = container.querySelector('#description');
    expect(descInput.value).toBe('Test event');
  });

  test('calls onOpenChange(false) when cancel is clicked', () => {
    const onOpenChange = mock(() => {});
    const { container } = render(<EventFormDialog {...defaultProps} onOpenChange={onOpenChange} />);
    const cancelButton = [...container.querySelectorAll('button')].find(b => b.textContent.includes('Cancel'));
    fireEvent.click(cancelButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 5: Create EventTable.test.jsx**

Create `src/components/EventTable.test.jsx`:

```jsx
import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { render } from '@/test/test-utils';
import EventTable from './EventTable';

describe('EventTable', () => {
  const defaultProps = {
    registerTableRowRef: mock(() => {}),
    onEditEvent: mock(() => {}),
    onDeleteEvent: mock(() => {}),
  };

  test('shows empty state when no events', () => {
    const { container } = render(<EventTable {...defaultProps} />);
    expect(container.textContent).toContain('No events yet');
  });

  test('renders events from context', () => {
    const events = [
      { id: 1, description: 'First event', score: 3, date: '2024-01-15', displayDate: '2024-01-15', monthOnly: false },
      { id: 2, description: 'Second event', score: -2, date: '2024-02-20', displayDate: '2024-02-20', monthOnly: false },
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));

    const { container } = render(<EventTable {...defaultProps} />);
    expect(container.textContent).toContain('First event');
    expect(container.textContent).toContain('Second event');
  });

  test('displays formatted scores with color', () => {
    const events = [
      { id: 1, description: 'Good event', score: 5, date: '2024-01-15', displayDate: '2024-01-15', monthOnly: false },
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));

    const { container } = render(<EventTable {...defaultProps} />);
    expect(container.textContent).toContain('+5');
  });
});
```

- [ ] **Step 6: Create VerticalTimeline.test.jsx**

Create `src/components/VerticalTimeline.test.jsx`:

```jsx
import { describe, test, expect, mock } from 'bun:test';
import { render } from '@/test/test-utils';
import VerticalTimeline from './VerticalTimeline';

describe('VerticalTimeline', () => {
  const defaultProps = {
    registerTimelineRef: mock(() => {}),
  };

  test('shows empty state when no events', () => {
    const { container } = render(<VerticalTimeline {...defaultProps} />);
    expect(container.textContent).toContain('No events yet');
  });

  test('renders events from context', () => {
    const events = [
      { id: 1, description: 'Timeline event', score: 4, date: '2024-03-10', displayDate: '2024-03-10', monthOnly: false },
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));

    const { container } = render(<VerticalTimeline {...defaultProps} />);
    expect(container.textContent).toContain('Timeline event');
    expect(container.textContent).toContain('+4');
  });

  test('renders event dates', () => {
    const events = [
      { id: 1, description: 'Dated event', score: 0, date: '2024-06-01', displayDate: '2024-06-01', monthOnly: false },
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));

    const { container } = render(<VerticalTimeline {...defaultProps} />);
    expect(container.textContent).toContain('2024-06-01');
  });
});
```

- [ ] **Step 7: Create SettingsDialog.test.jsx**

Create `src/components/SettingsDialog.test.jsx`:

```jsx
import { describe, test, expect, mock } from 'bun:test';
import { render, fireEvent } from '@/test/test-utils';
import SettingsDialog from './SettingsDialog';

describe('SettingsDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: mock(() => {}),
    onOpenPrint: mock(() => {}),
  };

  test('renders settings title when open', () => {
    const { container } = render(<SettingsDialog {...defaultProps} />);
    expect(container.textContent).toContain('Settings');
  });

  test('renders chart style options', () => {
    const { container } = render(<SettingsDialog {...defaultProps} />);
    expect(container.textContent).toContain('Curved');
    expect(container.textContent).toContain('Straight');
  });

  test('renders export and import buttons', () => {
    const { container } = render(<SettingsDialog {...defaultProps} />);
    expect(container.textContent).toContain('Export JSON');
    expect(container.textContent).toContain('Import JSON');
  });

  test('renders danger zone with clear button', () => {
    const { container } = render(<SettingsDialog {...defaultProps} />);
    expect(container.textContent).toContain('Clear All Events');
  });

  test('renders print timeline button', () => {
    const { container } = render(<SettingsDialog {...defaultProps} />);
    expect(container.textContent).toContain('Print Timeline');
  });
});
```

- [ ] **Step 8: Run all tests**

```bash
cd /Users/hu901131/github.com/relationship-timeline
bun test
```

Expected: All tests pass. If there are failures, fix them before committing.

- [ ] **Step 9: Commit**

```bash
git add -u src/components/RelationshipTimeline.test.jsx
git add src/App.test.jsx src/components/AppHeader.test.jsx src/components/EventFormDialog.test.jsx src/components/EventTable.test.jsx src/components/VerticalTimeline.test.jsx src/components/SettingsDialog.test.jsx
git commit -m "test: rewrite tests for decomposed component architecture"
```

---

### Task 16: Final Verification

- [ ] **Step 1: Run the full test suite**

```bash
cd /Users/hu901131/github.com/relationship-timeline
bun test
```

Expected: All tests pass.

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

Expected: No lint errors.

- [ ] **Step 3: Run production build**

```bash
bun run build
```

Expected: Build succeeds.

- [ ] **Step 4: Run dev server and manually verify**

```bash
bun run dev
```

Verify in browser at http://localhost:5173:
- App loads with Calm Studio theme (slate background, white cards, purple/rose accents)
- Header: logo, language toggle, settings, add event button
- Adding events: form dialog opens, saves event, chart/timeline/table all update
- Event selection syncs across chart dots, timeline nodes, and table rows
- Edit via table dropdown works
- Delete via table dropdown shows confirmation dialog
- Settings dialog: chart style toggle, export, import, JSON view, clear events
- Language toggle switches EN/HU throughout
- Print preview dialog: editable fields, chart preview, event table preview
- Print output is landscape with therapy session template

- [ ] **Step 5: Fix any issues found during verification, then commit fixes if any**
