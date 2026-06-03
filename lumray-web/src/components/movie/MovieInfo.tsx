export interface MovieInfoProps {
  director?: string
  writers?: string[]
  cinematography?: string
  music?: string
  runtime?: number
  language?: string
  country?: string
  studio?: string
  released?: string
}

export function formatRuntime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

interface InfoRowProps {
  label: string
  value: string
  link?: boolean
}

function InfoRow({ label, value, link }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-text/5 py-1.5 last:border-0">
      <span className="shrink-0 font-roboto text-xs text-text-muted">{label}</span>
      <span
        className={`text-right font-roboto text-xs ${
          link ? 'text-purple-light' : 'text-text'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default function MovieInfo({
  director,
  writers,
  cinematography,
  music,
  runtime,
  language,
  country,
  studio,
  released,
}: MovieInfoProps) {
  const rows: { label: string; value: string; link?: boolean }[] = []

  if (director) rows.push({ label: 'Director', value: director, link: true })
  if (writers?.length) {
    rows.push({ label: 'Writers', value: writers.join(', '), link: true })
  }
  if (cinematography) rows.push({ label: 'Cinematography', value: cinematography })
  if (music) rows.push({ label: 'Music', value: music })
  if (runtime != null) rows.push({ label: 'Runtime', value: formatRuntime(runtime) })
  if (language) rows.push({ label: 'Language', value: language })
  if (country) rows.push({ label: 'Country', value: country })
  if (studio) rows.push({ label: 'Studio', value: studio })
  if (released) rows.push({ label: 'Released', value: released })

  return (
    <section className="rounded-xl bg-surface p-5">
      <h3 className="mb-3 font-outfit text-sm font-semibold text-text">Film info</h3>
      <div>
        {rows.map((row) => (
          <InfoRow key={row.label} {...row} />
        ))}
      </div>
    </section>
  )
}

export const DUMMY_MOVIE_INFO: MovieInfoProps = {
  director: 'Charlotte Wells',
  writers: ['Charlotte Wells'],
  cinematography: 'Gregory Oke',
  music: 'Oliver Coates',
  runtime: 102,
  language: 'English',
  country: 'UK / USA',
  studio: 'A24, BBC Film',
  released: 'Oct 28, 2022',
}
