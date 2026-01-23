@echo off
echo Starting GraphQL API tests...
echo.
echo Make sure dev server is running: npm run dev
echo.
timeout /t 3 /nobreak >nul
npx tsx scripts/test-calendar-graphql.ts
