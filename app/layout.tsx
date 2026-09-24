import type { Metadata, Viewport } from 'next'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

// dwa kroje: ciepły szeryf (nagłówki i tekst) pasujący do papierowej dioramy + mono dla akcentów "dev"
const display = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['opsz', 'SOFT'] })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

const TITLE = 'caspercooks.tech - Developer & Founder'
const DESCRIPTION =
  '$ whoami | Full-stack developer since 2015 | Founder of coderiv, devs-mentoring & devs-hunting | Co-founded efektywniejsi | Web2 + Web3 + AI agents | Low-level programming enthusiast'

// obraz do udostępnień (1200×630, z dioramy) leży w app/opengraph-image.jpg i app/twitter-image.jpg —
// Next dopina go do og:image / twitter:image sam, tu tylko reszta kart
export const metadata: Metadata = {
  metadataBase: new URL('https://caspercooks.tech'),
  title: TITLE,
  description: DESCRIPTION,
  // imię i nazwisko w tej samej pisowni co na obrazie OG, w liście kontaktowym i w @KGarbacinski
  authors: [{ name: 'Kacper Garbacinski', url: 'https://caspercooks.tech' }],
  creator: 'Kacper Garbacinski',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'caspercooks.tech',
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: '@KGarbacinski',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b0806',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
