import { auth } from '@/auth';
import { db } from '@/lib/db';
import { players } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

/**
 * Get the current session (cached per request)
 */
export const getSession = cache(async () => {
  return await auth();
});

/**
 * Get the current user's ID from session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

/**
 * Get the current user's full profile from database
 */
export async function getCurrentUser() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const [user] = await db
    .select()
    .from(players)
    .where(eq(players.id, userId))
    .limit(1);

  return user ?? null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Require user - throws if user not found in database
 */
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
