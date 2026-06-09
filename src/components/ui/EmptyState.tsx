import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

type Props = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className
      )}
    >
      {Icon && (
        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
          <Icon size={32} className="text-slate-400" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-slate-900 dark:text-slate-100">{title}</p>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
