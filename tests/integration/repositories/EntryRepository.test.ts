import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaEntryRepository } from '../../../src/infrastructure/prisma/repositories/PrismaEntryRepository';
import { Entry } from '../../../src/domain/entities/Entry';
import { EntryId } from '../../../src/domain/valueObjects/EntryId';
import { TrackerId } from '../../../src/domain/valueObjects/TrackerId';
import { UserId } from '../../../src/domain/valueObjects/UserId';
import {
  BooleanValue,
  NumberValue,
  DurationValue,
  CurrencyValue,
} from '../../../src/domain/valueObjects/EntryValue';
import { TrackerType } from '../../../src/domain/valueObjects/TrackerType';
import { TrackerName } from '../../../src/domain/valueObjects/TrackerName';
import { prisma } from '../../../src/infrastructure/prisma/client';

describe('PrismaEntryRepository Integration Tests', () => {
  let repository: PrismaEntryRepository;
  let userId: UserId;
  let trackerId: TrackerId;

  beforeEach(async () => {
    repository = new PrismaEntryRepository();
    userId = new UserId('test-user-id');
    trackerId = new TrackerId('test-tracker-id');

    // Clean up database
    await prisma.entry.deleteMany({});
    await prisma.tracker.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    await prisma.user.create({
      data: {
        id: userId.value,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword',
      },
    });

    // Create test tracker
    await prisma.tracker.create({
      data: {
        id: trackerId.value,
        userId: userId.value,
        name: 'Test Tracker',
        type: TrackerType.BOOLEAN,
      },
    });
  });

  it('should save and retrieve a boolean entry', async () => {
    const entry = new Entry(
      new EntryId('entry-1'),
      trackerId,
      new BooleanValue(true),
      new Date('2025-01-01')
    );

    await repository.save(entry);

    const retrieved = await repository.findById(entry.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.value.getRawValue()).toBe(true);
    expect(retrieved!.value.getDisplayValue()).toBe('Yes');
  });

  it('should save and retrieve a number entry', async () => {
    // Update tracker type for this test
    await prisma.tracker.update({
      where: { id: trackerId.value },
      data: { type: TrackerType.NUMBER },
    });

    const entry = new Entry(
      new EntryId('entry-1'),
      trackerId,
      new NumberValue(42.5, 1),
      new Date('2025-01-01')
    );

    await repository.save(entry);

    const retrieved = await repository.findById(entry.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.value.getRawValue()).toBe(42.5);
    expect(retrieved!.value.getDisplayValue()).toBe('42.5');
  });

  it('should save and retrieve a duration entry', async () => {
    // Update tracker type for this test
    await prisma.tracker.update({
      where: { id: trackerId.value },
      data: { type: TrackerType.DURATION },
    });

    const entry = new Entry(
      new EntryId('entry-1'),
      trackerId,
      new DurationValue(150), // 2h30m
      new Date('2025-01-01')
    );

    await repository.save(entry);

    const retrieved = await repository.findById(entry.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.value.getRawValue()).toBe(150);
    expect(retrieved!.value.getDisplayValue()).toBe('02:30');
  });

  it('should save and retrieve a currency entry', async () => {
    // Update tracker type for this test
    await prisma.tracker.update({
      where: { id: trackerId.value },
      data: { type: TrackerType.CURRENCY },
    });

    const entry = new Entry(
      new EntryId('entry-1'),
      trackerId,
      new CurrencyValue(1550), // €15.50
      new Date('2025-01-01')
    );

    await repository.save(entry);

    const retrieved = await repository.findById(entry.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.value.getRawValue()).toBe(1550);
    expect(retrieved!.value.getDisplayValue()).toBe('€15.50');
  });

  it('should find entries by tracker id', async () => {
    const entry1 = new Entry(
      new EntryId('entry-1'),
      trackerId,
      new BooleanValue(true),
      new Date('2025-01-01')
    );

    const entry2 = new Entry(
      new EntryId('entry-2'),
      trackerId,
      new BooleanValue(false),
      new Date('2025-01-02')
    );

    await repository.save(entry1);
    await repository.save(entry2);

    const entries = await repository.findByTrackerId(trackerId);
    expect(entries).toHaveLength(2);
  });

  it('should find entries by date range', async () => {
    const entry1 = new Entry(
      new EntryId('entry-1'),
      trackerId,
      new BooleanValue(true),
      new Date('2025-01-01')
    );

    const entry2 = new Entry(
      new EntryId('entry-2'),
      trackerId,
      new BooleanValue(false),
      new Date('2025-01-15')
    );

    const entry3 = new Entry(
      new EntryId('entry-3'),
      trackerId,
      new BooleanValue(true),
      new Date('2025-01-31')
    );

    await repository.save(entry1);
    await repository.save(entry2);
    await repository.save(entry3);

    const entries = await repository.findByTrackerIdAndDateRange(
      trackerId,
      new Date('2025-01-10'),
      new Date('2025-01-20')
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].id.value).toBe('entry-2');
  });

  it('should delete an entry', async () => {
    const entry = new Entry(
      new EntryId('entry-1'),
      trackerId,
      new BooleanValue(true),
      new Date('2025-01-01')
    );

    await repository.save(entry);
    await repository.delete(entry.id);

    const retrieved = await repository.findById(entry.id);
    expect(retrieved).toBeNull();
  });

  it('should count entries by tracker', async () => {
    const entry1 = new Entry(
      new EntryId('entry-1'),
      trackerId,
      new BooleanValue(true),
      new Date('2025-01-01')
    );

    const entry2 = new Entry(
      new EntryId('entry-2'),
      trackerId,
      new BooleanValue(false),
      new Date('2025-01-02')
    );

    await repository.save(entry1);
    await repository.save(entry2);

    const count = await repository.countByTrackerId(trackerId);
    expect(count).toBe(2);
  });
});
