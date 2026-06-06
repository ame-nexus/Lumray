export interface DiaryPaginationProps {
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
}

export default function DiaryPagination({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: DiaryPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className="rounded-lg border border-text/15 px-5 py-2 font-roboto text-sm text-text transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className="rounded-lg bg-purple px-5 py-2 font-roboto text-sm text-white transition-colors hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}
