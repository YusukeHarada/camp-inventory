'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { PageLoading } from '@/components/ui/LoadingSpinner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) return <PageLoading />
  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pb-20 pt-4 px-4">{children}</main>
      <BottomNav />
    </div>
  )
}
