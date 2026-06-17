'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

interface Genre { genre: { name: string } }
interface CrewMember {
  job: string
  person: { name: string; tmdbId: number }
}

export interface MovieHeroProps {
  title: string
  tagline?: string | null
  posterPath?: string | null
  backdropPath?: string | null
  releaseDate?: string | null
  runtime?: number | null
  language?: string | null
  voteAverage: number
  voteCount: number
  genres: Genre[]
  crew: CrewMember[]
}

function formatRuntime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatLanguage(code: string): string {
  const map: Record<string, string> = {
    en: 'English', fr: 'French', ja: 'Japanese', ko: 'Korean',
    es: 'Spanish', it: 'Italian', de: 'German', hi: 'Hindi',
    pt: 'Portuguese', zh: 'Chinese', ar: 'Arabic', ru: 'Russian',
  }
  return map[code] ?? code.toUpperCase()
}

export default function MovieHero({
  title, tagline, posterPath, backdropPath, releaseDate,
  runtime, language, voteAverage, voteCount, genres, crew,
}: MovieHeroProps) {
  const router   = useRouter()
  const lang     = useLanguageStore(s => s.lang)
  const t        = useT(lang)
  const director = crew.find(c => c.job === 'Director')
  const year     = releaseDate?.slice(0, 4)
  const stars    = voteAverage / 2  // TMDb is /10, Lumray is /5

  return (
    <section className="relative w-full overflow-hidden min-h-[460px] md:min-h-[540px] flex flex-col justify-end pt-110">
      {/* Backdrop image */}
      <div className="absolute inset-0">
        {backdropPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${backdropPath}`}
            alt={title}
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="h-full w-full bg-bg-dark" />
        )}
        {/* Left-to-right dark fade so text on left is readable */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/30 to-transparent" />
        {/* Bottom fade — blends seamlessly into page background */}
        <div className="absolute inset-0 bg-linear-to-t from-bg from-5% via-bg/40 to-transparent" />
      </div>

      {/* Back button — top-left */}
      <button
        onClick={() => router.back()}
        className="absolute top-5 left-6 z-20 md:left-12 xl:left-60 flex items-center gap-1 rounded-full border border-white/30 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
      >
        <ChevronLeft size={16} />
        {t.movie.back}
      </button>

      {/* Content pinned to bottom */}
      <div className="relative z-10 px-6 pb-10 md:px-12 xl:px-60 md:pb-12">
        <div className="flex gap-6 md:gap-10 items-end">

          {/* Poster */}
          <div className="hidden shrink-0 sm:block">
            <div className="relative w-36 md:w-44 xl:w-62 aspect-2/3 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
              {posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-surface p-3">
                  <span className="text-center font-roboto text-xs text-text-muted">{title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Text info */}
          <div className="flex flex-col gap-3 pb-1">

            {/* Metadata pills row */}
            <div className="flex flex-wrap items-center gap-2 font-roboto text-xs text-text-dim">
              {year && (
                <span className="rounded border border-white/20 px-2 py-0.5 text-white/70">{year}</span>
              )}
              {runtime && runtime > 0 && (
                <>
                  <span className="text-text-muted">•</span>
                  <span>{formatRuntime(runtime)}</span>
                </>
              )}
              {language && (
                <>
                  <span className="text-text-muted">•</span>
                  <span>{formatLanguage(language)}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="font-outfit text-3xl font-bold leading-tight text-white md:text-4xl xl:text-5xl">
              {title}
            </h1>

            {/* Director */}
            {director && (
              <p className="font-roboto text-sm text-text-dim">
                {t.movie.directedBy}{' '}
                <Link
                  href={`/person/${director.person.tmdbId}`}
                  className="font-medium text-purple-light hover:underline"
                >
                  {director.person.name}
                </Link>
              </p>
            )}

            {/* Tagline */}
            {tagline && (
              <p className="font-roboto text-sm italic text-text-muted">
                &ldquo;{tagline}&rdquo;
              </p>
            )}

            {/* Genre tags */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map(g => (
                  <span
                    key={g.genre.name}
                    className="rounded-full border border-purple-deep/60 bg-purple/20 px-3 py-1 font-roboto text-xs text-purple-light"
                  >
                    {g.genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Star rating */}
            {voteAverage > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(stars)
                          ? 'fill-purple-light text-purple-light'
                          : i < stars
                          ? 'fill-purple-light/50 text-purple-light'
                          : 'text-text-muted'
                      }
                    />
                  ))}
                </div>
                <span className="font-roboto text-sm font-semibold text-white">{stars.toFixed(1)}</span>
                {voteCount > 0 && (
                  <span className="font-roboto text-xs text-text-muted">
                    {formatCount(voteCount)} {t.movie.ratings}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
