import { User as PrismaUser } from '@prisma/client';
import { User } from '@/domain/entities/User';
import { UserId } from '@/domain/valueObjects/UserId';
import { Email } from '@/domain/valueObjects/Email';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User(
      new UserId(prismaUser.id),
      new Email(prismaUser.email),
      prismaUser.name
    );
  }

  static toPrisma(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      passwordHash: '', // Will be set by auth layer
    };
  }
}
