import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                avatar: true,
                coverImage: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        diaryEntries: true,
                        reviews: true,
                    },
                },
            },
        })

        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        // "Films" = distinct films watched (not raw diary rows), matching the Films tab.
        const yearStart = new Date(`${new Date().getFullYear()}-01-01`)
        const [distinctMovies, distinctThisYear] = await Promise.all([
            prisma.diaryEntry.groupBy({ by: ['movieId'], where: { userId: user.id } }),
            prisma.diaryEntry.groupBy({ by: ['movieId'], where: { userId: user.id, watchedAt: { gte: yearStart } } }),
        ])

        return res.json({
            data: {
                ...user,
                _count: { ...user._count, diaryEntries: distinctMovies.length },
                thisYearCount: distinctThisYear.length,
            },
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { name, username, bio, avatar, coverImage } = req.body

        if (username !== undefined) {
            const trimmed = String(username).trim().toLowerCase()
            if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) {
                return res.status(400).json({ data: null, error: 'Bad request', message: 'Username must be 3–20 chars: letters, numbers, underscores only' })
            }
            const taken = await prisma.user.findFirst({ where: { username: trimmed, NOT: { id: userId } } })
            if (taken) {
                return res.status(409).json({ data: null, error: 'Conflict', message: 'Username already taken' })
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name:        name        !== undefined ? String(name).trim()        : undefined,
                username:    username    !== undefined ? String(username).trim().toLowerCase() : undefined,
                bio:         bio         !== undefined ? String(bio).trim()         : undefined,
                avatar:      avatar      !== undefined ? String(avatar).trim()      : undefined,
                coverImage:  coverImage  !== undefined ? String(coverImage).trim()  : undefined,
            },
            select: {
                id: true, username: true, name: true, bio: true,
                avatar: true, coverImage: true, email: true,
                emailVerified: true, points: true, level: true,
            },
        })

        return res.json({ data: user, error: null, message: 'Profile updated' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const followUser = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = req.user!.id
        const followingId = req.params.id

        if (followerId === followingId) {
            return res.status(400).json({ data: null, error: 'Bad request', message: 'Cannot follow yourself' })
        }

        await prisma.follow.upsert({
            where: { followerId_followingId: { followerId, followingId } },
            create: { followerId, followingId },
            update: {},
        })

        return res.json({ data: null, error: null, message: 'Followed' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const unfollowUser = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = req.user!.id
        const followingId = req.params.id

        await prisma.follow.deleteMany({ where: { followerId, followingId } })

        return res.json({ data: null, error: null, message: 'Unfollowed' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserFilms = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const page  = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = Math.min(60, parseInt(req.query.limit as string) || 24)
        const sort  = (req.query.sort as string) || 'newest'

        // Filter params from FilterModal
        const genresParam    = req.query.fg as string | undefined
        const decadesParam   = req.query.fd as string | undefined
        const languagesParam = req.query.fl as string | undefined
        const runtimeParam   = req.query.fr as string | undefined

        const genres    = genresParam    ? genresParam.split(',').map(s => s.trim()).filter(Boolean)    : []
        const decades   = decadesParam   ? decadesParam.split(',').map(s => s.trim()).filter(Boolean)   : []
        const languages = languagesParam ? languagesParam.split(',').map(s => s.trim()).filter(Boolean) : []
        const runtimes  = runtimeParam   ? runtimeParam.split(',').map(s => s.trim()).filter(Boolean)   : []

        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        // Build movie-level AND conditions
        const movieAnd: Prisma.MovieWhereInput[] = []

        if (genres.length) {
            movieAnd.push({ genres: { some: { genre: { name: { in: genres } } } } })
        }

        // Decade → expand to individual years
        const yearStarts: string[] = []
        for (const d of decades) {
            const start = parseInt(d) // "2010s" → 2010
            if (!isNaN(start)) {
                for (let y = start; y < start + 10; y++) yearStarts.push(String(y))
            }
        }
        if (yearStarts.length) {
            movieAnd.push({ OR: yearStarts.map(y => ({ releaseDate: { startsWith: y } })) } as Prisma.MovieWhereInput)
        }

        if (languages.length) {
            movieAnd.push({ language: { in: languages } })
        }

        if (runtimes.length) {
            const RUNTIME_RANGES: Record<string, Prisma.MovieWhereInput> = {
                'under90':  { runtime: { lte: 90 } },
                '90to120':  { runtime: { gte: 90,  lte: 120 } },
                '120to180': { runtime: { gte: 120, lte: 180 } },
                'over180':  { runtime: { gte: 180 } },
            }
            const rConds = runtimes.map(r => RUNTIME_RANGES[r]).filter(Boolean)
            if (rConds.length) movieAnd.push({ OR: rConds } as Prisma.MovieWhereInput)
        }

        const where = {
            userId: user.id,
            ...(movieAnd.length ? { movie: { AND: movieAnd } } : {}),
        }

        type OrderBy = { watchedAt?: 'asc' | 'desc' } | { movie: { title: 'asc' | 'desc' } }
        const orderBy: OrderBy =
            sort === 'oldest' ? { watchedAt: 'asc' } :
            sort === 'a-z'    ? { movie: { title: 'asc' } } :
            sort === 'z-a'    ? { movie: { title: 'desc' } } :
                                { watchedAt: 'desc' }

        const [entries, total] = await Promise.all([
            prisma.diaryEntry.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                distinct: ['movieId'],
                select: {
                    movieId: true,
                    rating: true,
                    movie: { select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true } },
                },
            }),
            prisma.diaryEntry.groupBy({
                by: ['movieId'],
                where,
            }).then(r => r.length),
        ])

        const films = entries.map(e => ({
            id: e.movie.id,
            tmdbId: e.movie.tmdbId,
            title: e.movie.title,
            posterPath: e.movie.posterPath,
            year: e.movie.releaseDate?.slice(0, 4) ?? null,
            rating: e.rating,
        }))

        return res.json({ data: { films, total, page, totalPages: Math.ceil(total / limit) }, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserDiary = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const page  = req.query.page ? Math.max(1, parseInt(req.query.page as string)) : null
        const limit = Math.min(200, parseInt(req.query.limit as string) || (page ? 20 : 200))

        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        const where = { userId: user.id }

        const [entries, total] = await Promise.all([
            prisma.diaryEntry.findMany({
                where,
                orderBy: { watchedAt: 'desc' },
                ...(page ? { skip: (page - 1) * limit, take: limit } : { take: limit }),
                select: {
                    id: true,
                    watchedAt: true,
                    rating: true,
                    isRewatch: true,
                    movie: { select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true } },
                },
            }),
            page ? prisma.diaryEntry.count({ where }) : Promise.resolve(0),
        ])

        if (page) {
            return res.json({ data: { entries, total, page, totalPages: Math.ceil(total / limit) }, error: null, message: 'ok' })
        }
        return res.json({ data: entries, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { username } = req.params
        const page  = req.query.page ? Math.max(1, parseInt(req.query.page as string)) : null
        const limit = Math.min(50, parseInt(req.query.limit as string) || (page ? 10 : 5))

        const profileUser = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, avatar: true } })
        if (!profileUser) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        const where = { userId: profileUser.id }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                ...(page ? { skip: (page - 1) * limit, take: limit } : { take: limit }),
                select: {
                    id: true,
                    content: true,
                    rating: true,
                    createdAt: true,
                    userId: true,
                    _count: { select: { reviewLikes: true, comments: true } },
                    movie: { select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true } },
                },
            }),
            page ? prisma.review.count({ where }) : Promise.resolve(0),
        ])

        let likedSet = new Set<string>()
        if (req.user?.id) {
            const liked = await prisma.reviewLike.findMany({
                where: { userId: req.user.id, reviewId: { in: reviews.map(r => r.id) } },
                select: { reviewId: true },
            })
            likedSet = new Set(liked.map(l => l.reviewId))
        }

        const mapped = reviews.map(r => ({
            ...r,
            _count: { likes: r._count.reviewLikes, comments: r._count.comments },
            user: { id: profileUser.id, username: profileUser.username, avatar: profileUser.avatar },
            isLiked: likedSet.has(r.id),
        }))

        if (page) {
            return res.json({ data: { reviews: mapped, total, page, totalPages: Math.ceil(total / limit) }, error: null, message: 'ok' })
        }
        return res.json({ data: mapped, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserFavourites = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const limit = parseInt(req.query.limit as string) || 0

        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        const likes = await prisma.movieLike.findMany({
            where: { userId: user.id },
            ...(limit > 0 ? { take: limit } : {}),
            select: {
                movie: { select: { id: true, tmdbId: true, title: true, posterPath: true } },
            },
        })

        const favourites = likes.map(l => ({
            id: l.movie.id,
            tmdbId: l.movie.tmdbId,
            title: l.movie.title,
            posterPath: l.movie.posterPath,
        }))

        return res.json({ data: favourites, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

const BADGE_META: Record<string, { label: string; emoji: string; description: string }> = {
    'first_watch':    { label: 'First Watch',    emoji: '🎬', description: 'Logged your first film' },
    'critic':         { label: 'Critic',         emoji: '✍️', description: '10 reviews written' },
    'binge_watcher':  { label: 'Binge Watcher',  emoji: '📺', description: 'Watched 50 films' },
    'cinephile':      { label: 'Cinephile',       emoji: '🎞️', description: 'Watched 100 films' },
    'on_a_roll':      { label: 'On A Roll',       emoji: '🔥', description: '7 day streak' },
    'drama_king':     { label: 'Drama King',      emoji: '🎭', description: '20 dramas watched' },
    'horror_fiend':   { label: 'Horror Fiend',    emoji: '👻', description: '10 horrors watched' },
    'list_maker':     { label: 'List Maker',      emoji: '📋', description: 'Created 5 lists' },
    'social_butterfly': { label: 'Social',        emoji: '🦋', description: 'Following 10 users' },
}

export const getUserStats = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        const now = new Date()
        const yearStart  = new Date(`${now.getFullYear()}-01-01`)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const [ratings, allDiaryDates, totalEntries, thisYear, thisMonth, rewatches, distinctMovies, firstEntry, userBadges] = await Promise.all([
            prisma.rating.findMany({ where: { userId: user.id }, select: { score: true } }),
            prisma.diaryEntry.findMany({ where: { userId: user.id }, orderBy: { watchedAt: 'asc' }, select: { watchedAt: true } }),
            prisma.diaryEntry.count({ where: { userId: user.id } }),
            prisma.diaryEntry.count({ where: { userId: user.id, watchedAt: { gte: yearStart } } }),
            prisma.diaryEntry.count({ where: { userId: user.id, watchedAt: { gte: monthStart } } }),
            prisma.diaryEntry.count({ where: { userId: user.id, isRewatch: true } }),
            prisma.diaryEntry.groupBy({ by: ['movieId'], where: { userId: user.id } }).then(r => r.length),
            prisma.diaryEntry.findFirst({ where: { userId: user.id }, orderBy: { watchedAt: 'asc' }, select: { watchedAt: true } }),
            prisma.userBadge.findMany({ where: { userId: user.id } }),
        ])

        const totalRatings = ratings.length
        const avgRating    = totalRatings > 0 ? ratings.reduce((s, r) => s + r.score, 0) / totalRatings : 0
        const distribution = [1, 2, 3, 4, 5].map(star =>
            ratings.filter(r => Math.round(r.score) === star).length,
        )

        let avgPerMonth = 0
        if (firstEntry) {
            const monthsElapsed = Math.max(1, (now.getTime() - firstEntry.watchedAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
            avgPerMonth = parseFloat((totalEntries / monthsElapsed).toFixed(1))
        }

        const daySet = new Set(allDiaryDates.map(e => e.watchedAt.toISOString().slice(0, 10)))

        let currentStreak = 0
        const checkDate = new Date()
        while (true) {
            const key = checkDate.toISOString().slice(0, 10)
            if (daySet.has(key)) {
                currentStreak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }

        const sortedDays = [...daySet].sort()
        let personalBest = currentStreak
        let cur = 1
        for (let i = 1; i < sortedDays.length; i++) {
            const prev = new Date(sortedDays[i - 1])
            const curr = new Date(sortedDays[i])
            const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
            cur = diff === 1 ? cur + 1 : 1
            if (cur > personalBest) personalBest = cur
        }

        const weekMonday = new Date(now)
        weekMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
        weekMonday.setHours(0, 0, 0, 0)
        const activeDayIndices: number[] = []
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekMonday)
            day.setDate(weekMonday.getDate() + i)
            if (daySet.has(day.toISOString().slice(0, 10))) activeDayIndices.push(i)
        }

        const badges = userBadges.map(b => ({
            id: b.badge,
            label:       BADGE_META[b.badge]?.label       ?? b.badge,
            emoji:       BADGE_META[b.badge]?.emoji       ?? '🏅',
            description: BADGE_META[b.badge]?.description ?? '',
        }))

        return res.json({
            data: {
                rating:  { average: parseFloat(avgRating.toFixed(2)), totalRatings, distribution },
                diary:   { totalFilms: distinctMovies, thisYear, thisMonth, rewatches, firstWatches: Math.max(0, totalEntries - rewatches), avgPerMonth },
                streak:  { currentStreak, personalBest, activeDayIndices },
                badges,
            },
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserActivity = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        const [diaryEntries, reviews, follows] = await Promise.all([
            prisma.diaryEntry.findMany({
                where: { userId: user.id },
                orderBy: { watchedAt: 'desc' },
                take: 5,
                select: { id: true, watchedAt: true, rating: true, movie: { select: { title: true } } },
            }),
            prisma.review.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, createdAt: true, movie: { select: { title: true } } },
            }),
            prisma.follow.findMany({
                where: { followerId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { createdAt: true, following: { select: { username: true } } },
            }),
        ])

        type Item = { id: string; type: 'logged' | 'reviewed' | 'added' | 'followed'; text: string; createdAt: string }

        const items: Item[] = [
            ...diaryEntries.map(e => ({
                id: `diary-${e.id}`,
                type: 'logged' as const,
                text: `Logged ${e.movie.title}${e.rating ? ` and gave it ${e.rating} stars` : ''}`,
                createdAt: e.watchedAt.toISOString(),
            })),
            ...reviews.map(r => ({
                id: `review-${r.id}`,
                type: 'reviewed' as const,
                text: `Wrote a review for ${r.movie.title}`,
                createdAt: r.createdAt.toISOString(),
            })),
            ...follows.map(f => ({
                id: `follow-${f.following.username}`,
                type: 'followed' as const,
                text: `Started following @${f.following.username}`,
                createdAt: f.createdAt.toISOString(),
            })),
        ]

        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return res.json({ data: items.slice(0, 8), error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getMyFollowing = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const follows = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: { select: { id: true, username: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return res.json({
            data: follows.map(f => f.following),
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getMutualFollows = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        // People I follow who also follow me back
        const follows = await prisma.follow.findMany({
            where: {
                followerId: userId,
                following: {
                    following: { some: { followingId: userId } },
                },
            },
            include: {
                following: { select: { id: true, username: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return res.json({
            data: follows.map(f => f.following),
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserFollowingList = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        const follows = await prisma.follow.findMany({
            where: { followerId: user.id },
            include: { following: { select: { id: true, username: true, avatar: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return res.json({ data: follows.map(f => f.following), error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserFollowersList = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        const follows = await prisma.follow.findMany({
            where: { followingId: user.id },
            include: { follower: { select: { id: true, username: true, avatar: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return res.json({ data: follows.map(f => f.follower), error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserWatchlist = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const limit = Math.min(100, parseInt((req.query.limit as string) || '8') || 8)
        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        const rows = await prisma.watchlist.findMany({
            where: { userId: user.id },
            orderBy: { addedAt: 'desc' },
            take: limit,
            include: { movie: { select: { id: true, tmdbId: true, title: true, posterPath: true } } },
        })
        return res.json({ data: rows.map(r => r.movie), error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUserFriends = async (req: Request, res: Response) => {
    try {
        const { username } = req.params
        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
        if (!user) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        // Mutual follows: people this user follows who also follow them back
        const follows = await prisma.follow.findMany({
            where: {
                followerId: user.id,
                following: { following: { some: { followingId: user.id } } },
            },
            include: { following: { select: { id: true, username: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            take: 8,
        })
        return res.json({ data: follows.map(f => f.following), error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getFollowStatus = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = req.user!.id
        const followingId = req.params.id

        const follow = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        })

        return res.json({ data: { isFollowing: !!follow }, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
