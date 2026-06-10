'use client'

import { useState } from 'react'
import { Plus, Backpack } from 'lucide-react'
import { useGears } from '@/hooks/useGears'
import { GearCard } from '@/components/gears/GearCard'
import { GearForm, type GearFormData } from '@/components/gears/GearForm'
import { CategoryFilter } from '@/components/gears/CategoryFilter'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import type { Gear, GearCategory } from '@/types'

export default function GearsPage() {
  const { gears, loading, addGear, updateGear, deleteGear } = useGears()
  const [selectedCategory, setSelectedCategory] = useState<GearCategory | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGear, setEditingGear] = useState<Gear | null>(null)
  const [deletingGear, setDeletingGear] = useState<Gear | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredGears = selectedCategory
    ? gears.filter((g) => g.category === selectedCategory)
    : gears

  const handleAdd = async (data: GearFormData) => {
    await addGear({
      name: data.name,
      category: data.category as GearCategory,
      isRequired: data.isRequired,
      isConsumable: data.isConsumable,
      memo: data.memo,
      imageUrl: data.imageUrl,
    })
    setShowAddModal(false)
  }

  const handleEdit = async (data: GearFormData) => {
    if (!editingGear) return
    await updateGear(editingGear.id, {
      name: data.name,
      category: data.category as GearCategory,
      isRequired: data.isRequired,
      isConsumable: data.isConsumable,
      memo: data.memo,
      imageUrl: data.imageUrl,
    })
    setEditingGear(null)
  }

  const handleDelete = async () => {
    if (!deletingGear) return
    setIsDeleting(true)
    try {
      await deleteGear(deletingGear.id)
      setDeletingGear(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          ギア一覧 <span className="text-sm font-normal text-slate-500">({gears.length}点)</span>
        </h2>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          追加
        </Button>
      </div>

      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

      {filteredGears.length === 0 ? (
        <EmptyState
          icon={Backpack}
          title={selectedCategory ? 'このカテゴリにギアはありません' : 'ギアを追加しましょう'}
          description={selectedCategory ? undefined : 'キャンプで使うギアを登録してください'}
          action={
            !selectedCategory ? (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus size={16} />
                最初のギアを追加
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredGears.map((gear) => (
            <GearCard
              key={gear.id}
              gear={gear}
              onEdit={setEditingGear}
              onDelete={setDeletingGear}
            />
          ))}
        </div>
      )}

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="ギアを追加">
        <GearForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal
        open={editingGear !== null}
        onClose={() => setEditingGear(null)}
        title="ギアを編集"
      >
        {editingGear && (
          <GearForm
            defaultValues={{
              name: editingGear.name,
              category: editingGear.category,
              isRequired: editingGear.isRequired,
              isConsumable: editingGear.isConsumable,
              memo: editingGear.memo,
              imageUrl: editingGear.imageUrl,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditingGear(null)}
            submitLabel="更新"
          />
        )}
      </Modal>

      <Modal
        open={deletingGear !== null}
        onClose={() => setDeletingGear(null)}
        title="ギアを削除"
      >
        {deletingGear && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">{deletingGear.name}</span>
              を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setDeletingGear(null)} className="flex-1">
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
