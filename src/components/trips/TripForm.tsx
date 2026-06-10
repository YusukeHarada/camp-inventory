'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { todayString } from '@/lib/utils/date'

const tripSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(50, '50文字以内で入力してください'),
  date: z.string().min(1, '日付を入力してください'),
  location: z.string().max(100).optional(),
  memo: z.string().max(500).optional(),
})

type TripFormData = z.infer<typeof tripSchema>

type Props = {
  defaultValues?: Partial<TripFormData>
  onSubmit: (data: TripFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function TripForm({ defaultValues, onSubmit, onCancel, submitLabel = '登録' }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      date: todayString(),
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="キャンプ名 *"
        placeholder="例: 奥多摩キャンプ 2026夏"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="日付 *"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />
      <Input
        label="場所"
        placeholder="例: 奥多摩 むかし道キャンプ"
        error={errors.location?.message}
        {...register('location')}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">メモ</label>
        <textarea
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="天気、人数、感想など"
          rows={3}
          {...register('memo')}
        />
        {errors.memo && <p className="text-xs text-red-500">{errors.memo.message}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          キャンセル
        </Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export type { TripFormData }
