'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface EntryFormProps {
  trackerId: string;
  trackerType: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EntryForm({
  trackerId,
  trackerType,
  onSuccess,
  onCancel,
}: EntryFormProps) {
  const [value, setValue] = useState<any>('');
  const [recordedAt, setRecordedAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let processedValue = value;

      // Process value based on type
      if (trackerType === 'BOOLEAN') {
        processedValue = value === 'true' || value === true;
      } else if (trackerType === 'NUMBER') {
        processedValue = parseFloat(value);
        if (isNaN(processedValue)) {
          setError('Please enter a valid number');
          setIsLoading(false);
          return;
        }
      } else if (trackerType === 'DURATION') {
        // Convert HH:MM to minutes
        const [hours, minutes] = value.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          setError('Please enter time in HH:MM format');
          setIsLoading(false);
          return;
        }
        processedValue = hours * 60 + minutes;
      } else if (trackerType === 'CURRENCY') {
        // Convert EUR to cents
        const euros = parseFloat(value);
        if (isNaN(euros)) {
          setError('Please enter a valid amount');
          setIsLoading(false);
          return;
        }
        processedValue = Math.round(euros * 100);
      }

      const response = await fetch(`/api/trackers/${trackerId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: processedValue,
          recordedAt: new Date(recordedAt).toISOString(),
          note: note || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add entry');
      } else {
        setValue('');
        setNote('');
        setRecordedAt(new Date().toISOString().slice(0, 16));
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderValueInput = () => {
    switch (trackerType) {
      case 'BOOLEAN':
        return (
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='value'
              checked={value === true || value === 'true'}
              onCheckedChange={(checked) => setValue(checked)}
              disabled={isLoading}
            />
            <Label htmlFor='value' className='cursor-pointer'>
              Yes
            </Label>
          </div>
        );

      case 'NUMBER':
        return (
          <Input
            id='value'
            type='number'
            step='any'
            placeholder='e.g., 75.5'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            disabled={isLoading}
          />
        );

      case 'TEXT':
        return (
          <Textarea
            id='value'
            placeholder='Enter your text here...'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            disabled={isLoading}
            rows={3}
          />
        );

      case 'DURATION':
        return (
          <Input
            id='value'
            type='time'
            placeholder='HH:MM'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            disabled={isLoading}
          />
        );

      case 'CURRENCY':
        return (
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
              €
            </span>
            <Input
              id='value'
              type='number'
              step='0.01'
              placeholder='0.00'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              disabled={isLoading}
              className='pl-7'
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='value'>Value</Label>
        {renderValueInput()}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='recordedAt'>Date & Time</Label>
        <Input
          id='recordedAt'
          type='datetime-local'
          value={recordedAt}
          onChange={(e) => setRecordedAt(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='note'>Note (Optional)</Label>
        <Textarea
          id='note'
          placeholder='Add a note...'
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
          rows={2}
        />
      </div>

      {error && (
        <div className='text-sm text-destructive bg-destructive/10 p-3 rounded-md'>
          {error}
        </div>
      )}

      <div className='flex gap-3'>
        <Button type='submit' className='flex-1' disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Entry'}
        </Button>
        {onCancel && (
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
