'use client'

import { useState } from 'react'

export default function BiographySection({ biography }: { biography: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = biography.length > 500

  return (
    <section>
      <h2 className="mb-3 font-outfit text-lg font-semibold text-text">Biography</h2>
      <div className="relative max-w-3xl">
        <p className={`font-roboto text-sm leading-relaxed text-text-dim ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
          {biography}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="mt-2 font-roboto text-sm text-purple-light hover:underline"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </section>
  )
}
