'use client'

import { useState } from 'react'
import { Plus, Tent } from 'lucide-react'
import { useTrips } from '@/hooks/useTrips'
import { TripCard } from '@/components/trips/TripCard'
import { TripForm, type TripFormData } from '@/components/trips/TripForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import type { CampTrip } from '@/types'

export default function TripsPage() {
  const { trips, loading, addTrip, updateTrip, deleteTrip } = useTrips()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState<CampTrip | null>(null)
  const [deletingTrip, setDeletingTrip] = useState<CampTrip | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAdd = async (data: TripFormData) => {
    await addTrip({
      name: data.name,
      date: data.date,
      location: data.location,
      memo: data.memo,
    })
    setShowAddModal(false)
  }

  const handleEdit = async (data: TripFormData) => {
    if (!editingTrip) return
    await updateTrip(editingTrip.id, {
      name: data.name,
      date: data.date,
      location: data.location,
      memo: data.memo,
    })
    setEditingTrip(null)
  }

  const handleDelete = async () => {
    if (!deletingTrip) return
    setIsDeleting(true)
    try {
      await deleteTrip(deletingTrip.id)
      setDeletingTrip(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          キャンプ記録 <span className="text-sm font-normal text-slate-500">({trips.length}件)</span>
        </h2>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          追加
        </Button>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={Tent}
          title="キャンプ記録がありません"
          description="キャンプの記録を追加してプランニングを始めましょう"
          action={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              最初のキャンプを追加
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={setEditingTrip}
              onDelete={setDeletingTrip}
            />
          ))}
        </div>
      )}

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="キャンプを追加">
        <TripForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal
        open={editingTrip !== null}
        onClose={() => setEditingTrip(null)}
        title="キャンプを編集"
      >
        {editingTrip && (
          <TripForm
            defaultValues={{
              name: editingTrip.name,
              date: editingTrip.date,
              location: editingTrip.location,
              memo: editingTrip.memo,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditingTrip(null)}
            submitLabel="更新"
          />
        )}
      </Modal>

      <Modal
        open={deletingTrip !== null}
        onClose={() => setDeletingTrip(null)}
        title="キャンプを削除"
      >
        {deletingTrip && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">{deletingTrip.name}</span>
              を削除しますか？持ち物リストも全て削除されます。
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setDeletingTrip(null)} className="flex-1">
                キャンセル
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={isDeleting} className="flex-1">
                削除
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
