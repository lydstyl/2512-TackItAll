import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { PrismaUserRepository } from '@/infrastructure/prisma/repositories/PrismaUserRepository';
import { PasswordHasher } from '@/infrastructure/auth/PasswordHasher';
import { User } from '@/domain/entities/User';
import { UserId } from '@/domain/valueObjects/UserId';
import { Email } from '@/domain/valueObjects/Email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const userRepo = new PrismaUserRepository();

    // Create domain objects with validation
    const emailVO = new Email(email);

    // Check if user already exists
    const existingUser = await userRepo.findByEmail(emailVO);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await PasswordHasher.hash(password);

    // Create user entity
    const user = new User(new UserId(randomUUID()), emailVO, name);

    // Save to database
    await userRepo.save(user, passwordHash);

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.id.value,
          email: user.email.value,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
