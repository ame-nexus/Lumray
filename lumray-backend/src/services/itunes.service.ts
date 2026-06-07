import axios from 'axios'

const itunes = axios.create({ timeout: 10000 })

interface ItunesAlbum {
    collectionId: number
    collectionName: string
    artistName:    string
    artworkUrl100: string
    trackCount:    number
    collectionViewUrl: string
    releaseDate?:  string
}

interface ItunesTrack {
    wrapperType:      string
    kind:             string
    trackId:          number
    trackName:        string
    artistName:       string
    previewUrl:       string | null
    trackTimeMillis:  number
    trackViewUrl:     string
    trackNumber:      number
}

interface ItunesSearchResult {
    results: (ItunesAlbum | ItunesTrack)[]
}

export interface ItunesTrackResult {
    id:         string
    name:       string
    artist:     string
    durationMs: number
    previewUrl: string | null
    trackUrl:   string
}

function artworkUrl(url: string, size = 300): string {
    return url.replace('100x100', `${size}x${size}`)
}

// Strip articles, punctuation and lowercase for comparison
function normalize(s: string): string {
    return s
        .toLowerCase()
        .replace(/[''`]/g, '')           // smart quotes / apostrophes
        .replace(/[^a-z0-9\s]/g, ' ')   // punctuation → space
        .replace(/\b(the|a|an)\b/g, '')  // leading/trailing articles
        .replace(/\s+/g, ' ')
        .trim()
}

// How many significant words of `query` appear in `target`
function wordOverlapRatio(query: string, target: string): number {
    const qWords = query.split(' ').filter(w => w.length > 2)
    if (qWords.length === 0) return 0
    const tSet = new Set(target.split(' '))
    const hits = qWords.filter(w => tSet.has(w)).length
    return hits / qWords.length
}

function scoreAlbum(album: ItunesAlbum, normTitle: string, year?: string): number {
    const normName = normalize(album.collectionName)
    const rawName  = album.collectionName.toLowerCase()

    // Require meaningful title overlap
    const overlap = wordOverlapRatio(normTitle, normName)
    if (overlap === 0 && !normName.includes(normTitle)) return -Infinity

    let score = overlap * 10  // 0-10 pts for title overlap

    // Soundtrack type keywords — ordered by specificity
    if (rawName.includes('original score'))                       score += 8
    if (rawName.includes('original motion picture soundtrack'))   score += 7
    if (rawName.includes('motion picture soundtrack'))            score += 6
    if (rawName.includes('original soundtrack'))                  score += 5
    if (rawName.includes('soundtrack'))                           score += 3
    if (rawName.includes('music from'))                           score += 2
    if (rawName.includes(' ost'))                                 score += 2

    // Penalise non-score releases
    if (rawName.includes('inspired by'))   score -= 6
    if (rawName.includes('songs from'))    score -= 3
    if (rawName.includes('deluxe'))        score -= 1  // usually not the primary release

    // Year proximity (allow ±1 year for delayed releases)
    if (year) {
        const targetYear  = parseInt(year)
        const albumYear   = parseInt(album.releaseDate?.slice(0, 4) ?? '0')
        const diff        = Math.abs(albumYear - targetYear)
        if (diff === 0)   score += 4
        else if (diff === 1) score += 1
        else if (diff > 3)   score -= 2
    }

    // Real soundtracks usually have 8+ tracks
    if (album.trackCount >= 15) score += 2
    else if (album.trackCount >= 8) score += 1
    else if (album.trackCount <= 3) score -= 3

    return score
}

export const itunesService = {
    async getSoundtrack(movieTitle: string, year?: string): Promise<{
        tracks:      ItunesTrackResult[]
        albumName:   string
        albumUrl:    string
        albumImage:  string | null
        totalTracks: number
    } | null> {
        try {
            const normTitle = normalize(movieTitle)

            // Multiple query strategies — most specific first
            const queries = [
                `${movieTitle} original motion picture score`,
                `${movieTitle} original score`,
                `${movieTitle} original soundtrack`,
                `${movieTitle} soundtrack`,
                normTitle,  // bare normalised title as last resort
            ]

            const seen    = new Set<number>()
            const candidates: { album: ItunesAlbum; score: number }[] = []

            for (const q of queries) {
                let res: ItunesSearchResult
                try {
                    const { data } = await itunes.get<ItunesSearchResult>(
                        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=15&media=music`
                    )
                    res = data
                } catch {
                    continue
                }

                for (const item of res.results as ItunesAlbum[]) {
                    if (seen.has(item.collectionId)) continue
                    seen.add(item.collectionId)

                    const s = scoreAlbum(item, normTitle, year)
                    if (s > -Infinity) candidates.push({ album: item, score: s })
                }
            }

            if (candidates.length === 0) return null

            candidates.sort((a, b) => b.score - a.score)

            // Require a minimum score to avoid garbage results
            if (candidates[0].score < 3) return null

            const album = candidates[0].album

            // Fetch album tracks
            const { data: trackData } = await itunes.get<ItunesSearchResult>(
                `https://itunes.apple.com/lookup?id=${album.collectionId}&entity=song`
            )

            const tracks = (trackData.results as ItunesTrack[])
                .filter(r =>
                    r.wrapperType === 'track' &&
                    r.kind === 'song' &&
                    (r.trackTimeMillis ?? 0) > 30_000  // skip very short interludes
                )
                .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))  // album order
                .slice(0, 3)
                .map(t => ({
                    id:         String(t.trackId),
                    name:       t.trackName,
                    artist:     t.artistName,
                    durationMs: t.trackTimeMillis ?? 0,
                    previewUrl: t.previewUrl ?? null,
                    trackUrl:   t.trackViewUrl ?? album.collectionViewUrl,
                }))

            return {
                tracks,
                albumName:   album.collectionName,
                albumUrl:    album.collectionViewUrl,
                albumImage:  artworkUrl(album.artworkUrl100, 300),
                totalTracks: album.trackCount,
            }
        } catch {
            return null
        }
    },
}
