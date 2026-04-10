# Relationship Timeline: shadcn/ui Redesign

Full visual overhaul and UX rethink of the Relationship Timeline application using shadcn/ui components, the "Calm Studio" design direction, and a timeline-first layout with synchronized interactions.

## Design Direction: Calm Studio

Modern wellness-app aesthetic with a muted sage/lavender/rose palette. Generous whitespace, soft borders, smooth transitions. Professional but gentle — like a meditation or therapy app.

## Layout

- **Header**: App logo (purple-to-rose gradient icon), title, language toggle (always visible), settings gear icon, "+ Add Event" primary button
- **Chart area**: Full-width card below header. Recharts line chart with interactive color-coded dots. Line style toggle (curved/straight) in the card header.
- **Split view below chart**:
  - **Left: Vertical Timeline** — scrollable panel with a gradient spine (purple → rose). Events shown as color-coded circular nodes with date, description, and score.
  - **Right: Event Table** — scrollable shadcn/ui Table with columns: date, event description, score (color-coded), and a "..." row actions dropdown (Edit, Delete).
- **Synchronized selection**: clicking a chart dot, timeline node, or table row highlights and scrolls the corresponding items in all three views. Clicking again deselects.

## Component Architecture

### Page Shell
- `App.jsx` — top-level state owner, wraps children in `EventContext.Provider`
- `AppHeader.jsx` — logo, language toggle, settings gear, "+ Add Event" button
- `MainLayout.jsx` — orchestrates chart, timeline, and table sections

### Feature Components
- `SatisfactionChart.jsx` — Recharts line chart with interactive dots, emits selected event ID on click
- `VerticalTimeline.jsx` — scrollable vertical timeline with gradient spine, color-coded nodes, highlights and scrolls to selected event
- `EventTable.jsx` — shadcn/ui Table with date, description, score columns, row actions DropdownMenu (Edit/Delete)
- `EventFormDialog.jsx` — shadcn/ui Dialog for add/edit events
- `SettingsDialog.jsx` — shadcn/ui Dialog for import/export, JSON view, line style, print access
- `PrintPreviewDialog.jsx` — shadcn/ui Dialog with editable therapy session fields and print trigger
- `PrintableTimelineChart.jsx` — print-optimized chart variant (kept largely as-is)

### Shared
- `EventContext.jsx` — React context providing events, selectedEventId, and dispatch actions
- `useEventSync.jsx` — custom hook for synchronized scrolling/highlighting across views
- `src/utils/eventUtils.js` — kept as-is (pure utility functions)

### shadcn/ui Components to Install
Button, Dialog, AlertDialog, Input, Label, Table, DropdownMenu, Checkbox, Separator, Badge, Tooltip, ScrollArea, Textarea

## State Management

State lives in `App.jsx`, distributed via `EventContext`:

```
events[]              — event array, persisted to localStorage ("relationshipEvents")
language              — 'en' | 'hu', persisted to localStorage ("appLanguage")
selectedEventId       — currently highlighted event (null | number)
lineType              — 'monotone' | 'linear'
```

Actions provided through context:
- `addEvent(event)`, `updateEvent(id, event)`, `deleteEvent(id)`
- `setSelectedEventId(id)` — toggles off if same ID clicked again
- `setLanguage(lang)`, `setLineType(type)`
- `importEvents(events[])`, `clearEvents()`

No external state libraries — plain React context + useState is sufficient.

### Synchronized Selection Flow
1. User clicks a chart dot / timeline node / table row
2. Component calls `setSelectedEventId(id)` via context
3. All three views react:
   - Chart: larger dot radius + glow effect
   - Timeline: highlight styling + `scrollIntoView({ behavior: 'smooth' })`
   - Table: highlight row background + scroll via ScrollArea ref
4. Clicking the same event again deselects (sets to null)

## Styling & Theme

### Color Tokens (CSS custom properties for shadcn/ui)

