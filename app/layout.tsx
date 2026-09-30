import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مودرن هوم | للأثاث والديكور العصري',
  description: 'أثاث عصري وقطع مختارة، مع إمكانية تنفيذ تصميمات تناسب مساحتك وذوقك.',
  openGraph: {
    title: 'مودرن هوم | للأثاث والديكور العصري',
    description: 'أثاث عصري وقطع مختارة، مع إمكانية تنفيذ تصميمات تناسب مساحتك وذوقك.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مودرن هوم | للأثاث والديكور العصري',
    description: 'أثاث عصري وقطع مختارة، مع إمكانية تنفيذ تصميمات تناسب مساحتك وذوقك.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body className="mh-body bg-[#F7F3EC] text-[#18232D] font-sans antialiased selection:bg-[#C8A77D] selection:text-[#17324A]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
