import './globals.css'
import type { Metadata } from 'next'
import { Oxanium } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth';
import { AuthGate } from '@/components/AuthGate';

const oxanium = Oxanium({ 
  subsets: ['latin'],
  variable: '--font-oxanium',
  weight: ['400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: 'FTOH Haxball Bot',
  description: 'Formula ToH Racing System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${oxanium.className} ${oxanium.variable}`}>
        <AuthProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  )
}
