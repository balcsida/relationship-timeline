# Test Documentation for Relationship Timeline

## Overview

This application includes a comprehensive test suite with **56 automated tests** across **19 test suites** covering all major functionality, now fully migrated to **Bun's native test runner** for optimal performance and compatibility.

## Test Coverage Areas

### 1. Component Tests (`src/components/RelationshipTimeline.test.jsx`)
- **29 tests** covering the main component functionality

#### Rendering Tests
- Main title rendering
- Form elements display
- Empty state handling
- Score guide visibility

#### Event Management
- Adding new events
- Form clearing after submission
- Event sorting by date
- Month-only date handling

#### Editing Functionality
- Edit mode activation
- Form population with existing data
- Update operations
- Cancel operations

#### Deletion
- Delete confirmation flow
- Delete cancellation

#### Internationalization
- Language toggle (English/Hungarian)
- Language persistence in localStorage

#### Data Persistence
- Saving to localStorage
- Loading from localStorage on mount

#### Import/Export
- Export button functionality
- File download triggering
- Data import from JSON files
- Error handling for invalid files

#### Visualization
- Timeline display
- Line style toggling
- Score formatting and display

### 2. Utility Function Tests (`src/utils/eventUtils.test.js`)
- **25 tests** for pure utility functions

#### Score Color Mapping
- Color assignment based on score ranges
- Boundary condition handling

#### Score Formatting
- Positive score prefix (+)
- Negative score display
- Zero handling

#### Event Sorting
- Chronological ordering
- Same-date handling
- Array immutability

#### Event Creation
- ID generation for new events
- ID preservation for edits
- Date formatting

#### Export Functionality
- Data URI creation
- Filename generation
- JSON encoding

#### Import Validation
- Data structure validation
- Required field checking
- Score range validation
- Type checking

### 3. Integration Tests (`src/App.test.jsx`)
- **2 tests** for app-level integration
- Component mounting
- Crash prevention

## Running Tests

### Test Commands
```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/utils/eventUtils.test.js

# Analyze test structure
bun run test:analyze
```

### Package.json Scripts
```bash
# Using npm scripts
bun run test         # Run all tests
bun run test:watch   # Watch mode
bun run test:coverage # With coverage report
bun run test:analyze # Test structure analysis
```

## Test Technologies

- **Bun Test Runner**: Native Bun testing for optimal performance
- **React Testing Library**: For testing React components
- **@testing-library/user-event**: For simulating user interactions
- **Happy DOM**: Fast and lightweight DOM implementation for testing
- **Custom DOM Matchers**: Built-in matchers for DOM assertions

## Test Structure

```
src/
├── components/
│   └── RelationshipTimeline.test.jsx (29 tests)
├── utils/
│   ├── eventUtils.js (utility functions)
│   └── eventUtils.test.js (25 tests)
├── test/
│   ├── setup.bun.js (Bun test configuration)
│   ├── test-utils.js (Testing utilities)
│   └── testRunner.js (test analysis tool)
└── App.test.jsx (2 tests)
```

## Key Testing Patterns

### 1. User-Centric Testing
Tests focus on user behavior rather than implementation details:
```javascript
await user.type(descriptionInput, 'First date');
await user.click(addButton);
expect(screen.getByText('First date')).toBeInTheDocument();
```

### 2. Comprehensive Coverage
Each feature is tested from multiple angles:
- Happy path scenarios
- Edge cases
- Error conditions
- User cancellations

### 3. Isolation
Tests are isolated with proper setup and teardown:
```javascript
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
```

### 4. Accessibility
Tests use accessible queries:
```javascript
screen.getByRole('button', { name: /Add Event/i })
screen.getByLabelText(/Event Description/i)
```

## Mock Setup

The test setup includes mocks for:
- `window.matchMedia` - For responsive design testing
- `ResizeObserver` - For chart components
- `localStorage` - Cleared between tests
- `window.confirm` - For deletion confirmations
- `navigator.clipboard` - For copy functionality

## Coverage Goals

The test suite aims for:
- ✅ 100% of user-facing features
- ✅ All happy path scenarios
- ✅ Common error conditions
- ✅ Edge cases and boundaries
- ✅ Data persistence flows
- ✅ Internationalization

## Bun Native Testing

### Migration Complete
The test suite has been fully migrated to Bun's native test runner, providing:
- ✅ Fast test execution
- ✅ Built-in coverage reporting
- ✅ No dependency on Node.js
- ✅ Seamless integration with Bun ecosystem
- ✅ Happy DOM for fast DOM testing

### Visual Testing
The current suite doesn't include:
- Screenshot testing
- Visual regression testing
- Cross-browser testing

These could be added with tools like Playwright or Cypress.

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add integration tests for complex flows
4. Update this documentation

## Test Quality Metrics

- **Total Tests**: 56
- **Test Suites**: 19
- **Test Files**: 3
- **Assertions**: 100+ individual assertions
- **User Flows Covered**: 15+ complete user journeys

The test suite ensures the application is robust, reliable, and maintains quality as it evolves.