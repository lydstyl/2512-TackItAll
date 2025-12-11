import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaUserRepository } from '@/infrastructure/prisma/repositories/PrismaUserRepository';
import { PasswordHasher } from '@/infrastructure/auth/PasswordHasher';
import { Email } from '@/domain/valueObjects/Email';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const userRepo = new PrismaUserRepository();
          const email = new Email(credentials.email as string);

          // Find user by email
          const user = await userRepo.findByEmail(email);
          if (!user) {
            return null;
          }

          // Verify password
          const passwordHash = await userRepo.getPasswordHash(email);
          if (!passwordHash) {
            return null;
          }

          const isValid = await PasswordHasher.verify(
            credentials.password as string,
            passwordHash
          );

          if (!isValid) {
            return null;
          }

          // Return user data for session
          return {
            id: user.id.value,
            email: user.email.value,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
