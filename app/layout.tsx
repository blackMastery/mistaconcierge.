import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MISTA Concierge Travel CO. - Caribbean & Latin America Travel',
  description: 'Mista Concierge Travel Company is a specialty travel and leisure provider specializing in Caribbean and Latin America travel. Experience solo, private or guided vacation offerings with a full concierge level service.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

