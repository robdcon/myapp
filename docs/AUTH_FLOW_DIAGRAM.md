# Authentication Flow

```mermaid
flowchart TD
    A["User opens app or protected page"] --> B{"Is there an Auth0 session?"}
    B -->|No| C["Redirect to /api/auth/login"]
    B -->|Yes| D["auth0.getSession returns session.user"]

    D --> E["GraphQL request creates context"]
    E --> F["createContext in graphql/context.ts"]
    F --> G{"ENABLE_TEST_MODE and x-test-user-id present?"}
    G -->|Yes| H["Use test user for local testing"]
    G -->|No| I["Lookup user by auth0_id in users table"]

    I --> J{"User row exists?"}
    J -->|Yes| K["Authenticated request continues"]
    J -->|No| L{"Is email present in session?"}
    L -->|Yes| M["Fallback upsertUserFromSession creates row"]
    L -->|No| N["Request remains unauthenticated / missing app user"]

    M --> K

    O["Auth0 first-login action"] --> P["POST /api/auth/register-user"]
    P --> Q["Validate Authorization header and payload"]
    Q --> R["INSERT or UPDATE user in users table"]
    R --> K

    K --> S["Permissions resolve auth0_id to internal user.id"]
    S --> T["Board / share access granted or denied"]
```

## Notes

- Auth0 is the identity provider.
- The app stores a local `users` record keyed by `auth0_id`.
- `graphql/context.ts` does the main session-to-database lookup.
- `app/api/auth/register-user/route.ts` is the primary registration webhook path.
- Protected routes call `auth0.getSession()` and redirect unauthenticated users to login.