| Token | Value | Usage |
|---|---|---|
| `--background` | `#f8fafc` (slate-50) | Page background |
| `--card` | `#ffffff` | Card/panel backgrounds |
| `--primary` | `#c084fc` (purple-400) | Chart line, primary actions |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--accent` | `#fda4af` (rose-300) | Secondary accent, gradient pair |
| `--muted` | `#f1f5f9` (slate-100) | Muted backgrounds, hover states |
| `--muted-foreground` | `#64748b` (slate-500) | Secondary text |
| `--border` | `#e2e8f0` (slate-200) | Card borders, dividers |

### Score Colors (unchanged)
- `> +4`: `#10b981` (green)
- `> 0`: `#84cc16` (lime)
- `= 0`: `#6b7280` (gray)
- `> -4`: `#f59e0b` (amber)
- `<= -4`: `#ef4444` (red)

### Visual Details
- Cards: `rounded-xl border shadow-sm`
- Timeline spine: `linear-gradient(to bottom, var(--primary), var(--accent))`
- Timeline nodes: filled circles colored by score, white ring, subtle shadow
- Selected state: soft purple/lavender background tint + ring
- Transitions: `transition-all duration-200` on interactive elements
- Typography: system font stack (shadcn/ui default), warm gray text `#1e293b`
- No dark mode

## Dialogs

### Add/Edit Event Dialog
- Title: "Add Event" or "Edit Event"
- Fields stacked vertically:
  - Description — Input with Label, placeholder "What happened?"
  - Score — Input type=number, min=-8, max=8, Label "Satisfaction (-8 to +8)"
  - Date — Input type=date or type=month depending on checkbox
  - Month only — Checkbox with label "Only record the month"
- Footer: "Cancel" (outline) and "Save" / "Update" (primary gradient)
- Opens from: "+ Add Event" button or "Edit" in table row dropdown

### Settings Dialog
- Title: "Settings"
- Sections separated by Separator:
  - Chart style: two-option toggle "Curved" / "Straight"
  - Data: "Export JSON" button, "Import JSON" button (file picker), "View JSON" toggle
  - JSON view: when on, ScrollArea with formatted JSON and "Copy" button
  - Danger zone: "Clear all events" with confirmation

### Print Preview Dialog
- Title: "Print Timeline"
- Editable fields: patient name, therapist name, session date, session notes (Textarea)
- Miniature chart preview and event summary table
- Footer: "Cancel" and "Print" (triggers window.print() with print CSS)

### Delete Confirmation
- shadcn AlertDialog: "Are you sure?" with event description, "Cancel" and "Delete" (red)

## Print Functionality

- Accessed via Settings Dialog → "Print Timeline" button
- PrintPreviewDialog opens with editable therapy session fields
- On print: values written into hidden `.print-container` → `window.print()`
- Print layout: landscape, header with session info, PrintableTimelineChart with labels, event summary table, session notes, page footer
- PrintableTimelineChart stays as separate lazy-loaded component
- Print CSS updated to match Calm Studio typography and spacing

## Internationalization

Same inline translation approach (English and Hungarian). Translation objects extracted from the monolithic component into `src/i18n/translations.js` as a named export `{ translations }`. Language state lives in `EventContext` and a `useTranslation()` hook returns the active translation object (`translations[language]`). Components import and call the hook to get localized strings.

## Testing

### New Test Files (per component)
- `AppHeader.test.jsx` — language toggle, settings button, add event button
- `EventFormDialog.test.jsx` — add/edit events, validation, cancel
- `EventTable.test.jsx` — rendering, row actions, selection highlighting
- `VerticalTimeline.test.jsx` — rendering, selection, scroll behavior
- `SettingsDialog.test.jsx` — import/export, line style, JSON view
- `PrintPreviewDialog.test.jsx` — field editing, print trigger
- `App.test.jsx` — integration: localStorage persistence, language, end-to-end flows

### Unchanged
- `eventUtils.test.js` — pure functions, no changes needed
- `src/test/setup.bun.js` — same test setup
- Coverage thresholds: 60% across all metrics

### No new test dependencies
React Testing Library + fireEvent + waitFor covers all interactions including dialogs and scroll assertions.

## Scope Boundaries

- Single timeline only (multiple timelines out of scope, can be added later)
- No dark mode
- No new external state management libraries
- No new charting library — Recharts stays
- Data model unchanged: `{id, description, score, date, displayDate, monthOnly}`
- localStorage persistence unchanged
