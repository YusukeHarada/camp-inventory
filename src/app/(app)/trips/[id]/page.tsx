'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, CheckSquare, ClipboardList, Star, FlagTriangleRight } from 'lucide-react'
import { useTripGears } from '@/hooks/useTripGears'
import { TripGearItem } from '@/components/trips/TripGearItem'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { GEAR_CATEGORY_LABELS } from '@/lib/constants/categories'
import { calcConsumptionSuggestion } from '@/lib/utils/statistics'
import type { Gear } from '@/types'

type Props = {
  params: Promise<{ id: string }>
}

type Tab = 'checklist' | 'planning'

export default function TripDetailPage({ params }: Props) {
  const { id: tripId } = use(params)
  const {
    tripGears,
    allTripGears,
    allGears,
    unplannedGears,
    tripStatus,
    loading,
    error,
    addTripGear,
    toggleCheck,
    updateConsumptionLevel,
    updateQuantity,
    removeTripGear,
    addRequiredGears,
    completeTrip,
  } = useTripGears(tripId)

  const [tab, setTab] = useState<Tab>('checklist')
  const [showGearSelector, setShowGearSelector] = useState(false)
  const [isAddingRequired, setIsAddingRequired] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)

  const gearMap = new Map(allGears.map((g) => [g.id, g]))
  const checkedCount = tripGears.filter((tg) => tg.checked).length

  const handleAddRequiredGears = async () => {
    setIsAddingRequired(true)
    try {
      await addRequiredGears()
    } finally {
      setIsAddingRequired(false)
    }
  }

  const handleCompleteTrip = async () => {
    setIsCompleting(true)
    try {
      await completeTrip()
      setShowCompleteConfirm(false)
    } finally {
      setIsCompleting(false)
    }
  }

  if (loading) return <PageLoading />
  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
      <p className="font-medium">データの読み込みに失敗しました</p>
      <p className="mt-1 text-xs opacity-75">{error}</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/trips"
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">持ち物リスト</h2>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {checkedCount} / {tripGears.length} 個チェック済み
        </p>
        <div className="flex gap-2">
          {tripStatus === 'planned' && (
            <Button size="sm" variant="secondary" onClick={handleAddRequiredGears} loading={isAddingRequired}>
              <Star size={14} />
              必須ギアを追加
            </Button>
          )}
          {tripStatus === 'planned' ? (
            <Button size="sm" onClick={() => setShowCompleteConfirm(true)}>
              <FlagTriangleRight size={14} />
              キャンプ終了
            </Button>
          ) : (
            <Badge variant="primary">終了済み</Badge>
          )}
        </div>
      </div>

      <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {(['checklist', 'planning'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {t === 'checklist' ? <CheckSquare size={16} /> : <ClipboardList size={16} />}
            {t === 'checklist' ? 'チェックリスト' : 'プランニング'}
          </button>
        ))}
      </div>

      {tab === 'checklist' && (
        <>
          {tripGears.length === 0 ? (
            <EmptyState
              title="持ち物がありません"
              description="プランニングタブからギアを追加してください"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {tripGears.map((tg) => {
                const gear = gearMap.get(tg.gearId)
                if (!gear) return null
                return (
                  <TripGearItem
                    key={tg.id}
                    tripGear={tg}
                    gear={gear}
                    onToggle={toggleCheck}
                    onRemove={removeTripGear}
                    onUpdateConsumption={updateConsumptionLevel}
                    onUpdateQuantity={updateQuantity}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'planning' && (
        <>
          <Button onClick={() => setShowGearSelector(true)}>
            <Plus size={16} />
            ギアを追加
          </Button>
          {unplannedGears.length === 0 ? (
            <EmptyState title="追加できるギアがありません" description="ギア一覧からギアを登録してください" />
          ) : (
            <div className="flex flex-col gap-2">
              {unplannedGears.map((gear) => (
                <UnplannedGearRow
                  key={gear.id}
                  gear={gear}
                  onAdd={addTripGear}
                  suggestion={gear.isConsumable ? calcConsumptionSuggestion(gear.id, allTripGears) : null}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={showCompleteConfirm} onClose={() => setShowCompleteConfirm(false)} title="キャンプ終了">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            キャンプを終了しますか？消耗品の消費量が在庫に反映されます。この操作は取り消せません。
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCompleteConfirm(false)} className="flex-1">
              キャンセル
            </Button>
            <Button onClick={handleCompleteTrip} loading={isCompleting} className="flex-1">
              終了する
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showGearSelector} onClose={() => setShowGearSelector(false)} title="ギアを選択">
        {unplannedGears.length === 0 ? (
          <p className="text-sm text-slate-500">追加できるギアがありません</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {unplannedGears.map((gear) => (
              <button
                key={gear.id}
                onClick={async () => {
                  await addTripGear(gear.id)
                  setShowGearSelector(false)
                }}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{gear.name}</p>
                  <Badge variant="secondary" className="mt-0.5">{GEAR_CATEGORY_LABELS[gear.category]}</Badge>
                </div>
                {gear.isRequired && <Badge variant="warning">必須</Badge>}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

function UnplannedGearRow({
  gear,
  onAdd,
  suggestion,
}: {
  gear: Gear
  onAdd: (gearId: string) => Promise<void>
  suggestion?: string | null
}) {
  const [isAdding, setIsAdding] = useState(false)
  const handleAdd = async () => {
    setIsAdding(true)
    try {
      await onAdd(gear.id)
    } finally {
      setIsAdding(false)
    }
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{gear.name}</p>
        <div className="mt-0.5 flex gap-1.5 flex-wrap">
          <Badge variant="secondary">{GEAR_CATEGORY_LABELS[gear.category]}</Badge>
          {gear.isRequired && <Badge variant="warning">必須</Badge>}
        </div>
        {suggestion && (
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">過去の傾向: {suggestion}</p>
        )}
      </div>
      <Button size="sm" onClick={handleAdd} loading={isAdding}>
        <Plus size={14} />
        追加
      </Button>
    </div>
  )
}
