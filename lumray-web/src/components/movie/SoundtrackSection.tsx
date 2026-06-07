'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Pause, Music } from 'lucide-react'

export interface SoundtrackTrack {
  id: string
  name: string
  artist: string
  durationMs: number
  previewUrl: string | null
  trackUrl: string
}

export interface SoundtrackSectionProps {
  tracks: SoundtrackTrack[]
  albumName: string
  albumUrl: string
  albumImage: string | null
  totalTracks: number
}

function SpotifyLogo({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="fill-[#1DB954] shrink-0">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

export default function SoundtrackSection({
  tracks, albumName, albumUrl, albumImage, totalTracks,
}: SoundtrackSectionProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  function togglePlay(track: SoundtrackTrack) {
    if (!track.previewUrl) return

    if (playingId === track.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(track.previewUrl)
    audio.volume = 0.8
    audio.play()
    audio.onended = () => setPlayingId(null)
    audioRef.current = audio
    setPlayingId(track.id)
  }

  if (!tracks.length) return null

  return (
    <section>
      <div className="mb-4 flex items-center justify-between border-b border-text/10 pb-2">
        <h2 className="font-outfit text-lg font-semibold text-text">Soundtrack</h2>
        <Link
          href={albumUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-roboto text-xs text-purple-light underline"
        >
          see full album →
        </Link>
      </div>

      <div className="rounded-xl bg-surface p-3 space-y-2">

        {/* Top tracks */}
        {tracks.map((track) => {
          const isPlaying = playingId === track.id
          const hasPreview = !!track.previewUrl

          return (
            <div
              key={track.id}
              className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2.5"
            >
              {/* Album art */}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-2">
                {albumImage ? (
                  <Image src={albumImage} alt={track.name} fill className="object-cover" sizes="40px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black">
                    <SpotifyLogo size={16} />
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-outfit text-sm font-semibold text-white">
                  {track.name}
                </p>
                <div className="flex items-center gap-1 font-roboto text-xs text-text-muted">
                  <span className="truncate">{track.artist}</span>
                  <span>·</span>
                  {track.trackUrl && (
                    <Link
                      href={track.trackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 hover:text-purple-light"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open in Apple Music
                    </Link>
                  )}
                </div>
              </div>

              {/* Play button */}
              <button
                type="button"
                onClick={() => togglePlay(track)}
                disabled={!hasPreview}
                title={hasPreview ? (isPlaying ? 'Pause' : 'Play 30s preview') : 'No preview available'}
                aria-label={isPlaying ? 'Pause' : 'Play preview'}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform ${
                  hasPreview
                    ? 'bg-purple hover:scale-105 active:scale-95'
                    : 'bg-surface cursor-not-allowed opacity-40'
                }`}
              >
                {isPlaying ? (
                  <Pause size={14} className="fill-white text-white" />
                ) : (
                  <Play size={14} className={`ml-0.5 ${hasPreview ? 'fill-white text-white' : 'fill-text-muted text-text-muted'}`} />
                )}
              </button>
            </div>
          )
        })}

        {/* Album row */}
        <div className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2.5">
          {/* Album art or Spotify logo */}
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-black">
            {albumImage ? (
              <Image src={albumImage} alt={albumName} fill className="object-cover" sizes="36px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <SpotifyLogo size={18} />
              </div>
            )}
          </div>

          {/* Album info */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-outfit text-sm font-semibold text-white">{albumName}</p>
            <p className="font-roboto text-xs text-text-muted">
              {totalTracks} tracks
            </p>
          </div>

          {/* Open album icon */}
          <Link
            href={albumUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text-muted transition-colors hover:text-white"
            aria-label="Open album in Spotify"
          >
            <Music size={14} />
          </Link>
        </div>

      </div>

      {playingId && (
        <p className="mt-2 text-center font-roboto text-[11px] text-text-muted">
          Playing 30s preview · <button onClick={() => { audioRef.current?.pause(); setPlayingId(null) }} className="underline hover:text-white">stop</button>
        </p>
      )}
    </section>
  )
}
