# Relationship Timeline App - Development Guide

## Project Overview

This is a React-based web application that allows users to create and visualize a relationship timeline. Users can add events with dates and satisfaction scores (ranging from -8 to +8), visualize them on an interactive chart, and manage their relationship history.

## Current Features

- **Event Management**: Add, edit, and delete relationship events
- **Timeline Visualization**: View events on an interactive line chart
- **Satisfaction Scoring**: Rate events on a scale from -8 to +8
- **Date Precision Options**: Choose between month-only or specific day input
- **Data Persistence**: Save timeline data in browser localStorage
- **Export/Import**: Save and load timeline data as JSON
- **Line Style Options**: Toggle between curved and straight lines
- **Internationalization**: Support for English and Hungarian languages
- **Print Feature**: Print a formatted version of the timeline
- **JSON View**: View and copy the raw JSON data

## Project Structure

The main component is `RelationshipTimeline.js` which contains all the functionality. For better organization, consider:

1. Moving translations to a separate file (`src/translations/index.js`)
2. Breaking the component into smaller pieces:
   - EventForm.js
   - TimelineChart.js
   - EventList.js

## Known Issues

1. **Tailwind CSS Configuration**: The current Tailwind setup is causing PostCSS errors. This needs to be fixed for the styling to work properly.

2. **Component Size**: The RelationshipTimeline component is quite large and could benefit from being broken into smaller, more manageable components.

## Next Development Steps

### 1. Fix Tailwind CSS Configuration

Try one of these approaches:

```bash
# Option 1: Use compatible versions
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9

# Option 2: Use CRACO
npm install -D @craco/craco
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
```

### 2. Reorganize Code

- Split the large component into smaller ones
- Move translations to separate files

### 3. Add New Features

Consider implementing:
- Dark mode
- Data visualization enhancements
- Timeline filtering options
- Timeline categories/tags
- Export to PDF
- Cloud storage integration

## Working with Claude Code

When using Claude Code to help with this project, try these approaches:

### Getting Help with Configuration

```bash
claude-code "Fix the Tailwind CSS configuration in my React app to resolve the PostCSS plugin error"
```

### Breaking Down Components

```bash
claude-code "Split my RelationshipTimeline component into smaller components"
```

### Adding New Features

```bash
claude-code "Implement dark mode for my Relationship Timeline app"
```

### Debugging Issues

```bash
claude-code "Debug why the language toggle isn't working in my React component"
```

## Components for Refactoring

When breaking down the main component, consider these logical separations:

### 1. EventForm Component

Handles:
- Adding new events
- Editing existing events
- Form validation

### 2. TimelineChart Component

Handles:
- Rendering the timeline visualization
- Line style toggle
- Print functionality

### 3. EventList Component

Handles:
- Displaying the list of events
- Delete/Edit actions
- Sorting/filtering

### 4. JSONViewer Component

Handles:
- Displaying JSON data
- Copy to clipboard functionality

### 5. App Component

Coordinates between components and manages shared state.

## Context and State Management

As the app grows, consider implementing:
- React Context for global state
- useReducer for complex state logic
- Custom hooks for reusable logic

## Translations

Move translations to a dedicated structure:

```
src/
  translations/
    index.js      # Exports all translations
    en.js         # English translations
    hu.js         # Hungarian translations
```

## Testing Strategy

Consider adding:
- Unit tests for utility functions
- Component tests for UI elements
- Integration tests for user flows

## Deployment

For GitHub Pages deployment:
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/relationship-timeline",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Deploy: `npm run deploy`

## Project Goals

- Create a polished, user-friendly application
- Ensure code is maintainable and well-organized
- Support multiple languages and cultural contexts
- Make the timeline visually appealing and informative

By following this guide, you should be able to effectively continue development of the Relationship Timeline app with Claude Code's assistance.
