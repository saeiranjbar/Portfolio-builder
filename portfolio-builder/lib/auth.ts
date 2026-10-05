import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // In production, use bcrypt to compare hashed passwords.
          // This provider still uses the existing demo account lookup.
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            // Auto-create user on first login (demo mode).
            const newUser = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0],
              },
            });
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
            };
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          const code = typeof error === 'object' && error !== null
            ? ('code' in error ? error.code : 'errorCode' in error ? error.errorCode : undefined)
            : undefined;
          // Keep database details and connection strings out of the login response.
          console.error('[auth] Account database sign-in failed', {
            code,
            name: error instanceof Error ? error.name : 'UnknownError',
          });
          throw new Error(code === 'P2021' || code === 'P2022'
            ? 'DatabaseNotReady'
            : 'DatabaseSignInFailed');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
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
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
