import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PrismaTrackerRepository } from '@/infrastructure/prisma/repositories/PrismaTrackerRepository';
import { UserId } from '@/domain/valueObjects/UserId';
import { signOut } from '@/auth';

async function getTrackers(userId: string) {
  const repository = new PrismaTrackerRepository();
  const userIdVO = new UserId(userId);
  const trackers = await repository.findByUserId(userIdVO);

  return trackers.map((t) => ({
    id: t.id.value,
    name: t.name.value,
    type: t.type,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));
}

const typeIcons: Record<string, string> = {
  BOOLEAN: '✓',
  NUMBER: '#',
  TEXT: '📝',
  DURATION: '⏱️',
  CURRENCY: '€',
};

const typeColors: Record<string, string> = {
  BOOLEAN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  NUMBER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  TEXT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  DURATION:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CURRENCY: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const trackers = await getTrackers(session.user.id);

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>
              Welcome, {session.user.name}!
            </h1>
            <p className='text-muted-foreground'>Manage your trackers</p>
          </div>
          <div className='flex gap-2'>
            <Link href='/trackers/new'>
              <Button>+ New Tracker</Button>
            </Link>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button variant='outline' type='submit'>
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Trackers Grid */}
        {trackers.length === 0 ? (
          <Card className='max-w-2xl mx-auto text-center py-12'>
            <CardHeader>
              <CardTitle>No trackers yet</CardTitle>
              <CardDescription>
                Create your first tracker to start tracking your life!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href='/trackers/new'>
                <Button size='lg'>Create Your First Tracker</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {trackers.map((tracker) => (
              <Link key={tracker.id} href={`/trackers/${tracker.id}`}>
                <Card className='hover:shadow-lg transition-shadow cursor-pointer h-full'>
                  <CardHeader>
                    <div className='flex items-center justify-between mb-2'>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 ${typeColors[tracker.type]}`}
                      >
                        <span>{typeIcons[tracker.type]}</span>
                        {tracker.type}
                      </span>
                    </div>
                    <CardTitle className='text-xl'>{tracker.name}</CardTitle>
                    {tracker.description && (
                      <CardDescription className='line-clamp-2'>
                        {tracker.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className='text-xs text-muted-foreground'>
                      Created{' '}
                      {new Date(tracker.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
