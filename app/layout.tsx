import type { Metadata } from 'next'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

// dwa kroje: ciepły szeryf (nagłówki i tekst) pasujący do papierowej dioramy + mono dla akcentów "dev"
const display = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['opsz', 'SOFT'] })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'caspercooks.tech - Developer & Founder',
  description: '$ whoami | Full-stack developer since 2015 | Founder of coderiv, devs-mentoring, devs-hunting & efektywniejsi | Web2 + Web3 | Low-level programming enthusiast',
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
