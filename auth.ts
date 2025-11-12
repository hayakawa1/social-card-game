import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { players } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const [user] = await db
          .select()
          .from(players)
          .where(eq(players.email, email))
          .limit(1);

        if (!user) {
          return null;
        }

        // Verify password
        const isPasswordValid = await compare(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await db
          .update(players)
          .set({
            lastLoginDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(players.id, user.id));

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.iconUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? '';
        session.user.email = token.email ?? '';
        session.user.image = token.picture ?? undefined;
      }
      return session;
    },
  },
});
