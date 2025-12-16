'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EntryForm } from '@/components/EntryForm';

interface Tracker {
  id: string;
  name: string;
  type: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Entry {
  id: string;
  trackerId: string;
  value: any;
  displayValue: string;
  type: string;
  recordedAt: string;
  note: string | null;
  createdAt: string;
}

interface Stats {
  totalCount: number;
  [key: string]: any;
}

const typeIcons: Record<string, string> = {
  BOOLEAN: '✓',
  NUMBER: '#',
  TEXT: '📝',
  DURATION: '⏱️',
  CURRENCY: '€',
};

export default function TrackerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [trackerRes, entriesRes, statsRes] = await Promise.all([
        fetch(`/api/trackers/${id}`),
        fetch(`/api/trackers/${id}/entries`),
        fetch(`/api/trackers/${id}/stats`),
      ]);

      if (trackerRes.ok) {
        const trackerData = await trackerRes.json();
        setTracker(trackerData.tracker);
      }

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json();
        setEntries(entriesData.entries);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEntryAdded = () => {
    setIsDialogOpen(false);
    fetchData();
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleDeleteTracker = async () => {
    if (!confirm('Are you sure you want to delete this tracker? All entries will be deleted as well.')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/trackers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error deleting tracker:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStats = () => {
    if (!stats || !tracker) return null;

    switch (tracker.type) {
      case 'BOOLEAN':
        return (
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats.totalCount}</p>
              <p className='text-sm text-muted-foreground'>Total</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-green-600'>{stats.trueCount}</p>
              <p className='text-sm text-muted-foreground'>Yes</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats.percentage}%</p>
              <p className='text-sm text-muted-foreground'>Success Rate</p>
            </div>
          </div>
        );

      case 'NUMBER':
        return (
          <div className='grid grid-cols-4 gap-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats.totalCount}</p>
              <p className='text-sm text-muted-foreground'>Entries</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats.average?.toFixed(1)}</p>
              <p className='text-sm text-muted-foreground'>Average</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats.min}</p>
              <p className='text-sm text-muted-foreground'>Min</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats.max}</p>
              <p className='text-sm text-muted-foreground'>Max</p>
            </div>
          </div>
        );

      case 'TEXT':
        return (
          <div className='text-center'>
            <p className='text-2xl font-bold'>{stats.totalCount}</p>
            <p className='text-sm text-muted-foreground'>Total Entries</p>
          </div>
        );

      case 'DURATION':
        return (
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats.totalFormatted}</p>
              <p className='text-sm text-muted-foreground'>Total Time</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats.averageFormatted}</p>
              <p className='text-sm text-muted-foreground'>Average</p>
            </div>
          </div>
        );

      case 'CURRENCY':
        return (
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>€{stats.totalFormatted}</p>
              <p className='text-sm text-muted-foreground'>Total</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>€{stats.averageFormatted}</p>
              <p className='text-sm text-muted-foreground'>Average</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center'>
        <p>Loading...</p>
      </div>
    );
  }

  if (!tracker) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center'>
        <Card>
          <CardHeader>
            <CardTitle>Tracker not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-6'>
          <Link href='/dashboard'>
            <Button variant='outline' size='sm'>
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Tracker Header */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-2xl'>{typeIcons[tracker.type]}</span>
                  <CardTitle className='text-2xl'>{tracker.name}</CardTitle>
                </div>
                {tracker.description && (
                  <CardDescription>{tracker.description}</CardDescription>
                )}
              </div>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleDeleteTracker}
                disabled={isDeleting}
              >
                Delete Tracker
              </Button>
            </div>
          </CardHeader>
          {stats && <CardContent>{renderStats()}</CardContent>}
        </Card>

        <div className='grid md:grid-cols-2 gap-6'>
          {/* Add Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Add Entry</CardTitle>
              <CardDescription>Record a new {tracker.type.toLowerCase()} entry</CardDescription>
            </CardHeader>
            <CardContent>
              <EntryForm
                trackerId={tracker.id}
                trackerType={tracker.type}
                onSuccess={handleEntryAdded}
              />
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>{entries.length} total entries</CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  No entries yet. Add your first entry!
                </p>
              ) : (
                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {entries.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className='flex items-center justify-between p-3 bg-muted rounded-md'
                    >
                      <div>
                        <p className='font-medium'>{entry.displayValue}</p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(entry.recordedAt).toLocaleString()}
                        </p>
                        {entry.note && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            Note: {entry.note}
                          </p>
                        )}
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
