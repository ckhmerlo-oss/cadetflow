// in app/layout.tsx
import './globals.css' // Your Tailwind styles
import { Inter } from 'next/font/google'
import SignOutButton from '@/app/components/SignOutButton'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Cadet Workflow App',
  description: 'Approval workflow application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Logo/Title */}
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  CadetFlow
                </Link>
              </div>

              {/* Sign Out Button */}
              <div>
                <SignOutButton />
              </div>
            </div>
          </nav>
        </header>

        {/* This is where your pages will be rendered */}
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}