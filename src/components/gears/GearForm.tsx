'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { GEAR_CATEGORY_KEYS, GEAR_CATEGORY_LABELS, GEAR_CATEGORY_DESCRIPTIONS, GEAR_CATEGORY_EXAMPLES } from '@/lib/constants/categories'
import type { Gear, GearCategory } from '@/types'

const gearSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(50, '50文字以内で入力してください'),
  category: z.enum(GEAR_CATEGORY_KEYS as [string, ...string[]]),
  isRequired: z.boolean(),
  isConsumable: z.boolean(),
  stock: z.number().int().min(0, '0以上の整数を入力してください').optional(),
  memo: z.string().max(200, '200文字以内で入力してください').optional(),
  imageUrl: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
})

type GearFormData = z.infer<typeof gearSchema>

type Props = {
  defaultValues?: Partial<GearFormData>
  onSubmit: (data: GearFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function GearForm({ defaultValues, onSubmit, onCancel, submitLabel = '登録' }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GearFormData>({
    resolver: zodResolver(gearSchema),
    defaultValues: {
      isRequired: false,
      isConsumable: false,
      category: 'other',
      stock: undefined,
      ...defaultValues,
    },
  })

  const selectedCategory = watch('category') as GearCategory
  const isConsumable = watch('isConsumable')

  const categoryOptions = GEAR_CATEGORY_KEYS.map((key) => ({
    value: key,
    label: GEAR_CATEGORY_LABELS[key],
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="ギア名 *"
        placeholder="例: コールマン テント"
        error={errors.name?.message}
        {...register('name')}
      />
      <div>
        <Select
          label="カテゴリ *"
          options={categoryOptions}
          error={errors.category?.message}
          {...register('category')}
        />
        {selectedCategory && (
          <div className="mt-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-200">
            <p>{GEAR_CATEGORY_DESCRIPTIONS[selectedCategory]}</p>
            <p className="mt-0.5 text-emerald-600 dark:text-emerald-400">
              例: {GEAR_CATEGORY_EXAMPLES[selectedCategory].join('、')}
            </p>
          </div>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          {...register('isRequired')}
        />
        必須ギア（忘れてはいけないもの）
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          {...register('isConsumable')}
        />
        消耗品（ガス・電池など使い切るもの）
      </label>
      {isConsumable && (
        <Input
          label="現在の保有数"
          type="number"
          placeholder="例: 3"
          error={errors.stock?.message}
          {...register('stock', { setValueAs: (v: string) => v === '' || v === undefined ? undefined : parseInt(v, 10) })}
        />
      )}
      <Input
        label="メモ"
        placeholder="購入場所、サイズなど"
        error={errors.memo?.message}
        {...register('memo')}
      />
      <Input
        label="画像URL"
        placeholder="https://..."
        error={errors.imageUrl?.message}
        {...register('imageUrl')}
      />
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

export type { GearFormData }
