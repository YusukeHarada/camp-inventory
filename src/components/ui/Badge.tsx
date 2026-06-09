import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

type Props = {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function Badge({ children, variant = 'secondary', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variant === 'primary' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
        variant === 'secondary' && 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
        variant === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        variant === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        variant === 'danger' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        className
      )}
    >
      {children}
    </span>
  )
}
