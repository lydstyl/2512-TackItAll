import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaTrackerRepository } from '../../../src/infrastructure/prisma/repositories/PrismaTrackerRepository';
import { Tracker } from '../../../src/domain/entities/Tracker';
import { TrackerId } from '../../../src/domain/valueObjects/TrackerId';
import { UserId } from '../../../src/domain/valueObjects/UserId';
import { TrackerName } from '../../../src/domain/valueObjects/TrackerName';
import { TrackerType } from '../../../src/domain/valueObjects/TrackerType';
import { prisma } from '../../../src/infrastructure/prisma/client';

describe('PrismaTrackerRepository Integration Tests', () => {
  let repository: PrismaTrackerRepository;
  let userId: UserId;

  beforeEach(async () => {
    repository = new PrismaTrackerRepository();
    userId = new UserId('test-user-id');

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
  });

  it('should save and retrieve a tracker', async () => {
    const tracker = new Tracker(
      new TrackerId('tracker-1'),
      userId,
      new TrackerName('Daily Exercise'),
      TrackerType.BOOLEAN,
      'Track daily exercise habit'
    );

    await repository.save(tracker);

    const retrieved = await repository.findById(tracker.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id.value).toBe(tracker.id.value);
    expect(retrieved!.name.value).toBe('Daily Exercise');
    expect(retrieved!.type).toBe(TrackerType.BOOLEAN);
  });

  it('should find all trackers for a user', async () => {
    const tracker1 = new Tracker(
      new TrackerId('tracker-1'),
      userId,
      new TrackerName('Exercise'),
      TrackerType.BOOLEAN
    );

    const tracker2 = new Tracker(
      new TrackerId('tracker-2'),
      userId,
      new TrackerName('Weight'),
      TrackerType.NUMBER
    );

    await repository.save(tracker1);
    await repository.save(tracker2);

    const trackers = await repository.findByUserId(userId);
    expect(trackers).toHaveLength(2);
  });

  it('should delete a tracker', async () => {
    const tracker = new Tracker(
      new TrackerId('tracker-1'),
      userId,
      new TrackerName('Test'),
      TrackerType.TEXT
    );

    await repository.save(tracker);
    await repository.delete(tracker.id);

    const retrieved = await repository.findById(tracker.id);
    expect(retrieved).toBeNull();
  });

  it('should check if tracker exists', async () => {
    const tracker = new Tracker(
      new TrackerId('tracker-1'),
      userId,
      new TrackerName('Test'),
      TrackerType.TEXT
    );

    const beforeSave = await repository.exists(tracker.id);
    expect(beforeSave).toBe(false);

    await repository.save(tracker);

    const afterSave = await repository.exists(tracker.id);
    expect(afterSave).toBe(true);
  });
});
