import { Inter } from 'next/font/google'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'YourStore - Premium Bathroom Vanities',
  description: 'Shop high-quality bathroom vanities, LED mirrors, and fixtures',
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
