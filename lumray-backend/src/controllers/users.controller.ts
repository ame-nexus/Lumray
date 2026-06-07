import { Request, Response } from 'express'
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

        const thisYear = new Date().getFullYear().toString()
        const thisYearCount = await prisma.diaryEntry.count({
            where: {
                userId: user.id,
                watchedAt: { gte: new Date(`${thisYear}-01-01`) },
            },
        })

        return res.json({
            data: { ...user, thisYearCount },
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
        const { name, bio, avatar, coverImage } = req.body

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name ?? undefined,
                bio: bio ?? undefined,
                avatar: avatar ?? undefined,
                coverImage: coverImage ?? undefined,
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
