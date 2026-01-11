# GitHub Actions Workflows Documentation

This document explains how GitHub Actions workflows work and how to create, customize, and troubleshoot them.

## Table of Contents

- [What is GitHub Actions?](#what-is-github-actions)
- [Key Concepts](#key-concepts)
- [Workflow Anatomy](#workflow-anatomy)
- [Our Workflows](#our-workflows)
- [Common Triggers](#common-triggers)
- [GitHub Context Variables](#github-context-variables)
- [Secrets and Permissions](#secrets-and-permissions)
- [Testing Workflows](#testing-workflows)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Resources](#resources)

---

## What is GitHub Actions?

**GitHub Actions** is GitHub's built-in automation platform that lets you:

- ✅ Automate your software development workflows (CI/CD)
- ✅ Run tasks when events happen (PRs, pushes, releases, etc.)
- ✅ Build, test, and deploy code automatically
- ✅ Automate repetitive tasks (code reviews, labeling, notifications)

**Key Benefits:**

- Free for public repos
- 2,000 minutes/month free for private repos
- Integrated directly into GitHub
- Large marketplace of pre-built actions
- Uses familiar YAML syntax

---

## Key Concepts

### 1. Workflow

An automated process defined in a YAML file stored in `.github/workflows/`.

```yaml
name: My Workflow
on: [push]
jobs:
  my-job:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello World"
```

### 2. Event (Trigger)

What causes the workflow to run:

- `push` - Code is pushed to the repo
- `pull_request` - PR is opened, updated, or closed
- `schedule` - Runs on a cron schedule
- `workflow_dispatch` - Manual trigger from GitHub UI
- Many more...

### 3. Job

A set of steps that execute on the same runner. Jobs run **in parallel** by default.

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps: [...]

  job2:
    runs-on: ubuntu-latest
    needs: job1 # This makes job2 wait for job1
    steps: [...]
```

### 4. Step

An individual task within a job. Steps run **sequentially**.

```yaml
steps:
  - name: Step 1
    run: echo "First"
  - name: Step 2
    run: echo "Second"
```

### 5. Runner

The machine (virtual server) that executes your workflow. GitHub provides:

- `ubuntu-latest` (most common)
- `windows-latest`
- `macos-latest`

### 6. Action

Reusable units of code. Can use actions from:

- GitHub Marketplace: `actions/checkout@v4`
- Your own repo: `./.github/actions/my-action`
- Another repo: `username/repo@v1`

---

## Workflow Anatomy

Let's break down our Copilot review workflow:

```yaml
# Name appears in GitHub Actions UI
name: Auto Request Copilot Review

# WHEN to run
on:
  pull_request: # On PR events
    types:
      - opened # When PR is created
      - reopened # When PR is reopened
      - synchronize # When commits are pushed

# WHAT the workflow can do
permissions:
  contents: read
  pull-requests: write

# WHAT to run
jobs:
  request-copilot-review:
    name: Request Copilot Review
    runs-on: ubuntu-latest

    steps:
      # Use a pre-built action
      - name: Checkout code
        uses: actions/checkout@v4

      # Run a command
      - name: Request Review
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr review ${{ github.event.pull_request.number }} \
            --copilot
```

### Step-by-Step Execution:

1. **Event occurs** - A PR is opened
2. **GitHub triggers workflow** - Finds `.github/workflows/auto-copilot-review.yml`
3. **Spins up runner** - Creates Ubuntu virtual machine
4. **Runs job** - Executes `request-copilot-review` job
5. **Executes steps** - Runs each step sequentially:
   - Checks out code
   - Runs GitHub CLI command to request review
   - Adds comment to PR
6. **Cleans up** - Destroys virtual machine

---

## Our Workflows

### 1. Auto Request Copilot Review (`.github/workflows/auto-copilot-review.yml`)

**Purpose:** Automatically request GitHub Copilot to review every PR

**Triggers:**

- When a PR is opened
- When a PR is reopened
- When new commits are pushed to a PR

**What it does:**

1. Checks out the repository code
2. Uses GitHub CLI to request Copilot review
3. Adds a comment to the PR notifying about the review

**When you'll see it:**

- Open any PR → Copilot review is automatically requested
- Push to an existing PR → Copilot re-reviews the changes

---

## Common Triggers

### Pull Request Events

```yaml
on:
  pull_request:
    types:
      - opened # PR is created
      - closed # PR is closed
      - reopened # PR is reopened
      - synchronize # New commits pushed
      - labeled # Label is added
      - ready_for_review # Draft → Ready
```

### Push Events

```yaml
on:
  push:
    branches:
      - main # Only on main branch
      - 'releases/**' # Any release branch
    paths:
      - 'src/**' # Only when src/ changes
```

### Manual Trigger

```yaml
on:
  workflow_dispatch: # Adds "Run workflow" button in UI
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
```

### Scheduled (Cron)

```yaml
on:
  schedule:
    - cron: '0 0 * * *' # Every day at midnight UTC
    - cron: '0 9 * * 1' # Every Monday at 9am UTC
```

### Multiple Triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
```

---

## GitHub Context Variables

GitHub provides context about the workflow run through variables:

### Common Variables

| Variable                                  | Description        | Example           |
| ----------------------------------------- | ------------------ | ----------------- |
| `${{ github.repository }}`                | Owner/repo name    | `robdcon/myapp`   |
| `${{ github.event.pull_request.number }}` | PR number          | `5`               |
| `${{ github.actor }}`                     | User who triggered | `robdcon`         |
| `${{ github.ref }}`                       | Branch/tag ref     | `refs/heads/main` |
| `${{ github.sha }}`                       | Commit SHA         | `abc123...`       |
| `${{ github.event_name }}`                | Event type         | `pull_request`    |

### Using Context in Steps

```yaml
steps:
  - name: Print context
    run: |
      echo "Repository: ${{ github.repository }}"
      echo "Actor: ${{ github.actor }}"
      echo "Branch: ${{ github.ref }}"
      echo "PR: ${{ github.event.pull_request.number }}"
```

### Conditional Steps

```yaml
steps:
  - name: Only on main branch
    if: github.ref == 'refs/heads/main'
    run: echo "This is main!"

  - name: Only on PR
    if: github.event_name == 'pull_request'
    run: echo "This is a PR!"
```

---

## Secrets and Permissions

### Built-in Secrets

GitHub automatically provides:

- `${{ secrets.GITHUB_TOKEN }}` - Temporary token for the workflow
  - Expires when workflow completes
  - Has permissions based on `permissions:` section
  - No setup required!

### Custom Secrets

Store sensitive data in Settings → Secrets and variables → Actions:

```yaml
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.MY_API_KEY }}
      DATABASE_URL: ${{ secrets.DB_URL }}
    run: ./deploy.sh
```

### Permissions

Control what `GITHUB_TOKEN` can do:

```yaml
permissions:
  contents: read # Read repo
  pull-requests: write # Comment on PRs
  issues: write # Create/edit issues
  packages: write # Publish packages
```

**Best practice:** Only grant the minimum permissions needed!

---

## Testing Workflows

### Method 1: Create a Test PR

1. Make a small change on a branch
2. Open a PR
3. Check the "Actions" tab in GitHub
4. Click on your workflow run to see logs

### Method 2: Manual Trigger (workflow_dispatch)

Add to your workflow:

```yaml
on:
  workflow_dispatch:
  pull_request:
    types: [opened]
```

Then in GitHub UI:

1. Go to "Actions" tab
2. Select your workflow
3. Click "Run workflow"

### Method 3: Test Locally with `act`

```bash
# Install act (local GitHub Actions runner)
npm install -g act

# Run workflow locally
act pull_request
```

---

## Troubleshooting

### Workflow Not Running?

**Check:**

1. ✅ File is in `.github/workflows/` directory
2. ✅ File has `.yml` or `.yaml` extension
3. ✅ YAML syntax is valid (use a YAML validator)
4. ✅ Trigger event matches what you're doing
5. ✅ Permissions are correct

### View Workflow Logs

1. Go to GitHub repo
2. Click "Actions" tab
3. Click on the workflow run
4. Click on the job name
5. Click on each step to see logs

### Common Errors

#### Permission Denied

```yaml
# Add necessary permissions
permissions:
  pull-requests: write
```

#### Command Not Found

```yaml
# Install the tool first
- name: Install tool
  run: npm install -g some-tool

- name: Use tool
  run: some-tool command
```

#### Syntax Error

```yaml
# Bad (missing quotes)
- name: Print
  run: echo ${{ github.actor }}

# Good (quoted)
- name: Print
  run: echo "${{ github.actor }}"
```

---

## Best Practices

### 1. Use Specific Action Versions

```yaml
# ❌ Bad - can break if action updates
- uses: actions/checkout@latest

# ✅ Good - pinned to specific version
- uses: actions/checkout@v4
```

### 2. Cache Dependencies

```yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

### 3. Minimize Permissions

```yaml
# Only grant what you need
permissions:
  contents: read
  pull-requests: write
```

### 4. Use Concurrency Control

```yaml
# Cancel old workflow runs when new commits pushed
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 5. Add Helpful Names and Comments

```yaml
- name: 🧪 Run tests # Emoji helps scan logs
  run: npm test

# Explain complex steps
- name: Deploy to staging
  # This deploys only if tests pass and it's a PR to main
  if: success() && github.event.pull_request.base.ref == 'main'
  run: ./deploy.sh staging
```

### 6. Handle Errors Gracefully

```yaml
- name: Try to deploy
  continue-on-error: true # Don't fail workflow if this fails
  run: ./deploy.sh

- name: Notify on failure
  if: failure() # Only runs if previous steps failed
  run: echo "Deployment failed!"
```

---

## Common Workflow Examples

### Run Tests on PR

```yaml
name: Run Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

### Deploy on Main Push

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: ./deploy.sh
```

### Auto-Label PRs

```yaml
name: Label PRs
on:
  pull_request:
    types: [opened]
jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/labeler@v5
```

---

## Customizing Our Workflows

### Add More Triggers to Copilot Review

```yaml
on:
  pull_request:
    types:
      - opened
      - reopened
      - synchronize
      - ready_for_review # Also when draft → ready
```

### Run Only on Specific Branches

```yaml
on:
  pull_request:
    branches:
      - main
      - develop
```

### Skip Workflows

Add to commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

Or in workflow:

```yaml
on:
  push:
    paths-ignore:
      - '**.md' # Skip if only markdown files changed
      - 'docs/**' # Skip if only docs changed
```

---

## Resources

### Official Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Context and expressions](https://docs.github.com/en/actions/learn-github-actions/contexts)

### GitHub Actions Marketplace

- [Browse Actions](https://github.com/marketplace?type=actions)
- Popular actions:
  - [actions/checkout](https://github.com/actions/checkout) - Check out code
  - [actions/setup-node](https://github.com/actions/setup-node) - Setup Node.js
  - [actions/cache](https://github.com/actions/cache) - Cache dependencies

### Learning Resources

- [GitHub Actions Learning Lab](https://lab.github.com/)
- [Awesome Actions](https://github.com/sdras/awesome-actions) - Curated list
- [Act](https://github.com/nektos/act) - Run Actions locally

### YAML Tools

- [YAML Validator](https://www.yamllint.com/)
- [GitHub Actions VS Code Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions)

---

## Next Steps

1. **Monitor your workflows** - Check the Actions tab regularly
2. **Add more workflows** - Tests, linting, deployments
3. **Optimize for speed** - Use caching, matrix builds
4. **Share learnings** - Document custom workflows for the team

Happy automating! 🚀
