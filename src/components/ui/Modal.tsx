'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'rounded-2xl shadow-xl backdrop:bg-black/50 p-0 w-full max-w-md',
        'bg-white dark:bg-slate-800',
        'open:animate-in open:fade-in open:zoom-in-95',
        className
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <div className="flex flex-col">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </dialog>
  )
}
