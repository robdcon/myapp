# Technology Stack

## Core Sections (Required)

### 1) Runtime Summary

| Area                | Value                          | Evidence                                |
| ------------------- | ------------------------------ | --------------------------------------- |
| Primary language    | TypeScript 5                   | `tsconfig.json`, `package.json` devDeps |
| Runtime + version   | Node.js (LTS, no `.nvmrc`)     | `package.json` `@types/node ^20`        |
| Package manager     | npm                            | `package-lock.json`                     |
| Module/build system | Next.js 15.5.12 with Turbopack | `package.json` `scripts.build`          |

### 2) Production Frameworks and Dependencies

| Dependency                        | Version   | Role in system                                    | Evidence                              |
| --------------------------------- | --------- | ------------------------------------------------- | ------------------------------------- |
| next                              | 15.5.12   | Full-stack React framework (App Router)           | `package.json`                        |
| react / react-dom                 | 19.1.0    | UI rendering                                      | `package.json`                        |
| @apollo/server                    | ^5.0.0    | GraphQL server (API layer)                        | `package.json`                        |
| @apollo/client                    | ^4.0.7    | GraphQL client (React data fetching)              | `package.json`                        |
| @as-integrations/next             | ^4.0.0    | Apollo Server ↔ Next.js Route Handler bridge      | `app/api/graphql/route.ts`            |
| @apollo/client-integration-nextjs | ^0.13.2   | SSR-compatible Apollo Client setup                | `package.json`                        |
| @auth0/nextjs-auth0               | ^4.10.0   | Session-based authentication                      | `middleware.ts`, `graphql/context.ts` |
| pg                                | ^8.16.3   | Direct PostgreSQL driver (no ORM)                 | `src/shared/lib/db/db.ts`             |
| @chakra-ui/react                  | ^3.28.0   | UI component library (v3)                         | `package.json`                        |
| @chakra-ui/next-js                | ^2.4.2    | Chakra ↔ Next.js integration                      | `package.json`                        |
| @emotion/react / styled           | ^11.x     | CSS-in-JS (Chakra peer dependency)                | `package.json`                        |
| framer-motion                     | ^12.23.24 | UI animations                                     | `package.json`                        |
| googleapis                        | ^170.1.0  | Google Calendar API integration                   | `package.json`                        |
| @ericblade/quagga2                | ^1.12.1   | Barcode scanning (camera-based)                   | `package.json`                        |
| graphql                           | ^16.11.0  | GraphQL runtime                                   | `package.json`                        |
| dotenv                            | ^17.2.3   | Environment variable loading (scripts/migrations) | `package.json`                        |
| rxjs                              | ^7.8.2    | Reactive utilities (required by Apollo Client)    | `package.json`                        |
| react-icons                       | ^5.5.0    | Icon library                                      | `package.json`                        |
| next-themes                       | ^0.4.6    | Light/dark theme support                          | `package.json`                        |

### 3) Development Toolchain

| Tool                 | Purpose                                             | Evidence                     |
| -------------------- | --------------------------------------------------- | ---------------------------- |
| TypeScript 5         | Type checking (strict mode)                         | `tsconfig.json`              |
| ESLint 9             | Linting (extends `next/core-web-vitals`)            | `.eslintrc.json`             |
| Prettier 3.7         | Code formatting                                     | `.prettierrc`                |
| Husky 9              | Git hooks                                           | `.husky/`                    |
| lint-staged          | Run Prettier on staged files pre-commit             | `package.json` `lint-staged` |
| commitlint           | Enforce Conventional Commits format                 | `commitlint.config.js`       |
| tsx 4                | Run TypeScript scripts directly (no compile step)   | `package.json` scripts       |
| @graphql-codegen/cli | Generate TypeScript types from GraphQL schema       | `codegen.ts`                 |
| Renovate             | Automated dependency update PRs                     | `renovate.json`              |
| Tailwind CSS 4       | Utility CSS (PostCSS plugin, used alongside Chakra) | `postcss.config.mjs`         |

### 4) Key Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server on port 3000
npm run build            # Production build (Turbopack)
npm run start            # Start production server
npm run codegen          # Regenerate GraphQL TypeScript types
npm run seed             # Seed database (tsx scripts/seed.ts)
tsx database/migrations/run-migration.ts  # Run DB migrations
```

### 5) Environment and Config

- Config sources: `.env` (local), `.env.example` (template)
- Required env vars:
  - `AUTH0_SECRET` — Auth0 session secret
  - `AUTH0_BASE_URL` — App base URL
  - `AUTH0_ISSUER_BASE_URL` — Auth0 tenant domain
  - `AUTH0_CLIENT_ID` — Auth0 application client ID
  - `AUTH0_CLIENT_SECRET` — Auth0 application client secret
  - `AUTH0_WEBHOOK_SECRET` — User registration webhook validation
  - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` — PostgreSQL connection
  - `ENABLE_TEST_MODE` — Set to `true` to enable dev-only test header bypass
- Deployment: Vercel (`npm run deploy-develop` posts to Vercel webhook)

### 6) Evidence

- `package.json` — all production and dev dependencies
- `tsconfig.json` — TypeScript compiler config
- `.env.example` — required environment variables
- `postcss.config.mjs` — Tailwind CSS setup
- `.prettierrc` — formatter config
- `.eslintrc.json` — linter config
