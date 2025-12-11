import { prisma } from '@/infrastructure/prisma/client';
import { User } from '@/domain/entities/User';
import { UserId } from '@/domain/valueObjects/UserId';
import { Email } from '@/domain/valueObjects/Email';
import { UserMapper } from '@/infrastructure/prisma/mappers/UserMapper';

export class PrismaUserRepository {
  async save(user: User, passwordHash: string): Promise<void> {
    const prismaData = UserMapper.toPrisma(user);

    await prisma.user.upsert({
      where: { id: user.id.value },
      create: {
        ...prismaData,
        passwordHash,
      },
      update: {
        email: prismaData.email,
        name: prismaData.name,
      },
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const prismaUser = await prisma.user.findUnique({
      where: { id: id.value },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const prismaUser = await prisma.user.findUnique({
      where: { email: email.value },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }

  async exists(id: UserId): Promise<boolean> {
    const count = await prisma.user.count({
      where: { id: id.value },
    });

    return count > 0;
  }

  async getPasswordHash(email: Email): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.value },
      select: { passwordHash: true },
    });

    return user?.passwordHash ?? null;
  }
}
