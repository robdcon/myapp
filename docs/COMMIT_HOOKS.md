# Git Commit Hooks Documentation

This project uses **Git hooks** to ensure code quality and consistent commit messages. Hooks are automated scripts that run at specific points in the Git workflow.

## What Are Git Hooks?

Git hooks are scripts that Git executes before or after events such as: commit, push, and receive. They're stored in the `.git/hooks` directory, but we use **Husky** to manage them in a way that can be version-controlled and shared with the team.

## Our Commit Hooks Setup

### 1. Pre-Commit Hook (`.husky/pre-commit`)

**When it runs:** Before you create a commit

**What it does:**

1. **Runs lint-staged** - Only checks files you're committing (not the entire codebase)
   - Runs Prettier to auto-format code consistently on staged files
2. **Runs TypeScript type checking** - Ensures no type errors exist across the entire project

**Why it's helpful:** Catches errors before they get committed, keeps code formatted consistently

```bash
# Example output when it runs:
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
🔍 Running TypeScript type check...
✅ Pre-commit checks passed!
```

### 2. Commit-Msg Hook (`.husky/commit-msg`)

**When it runs:** After you write your commit message but before the commit is created

**What it does:**

- Validates your commit message follows the **Conventional Commits** format
- Ensures messages are clear and follow team standards

**Valid commit message format:**

```
<type>(<optional-scope>): <description>

[optional body]

[optional footer]
```

**Valid types:**

- `feat`: A new feature (e.g., `feat: add board sharing`)
- `fix`: A bug fix (e.g., `fix(auth): resolve login redirect`)
- `docs`: Documentation changes (e.g., `docs: update README`)
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code restructuring without changing behavior
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Other changes (e.g., updating .gitignore)

**Examples:**

```bash
# ✅ Good commit messages
git commit -m "feat: add user authentication"
git commit -m "fix(api): handle null response in GraphQL"
git commit -m "docs: add commit hooks documentation"
git commit -m "refactor: extract validation logic to utils"

# ❌ Bad commit messages (will be rejected)
git commit -m "added stuff"  # Missing type
git commit -m "feat add feature"  # Missing colon
git commit -m "FIX: broken thing"  # Type must be lowercase
git commit -m "feat: Updated the authentication system and fixed bugs and added tests"  # Too long (>100 chars)
```

## How Hooks Work Together

1. You stage files: `git add src/components/Button.tsx`
2. You commit: `git commit -m "feat: add new button component"`
3. **Pre-commit hook runs:**
   - Formats `Button.tsx` with Prettier
   - Runs TypeScript check on entire project
   - If errors found → commit is blocked
4. **Commit-msg hook runs:**
   - Validates "feat: add new button component"
   - Checks format follows conventional commits
   - If invalid → commit is blocked
5. If both pass → Commit succeeds! 🎉

## Bypassing Hooks (When Needed)

Sometimes you need to bypass hooks (use sparingly!):

```bash
# Skip pre-commit hook
git commit --no-verify -m "feat: quick fix"

# Skip both pre-commit and commit-msg hooks
git commit -n -m "wip: work in progress"
```

**When to bypass:**

- Creating a WIP (work in progress) commit on your local branch
- Emergency hotfix where you'll fix issues in next commit
- You've already run checks manually

**When NOT to bypass:**

- Before pushing to shared branches
- When submitting PRs
- If you're unsure why the hook is failing

## Configuration Files

### `.husky/` Directory

Contains the hook scripts that Git executes:

- `pre-commit` - Runs before each commit
- `commit-msg` - Validates commit message format
- `_/` - Husky's internal configuration

### `commitlint.config.js`

Configures the commit message validation rules. You can customize:

- Valid commit types
- Max message length
- Required/optional scope format

### `.eslintrc.json`

Configures ESLint rules for code quality. Current rules:

- TypeScript best practices
- React and React Hooks rules
- Next.js specific rules
- Allows unused vars starting with `_`
- Warns about `console.log` (allows `console.warn/error`)

### `.prettierrc`

Configures code formatting rules:

- Single quotes instead of double quotes
- Semicolons at end of statements
- 2 spaces for indentation
- 100 character line width

### `package.json` - lint-staged configuration

Defines which tools run on which file types:

```json
"lint-staged": {
  "*.{ts,tsx}": ["prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

**Note:** Currently only Prettier runs on staged files. ESLint is not included in lint-staged due to ESLint 9 compatibility considerations, but TypeScript type checking still runs on the entire project during pre-commit.

## Troubleshooting

### Hook doesn't run

```bash
# Reinstall hooks
npm run prepare
# or
npx husky install
```

### TypeScript errors in pre-commit

```bash
# Check which files have errors
npx tsc --noEmit

# Fix the errors before committing
```

### ESLint errors

```bash
# See what's wrong
npx eslint src/

# Auto-fix what can be fixed
npx eslint src/ --fix
```

### Commit message rejected

```bash
# See the error message - it shows what's wrong
# Common issues:
# - Missing type (feat:, fix:, etc.)
# - Type not lowercase
# - Missing colon after type
# - Message too long (>100 chars)

# Redo the commit with correct format
git commit --amend -m "feat: correct message format"
```

## Setting Up for New Team Members

When someone clones the repository:

```bash
git clone <repository-url>
cd myapp
npm install  # This automatically runs 'npm run prepare' which sets up hooks
```

The `prepare` script in `package.json` automatically installs Husky hooks after `npm install`.

## Benefits of Using Hooks

1. **Consistency** - Everyone on the team follows the same code style and commit format
2. **Early error detection** - Catch issues before they reach CI/CD or code review
3. **Better git history** - Clear, searchable commit messages
4. **Automated formatting** - No more debates about tabs vs spaces
5. **Faster CI/CD** - Fewer failed builds since basic checks happen locally

## Learning Resources

- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message specification
- [Husky Documentation](https://typicode.github.io/husky/) - Git hooks made easy
- [lint-staged](https://github.com/okonet/lint-staged) - Run linters on staged files
- [commitlint](https://commitlint.js.org/) - Lint commit messages
- [ESLint](https://eslint.org/) - JavaScript/TypeScript linter
- [Prettier](https://prettier.io/) - Code formatter

## Customizing the Hooks

Want to modify the hooks? Here's how:

### Add/remove ESLint rules

Edit `.eslintrc.json`:

```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "no-console": "off",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Change commit message rules

Edit `commitlint.config.js`:

```javascript
rules: {
  'header-max-length': [2, 'always', 150],  // Allow longer messages
  'type-enum': [2, 'always', ['feat', 'fix', 'custom-type']],  // Add custom types
}
```

### Modify what lint-staged checks

Edit the `lint-staged` section in `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx}": ["prettier --write", "jest --findRelatedTests"],
  "*.css": ["stylelint --fix"]
}
```

**Note:** You can add ESLint back if desired: `["eslint --fix", "prettier --write"]`

````

### Add a new hook

Create a new file in `.husky/`:

```bash
npx husky add .husky/pre-push "npm test"
````

This creates a `pre-push` hook that runs tests before pushing to remote.
