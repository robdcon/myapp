import { auth0 } from "@/lib/auth0"; // Adjust path if your auth0 client is elsewhere
import BoardList from "@/app/components/Boards";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main>
        <a href="/auth/login?screen_hint=signup">Sign up</a>
        <a href="/auth/login">Log in</a>
      </main>
    );
  }

  return (
    <main>
      <h1>Welcome, {session.user.name}!</h1>
      <BoardList />
    </main>
  );
}
