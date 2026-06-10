import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'CampGear — キャンプギア管理',
  description: 'キャンプギアの管理とプランニングアプリ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CampGear',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-slate-50 dark:bg-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
