import { format, isValid, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatTripDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (!isValid(date)) return dateStr
  return format(date, 'yyyy年M月d日(E)', { locale: ja })
}

export function formatTripDateShort(dateStr: string): string {
  const date = parseISO(dateStr)
  if (!isValid(date)) return dateStr
  return format(date, 'yyyy/MM/dd', { locale: ja })
}

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
