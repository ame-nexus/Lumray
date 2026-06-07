import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import PersonTabs from './PersonTabs'
import BiographySection from './BiographySection'

interface RoleMovie {
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate: string | null
  detail: string
}

interface RoleGroup {
  job: string
  movies: RoleMovie[]
}

interface PersonDetail {
  tmdbId: number
  name: string
  biography: string | null
  birthday: string | null
  deathday: string | null
  placeOfBirth: string | null
  profilePath: string | null
  roles: RoleGroup[]
}

async function getPerson(id: string): Promise<PersonDetail | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/persons/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function calcAge(birthday: string, deathday?: string | null): number {
  const end = deathday ? new Date(deathday) : new Date()
  const born = new Date(birthday)
  let age = end.getFullYear() - born.getFullYear()
  const m = end.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && end.getDate() < born.getDate())) age--
  return age
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const person = await getPerson(id)
  if (!person) notFound()

  const profileSrc = person.profilePath
    ? `https://image.tmdb.org/t/p/w300${person.profilePath}`
    : null

  // "Known for" = top 5 most-voted movies across all roles
  const knownFor = person.roles
    .flatMap(r => r.movies)
    .filter((m, i, arr) => arr.findIndex(x => x.tmdbId === m.tmdbId) === i)
    .slice(0, 5)

  const roleLabels = person.roles.map(r => r.job)

  const age = person.birthday ? calcAge(person.birthday, person.deathday) : null

  return (
    <main>
      {/* Hero */}
      <div className="relative bg-bg-dark">
        {/* Blurred backdrop from profile image */}
        {profileSrc && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <Image src={profileSrc} alt="" fill className="object-cover object-top blur-2xl scale-110" sizes="100vw" />
          </div>
        )}
        <div className="relative px-6 md:px-12 xl:px-60 py-12">
          <div className="flex gap-8 md:gap-10">

            {/* Profile photo */}
            <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 md:h-64 md:w-44 xl:h-72 xl:w-48">
              {profileSrc ? (
                <Image src={profileSrc} alt={person.name} fill className="object-cover object-top" sizes="192px" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface">
                  <span className="font-outfit text-3xl font-bold text-text-muted">
                    {person.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-end gap-3">
              {/* Role pills */}
              {roleLabels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {roleLabels.map(r => (
                    <span key={r} className="rounded-full border border-purple-deep/60 bg-purple/20 px-3 py-0.5 font-roboto text-xs text-purple-light">
                      {r}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="font-outfit text-3xl font-bold text-white md:text-4xl xl:text-5xl">
                {person.name}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-roboto text-sm text-text-muted">
                {person.birthday && (
                  <span>
                    Born <span className="text-text-dim">{formatDate(person.birthday)}</span>
                    {age !== null && !person.deathday && (
                      <span className="ml-1 text-text-muted">({age} years old)</span>
                    )}
                  </span>
                )}
                {person.deathday && (
                  <span>
                    Died <span className="text-text-dim">{formatDate(person.deathday)}</span>
                    {age !== null && <span className="ml-1">· aged {age}</span>}
                  </span>
                )}
                {person.placeOfBirth && (
                  <span className="text-text-muted">{person.placeOfBirth}</span>
                )}
              </div>

              {/* Known for */}
              {knownFor.length > 0 && (
                <div>
                  <p className="mb-2 font-roboto text-xs uppercase tracking-widest text-text-muted">Known for</p>
                  <div className="flex gap-2">
                    {knownFor.map(m => (
                      <Link key={m.tmdbId} href={`/films/${m.tmdbId}`} className="group relative h-16 w-11 overflow-hidden rounded-md ring-1 ring-white/10 transition-all hover:ring-purple-light">
                        {m.posterPath ? (
                          <Image src={`https://image.tmdb.org/t/p/w185${m.posterPath}`} alt={m.title} fill className="object-cover" sizes="44px" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-surface-2 p-1">
                            <span className="text-center font-roboto text-[8px] text-text-muted line-clamp-3">{m.title}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 xl:px-60 py-10 space-y-10">
        {person.biography && (
          <BiographySection biography={person.biography} />
        )}

        <PersonTabs roles={person.roles} />
      </div>
    </main>
  )
}
