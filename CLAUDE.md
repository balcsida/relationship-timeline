# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun install          # Install dependencies
bun run dev          # Dev server on port 5173 with HMR
bun run build        # Production build to dist/
bun run preview      # Serve production build

# Testing (Bun native test runner)
bun test             # Run all tests
bun test --watch     # Watch mode
bun test --coverage  # With coverage report
bun test src/utils/eventUtils.test.js          # Run a single test file
bun test --test-name-pattern "adds an event"   # Run tests matching pattern

# Linting
bun run lint         # ESLint
```

## Architecture

React 19 SPA using Vite 8 as bundler, Tailwind CSS v4 for styling, Recharts for charting, and Bun as test runner.

### Core component

`src/components/RelationshipTimeline.jsx` (~1,300 lines) is the monolithic main component containing all application state and logic:
- **State**: events array, form state, edit tracking, UI toggles (JSON view, line style, language)
- **Persistence**: localStorage with keys `relationshipEvents` and `appLanguage`
- **i18n**: Inline translation objects for English (`en`) and Hungarian (`hu`)
- **Data model**: Events have `{id, description, score (-8 to +8), date, displayDate, monthOnly}`

### Supporting components

- `TimelineChart.jsx` — Recharts line chart wrapper (lazy-loaded)
- `PrintableTimelineChart.jsx` — Print-optimized chart variant with event labels (lazy-loaded)
- `PrintDebugger.jsx` — Debug overlay for print preview

### Utilities

`src/utils/eventUtils.js` — Pure functions for score colors, formatting, sorting, event creation, JSON export/import, and validation.

### Testing

Uses Bun test runner + Happy DOM + React Testing Library. Test setup in `src/test/setup.bun.js` provides custom matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.) and mocks (`matchMedia`, `ResizeObserver`). Coverage thresholds: 60% across all metrics (configured in `bunfig.toml`).

### Build & code splitting

Vite splits output into chunks via `manualChunks`: `react`, `recharts`, plus lazy-loaded chart components.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages on push to `main`. Uses `PUBLIC_PATH=/relationship-timeline/` env var during build.
