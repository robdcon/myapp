import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { BoardViewer } from '@/src/widgets/board-viewer';

export async function BoardPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  const { id } = await params;

  return (
    <main>
      <BoardViewer boardId={id} />
    </main>
  );
}
