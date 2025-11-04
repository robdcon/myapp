import { auth0 } from "@/lib/auth0";
import { redirect } from 'next/navigation';
import BoardItems from '@/app/components/BoardItems';

export async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  const { id } = await params;

  return (
    <main className="p-8">
      <BoardItems boardId={id} />
    </main>
  );
}