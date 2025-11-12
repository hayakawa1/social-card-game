import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { GlobalEffects } from '@/components/layout/GlobalEffects';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MUSCLE☆PRISM - Social Card Game',
  description: 'かわいい筋闘女×アイドルのソーシャルカードゲーム',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shake {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(var(--shake-intensity, 10px), 0); }
            20% { transform: translate(calc(var(--shake-intensity, 10px) * -1), 0); }
            30% { transform: translate(0, var(--shake-intensity, 10px)); }
            40% { transform: translate(0, calc(var(--shake-intensity, 10px) * -1)); }
            50% { transform: translate(calc(var(--shake-intensity, 10px) * 0.7), calc(var(--shake-intensity, 10px) * 0.7)); }
            60% { transform: translate(calc(var(--shake-intensity, 10px) * -0.7), calc(var(--shake-intensity, 10px) * -0.7)); }
            70% { transform: translate(calc(var(--shake-intensity, 10px) * 0.4), 0); }
            80% { transform: translate(calc(var(--shake-intensity, 10px) * -0.4), 0); }
            90% { transform: translate(0, calc(var(--shake-intensity, 10px) * 0.2)); }
          }

          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 15s ease infinite;
          }

          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}} />
      </head>
      <body className={inter.className}>
        <GlobalEffects />
        <SoundToggle />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
