'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const trackerTypes = [
  {
    value: 'BOOLEAN',
    label: 'Boolean (Yes/No)',
    icon: '✓',
    description: 'Track yes/no habits like exercise, meditation, reading',
  },
  {
    value: 'NUMBER',
    label: 'Number',
    icon: '#',
    description: 'Track numeric values like weight, steps, calories',
  },
  {
    value: 'TEXT',
    label: 'Text',
    icon: '📝',
    description: 'Track notes, moods, journal entries',
  },
  {
    value: 'DURATION',
    label: 'Duration (HH:MM)',
    icon: '⏱️',
    description: 'Track time spent on activities like workouts, study sessions',
  },
  {
    value: 'CURRENCY',
    label: 'Currency (EUR)',
    icon: '€',
    description: 'Track expenses, income, savings',
  },
];

export default function NewTrackerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !type) {
      setError('Name and type are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create tracker');
      } else {
        router.push(`/trackers/${data.tracker.id}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950'>
      <div className='container mx-auto px-4 py-8 max-w-2xl'>
        <div className='mb-6'>
          <Link href='/dashboard'>
            <Button variant='outline' size='sm'>
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Create New Tracker</CardTitle>
            <CardDescription>
              Set up a new tracker to monitor your goals and habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Tracker Name</Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='e.g., Daily Exercise, Weight, Mood'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>Tracker Type</Label>
                <Select value={type} onValueChange={setType} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a tracker type' />
                  </SelectTrigger>
                  <SelectContent>
                    {trackerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className='flex items-center gap-2'>
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {type && (
                  <p className='text-sm text-muted-foreground'>
                    {trackerTypes.find((t) => t.value === type)?.description}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description (Optional)</Label>
                <Textarea
                  id='description'
                  placeholder='Add more details about what you want to track'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {error && (
                <div className='text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md'>
                  {error}
                </div>
              )}

              <div className='flex gap-3'>
                <Button type='submit' className='flex-1' disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Tracker'}
                </Button>
                <Link href='/dashboard' className='flex-1'>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
