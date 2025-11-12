import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { HomePageClient } from './HomePageClient';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <HomePageClient session={session} />;
}
