import { notFound } from 'next/navigation'
import Image from 'next/image'
import PersonTabs from './PersonTabs'
import BiographySection from './BiographySection'
import PersonMeta from './PersonMeta'

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

            {/* Meta — client component for translations */}
            <PersonMeta
              name={person.name}
              birthday={person.birthday}
              deathday={person.deathday}
              placeOfBirth={person.placeOfBirth}
              age={age}
              roleLabels={roleLabels}
              knownFor={knownFor}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 xl:px-60 py-10 space-y-10">
        {person.biography && (
          <BiographySection tmdbId={person.tmdbId} biography={person.biography} />
        )}

        <PersonTabs roles={person.roles} />
      </div>
    </main>
  )
}
