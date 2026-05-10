# Prompt: Refactor Existing Codebase to Feature-Sliced Design

## Context

I have an existing Next.js (App Router) + React + TypeScript codebase that needs to be refactored to follow Feature-Sliced Design (FSD) architecture. The app is a Progressive Web App (PWA) using Auth0 for authentication and Context API for state management.

## Current Application Features

- Board management (create, read, update, delete boards)
- Item management for boards (add, update, delete items on boards)
- First implementation: Checklist board (shopping list)
- Items always belong to at least one board
- Connected to PostgreSQL database

## Target FSD Structure

```
src/
├── app/                    # Initialization, providers, routing
├── pages/                  # Page compositions
├── widgets/                # Composite UI blocks
├── features/               # User actions/interactions
├── entities/               # Business models & data layer
└── shared/                 # Reusable infrastructure
```

## FSD Architecture Decisions

1. **Entities**: `board` and `item` are separate entities with their own API calls
2. **API Distribution**: API calls live within each entity folder (not centralized)
3. **Features**: Each user action is a separate feature (create-board, add-item, etc.)
4. **Strict FSD**: Follow strict layer hierarchy with no upward imports
5. **Public API**: Each slice exports through index.ts files

## Your Task

Please analyze my existing codebase and provide a detailed refactoring plan that includes:

### 1. Code Inventory

List all existing files/folders and categorize them by their FSD layer:

- Which files belong in `entities/`?
- Which files belong in `features/`?
- Which files belong in `widgets/`?
- Which files belong in `pages/`?
- Which files belong in `shared/`?
- Which files belong in `app/`?

### 2. File-by-File Migration Map

Create a migration table with:
| Current Path | New FSD Path | Required Changes | Dependencies |
|--------------|--------------|------------------|--------------|
| (old path) | (new path) | (what to modify) | (imports) |

### 3. Refactoring Steps

Provide a step-by-step plan in priority order:

1. **Step X**: Move/refactor [files] to [location]
   - Changes needed: [details]
   - New imports: [details]
   - Potential issues: [warnings]

### 4. Code Transformations

For each major transformation, provide:

- **Before**: Current code structure
- **After**: Refactored code following FSD
- **Explanation**: Why this change improves architecture

Focus on these transformations:

- Extracting API calls into `entities/*/api/`
- Creating Context providers in `entities/*/model/`
- Splitting components into features
- Creating proper index.ts public APIs
- Fixing import paths to follow FSD hierarchy

### 5. Breaking Changes & Risks

Identify:

- Import path changes that will break existing code
- State management migrations needed
- Potential runtime errors
- Testing impact

### 6. Validation Checklist

After refactoring, verify:

- [ ] No upward imports (lower layers don't import higher layers)
- [ ] All slices export through index.ts
- [ ] API calls are in entity folders
- [ ] Features are isolated and reusable
- [ ] TypeScript compiles without errors
- [ ] No circular dependencies

## My Current Codebase

[PASTE YOUR CURRENT FOLDER STRUCTURE AND KEY FILES HERE]

Example:

```
src/
├── components/
│   ├── BoardList.tsx
│   ├── CreateBoardForm.tsx
│   └── ChecklistItem.tsx
├── pages/
│   ├── boards.tsx
│   └── board/[id].tsx
├── lib/
│   └── api.ts
└── contexts/
    └── BoardContext.tsx
```

## Additional Context

- Database: PostgreSQL
- Auth: Auth0
- State Management: React Context API
- Currently working features: [list them]
- Known issues: [if any]

## Output Format

Please provide:

1. A clear, actionable refactoring plan
2. Code examples for critical transformations
3. A recommended order of operations (what to refactor first)
4. Estimated complexity/risk for each step (Low/Medium/High)

Begin the analysis and provide the refactoring plan.
