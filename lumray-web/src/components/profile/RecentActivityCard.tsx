import { Eye, PenLine, Plus, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ActivityItem {
  id: string
  type: 'logged' | 'reviewed' | 'added' | 'followed'
  text: string
  createdAt: string
}

export interface RecentActivityCardProps {
  items: ActivityItem[]
}

const ICONS: Record<ActivityItem['type'], LucideIcon> = {
  logged: Eye,
  reviewed: PenLine,
  added: Plus,
  followed: UserPlus,
}

export default function RecentActivityCard({ items }: RecentActivityCardProps) {
  return (
    <section className="rounded-xl bg-surface p-4">
      <h3 className="mb-4 font-outfit text-sm font-semibold text-text">Recent activity</h3>

      <ul className="space-y-3">
        {items.map((item) => {
          const Icon = ICONS[item.type]

          return (
            <li key={item.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple/20 text-purple-light">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-roboto text-xs leading-relaxed text-text-dim line-clamp-2">
                  {item.text}
                </p>
                <p className="mt-0.5 font-roboto text-[10px] text-text-muted">{item.createdAt}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
