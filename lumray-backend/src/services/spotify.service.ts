import axios from 'axios'

interface SpotifyToken {
    access_token: string
    expires_at: number
}

let cached: SpotifyToken | null = null

async function getToken(): Promise<string> {
    if (cached && Date.now() < cached.expires_at - 30_000) {
        return cached.access_token
    }

    const clientId     = process.env.SPOTIFY_CLIENT_ID!
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
    const credentials  = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const { data } = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    )

    cached = {
        access_token: data.access_token,
        expires_at: Date.now() + data.expires_in * 1000,
    }

    return cached.access_token
}

async function spotifyGet<T>(path: string): Promise<T> {
    const token = await getToken()
    const { data } = await axios.get<T>(`https://api.spotify.com/v1${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return data
}

export interface SpotifyTrack {
    id: string
    name: string
    artist: string
    durationMs: number
    previewUrl: string | null
    spotifyUrl: string
    albumName: string
    albumImage: string | null
}

interface SpotifyAlbum {
    id: string
    name: string
    images: { url: string; width: number }[]
    external_urls: { spotify: string }
}

interface SearchResult {
    albums: {
        items: SpotifyAlbum[]
    }
}

interface TracksResult {
    items: {
        id: string
        name: string
        duration_ms: number
        preview_url: string | null
        external_urls: { spotify: string }
        artists: { name: string }[]
    }[]
}

interface TrackDetails {
    tracks: {
        id: string
        popularity: number
        preview_url: string | null
    }[]
}

export const spotifyService = {
    async getSoundtrack(movieTitle: string): Promise<{ tracks: SpotifyTrack[]; albumName: string; albumUrl: string; albumImage: string | null; totalTracks: number } | null> {
        try {
            // Search for the soundtrack album
            const queries = [
                `${movieTitle} original motion picture soundtrack`,
                `${movieTitle} original soundtrack`,
                `${movieTitle} soundtrack`,
            ]

            let album: SpotifyAlbum | null = null

            for (const q of queries) {
                const result = await spotifyGet<SearchResult>(
                    `/search?q=${encodeURIComponent(q)}&type=album&limit=5`
                )

                // Find best match: album name contains the movie title (case-insensitive)
                const titleLower = movieTitle.toLowerCase()
                album = result.albums.items.find(a =>
                    a.name.toLowerCase().includes(titleLower)
                ) ?? result.albums.items[0] ?? null

                if (album) break
            }

            if (!album) return null

            const tracks = await spotifyGet<TracksResult>(`/albums/${album.id}/tracks?limit=20`)

            // Fetch popularity for all tracks so we can sort by it
            const ids = tracks.items.map(t => t.id).join(',')
            const details = await spotifyGet<TrackDetails>(`/tracks?ids=${ids}`)
            const popularityMap = new Map(details.tracks.map(t => [t.id, t.popularity]))
            const previewMap    = new Map(details.tracks.map(t => [t.id, t.preview_url]))

            const sorted = [...tracks.items]
                .sort((a, b) => (popularityMap.get(b.id) ?? 0) - (popularityMap.get(a.id) ?? 0))
                .slice(0, 3)

            return {
                albumName:  album.name,
                albumUrl:   album.external_urls.spotify,
                totalTracks: tracks.items.length,
                albumImage: album.images[0]?.url ?? null,
                tracks: sorted.map(t => ({
                    id: t.id,
                    name: t.name,
                    artist: t.artists.map((a: { name: string }) => a.name).join(', '),
                    durationMs: t.duration_ms,
                    previewUrl: previewMap.get(t.id) ?? t.preview_url,
                    spotifyUrl: t.external_urls.spotify,
                    albumName:  album.name,
                    albumImage: album.images[0]?.url ?? null,
                })),
            }
        } catch {
            return null
        }
    },
}
