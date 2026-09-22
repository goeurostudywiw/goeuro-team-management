import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';
import { UserSessionProvider } from '@/components/UserSessionContext';
import { SyncProvider } from '@/components/SyncContext';
import Navbar from '@/components/Navbar';
import CommandPalette from '@/components/CommandPalette';
import AppMainWrapper from '@/components/AppMainWrapper';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goeurostudy.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GOEURO STUDY — ဂျာမနီ အခမဲ့ တက္ကသိုလ်များနှင့် လစဉ် လစာရ Ausbildung လမ်းညွှန်',
    template: '%s | GOEURO STUDY Germany',
  },
  description:
    'ဂျာမနီနိုင်ငံ အစိုးရတက္ကသိုလ် ဝင်ခွင့်များ၊ လစဉ် ယူရို ၁,၁၀၀+ ထောက်ပံ့ကြေးရ Dual Vocational Ausbildung အခွင့်အလမ်းများနှင့် ဗီဇာလုပ်ငန်းစဉ်များအတွက် တရားဝင် လမ်းညွှန်အေဂျင်စီ။ Hamburg & Southeast Asia Operations.',
  keywords: [
    'ဂျာမနီပညာသင်ဆု',
    'ဂျာမနီအခမဲ့တက္ကသိုလ်',
    'Ausbildung Myanmar',
    'Study in Germany',
    'German Dual Vocational Training',
    'GOEURO Study',
    'GOEURO Team Management',
    'Hamburg Germany Education Agency',
  ],
  authors: [{ name: 'GOEURO Education Agency' }],
  creator: 'GOEURO Education Agency',
  publisher: 'What Is WorldWise International Group Ltd',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/brand/goeuro_mark.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'my_MM',
    url: siteUrl,
    siteName: 'GOEURO STUDY Germany',
    title: 'GOEURO STUDY — ဂျာမနီ အခမဲ့ တက္ကသိုလ်များနှင့် လစဉ် လစာရ Ausbildung လမ်းညွှန်',
    description:
      'ဂျာမနီနိုင်ငံ အစိုးရတက္ကသိုလ် ဝင်ခွင့်များနှင့် လစဉ် ယူရို ၁,၁၀၀+ ထောက်ပံ့ကြေးရ Dual Vocational Ausbildung အခွင့်အလမ်းများအတွက် တရားဝင် လမ်းညွှန်အေဂျင်စီ။',
    images: [
      {
        url: '/brand/preview_logo_on_dark.png',
        width: 1200,
        height: 630,
        alt: 'GOEURO STUDY Germany Education Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GOEURO STUDY — ဂျာမနီ အခမဲ့ တက္ကသိုလ်များနှင့် လစဉ် လစာရ Ausbildung',
    description:
      'ဂျာမနီနိုင်ငံ အစိုးရတက္ကသိုလ် ဝင်ခွင့်များနှင့် လစဉ် ယူရို ၁,၁၀၀+ ထောက်ပံ့ကြေးရ Ausbildung လမ်းညွှန်။',
    images: ['/brand/preview_logo_on_dark.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Myanmar:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <UserSessionProvider>
          <LanguageProvider>
            <SyncProvider>
              <Navbar />
              <CommandPalette />
              <AppMainWrapper>{children}</AppMainWrapper>
            </SyncProvider>
          </LanguageProvider>
        </UserSessionProvider>
      </body>
    </html>
  );
}
