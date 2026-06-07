import { ReactNode } from 'react'

interface ProfileTwoColumnProps {
  main: ReactNode
  sidebar?: ReactNode
}

export default function ProfileTwoColumn({ main, sidebar }: ProfileTwoColumnProps) {
  return (
    <div className="flex gap-8 px-6 py-10 md:px-12 xl:gap-12 xl:px-60">
      <div className="min-w-0 flex-1 space-y-10">{main}</div>
      {sidebar && (
        <div className="hidden w-72 shrink-0 flex-col gap-4 lg:flex xl:w-80">
          {sidebar}
        </div>
      )}
    </div>
  )
}
