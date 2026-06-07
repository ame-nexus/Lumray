export interface Badge {
  id: string
  label: string
  emoji: string
  description: string
}

export interface TasteBadgesCardProps {
  badges: Badge[]
}

export default function TasteBadgesCard({ badges }: TasteBadgesCardProps) {
  return (
    <section className="rounded-xl bg-surface p-4">
      <h3 className="mb-4 font-outfit text-sm font-semibold text-text">Taste badges</h3>

      <div className="grid grid-cols-2 gap-2">
        {badges.slice(0, 4).map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center rounded-lg bg-surface-2 p-3 text-center"
          >
            <span className="text-2xl">{badge.emoji}</span>
            <p className="mt-1 font-outfit text-xs font-bold text-text">{badge.label}</p>
            <p className="mt-0.5 font-roboto text-[10px] text-text-muted">{badge.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
