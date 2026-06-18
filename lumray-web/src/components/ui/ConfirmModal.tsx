'use client'

import { Loader2 } from 'lucide-react'

interface ConfirmModalProps {
  title:     string
  message:   string
  loading?:  boolean
  confirmLabel?: string
  onConfirm: () => void
  onCancel:  () => void
}

export default function ConfirmModal({
  title,
  message,
  loading = false,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-xs rounded-2xl border border-text/10 bg-surface p-5 shadow-xl flex flex-col gap-4">
        <div>
          <h3 className="font-outfit text-base font-semibold text-text">{title}</h3>
          <p className="mt-1 font-roboto text-sm text-text-muted">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-text/15 py-2 font-roboto text-sm text-text-muted transition-colors hover:border-text/30 hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500/80 py-2 font-roboto text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
