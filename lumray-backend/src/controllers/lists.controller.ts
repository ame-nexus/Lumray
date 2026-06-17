import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getAllPublicLists = async (req: Request, res: Response) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = 24
        const q     = (req.query.q as string | undefined)?.trim()

        const where = {
            isPublic: true,
            ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
        }

        const [lists, total] = await Promise.all([
            prisma.list.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { username: true, avatar: true } },
                    _count: { select: { items: true } },
                    items: {
                        take: 4,
                        orderBy: { order: 'asc' },
                        include: { movie: { select: { posterPath: true, title: true } } },
                    },
                },
            }),
            prisma.list.count({ where }),
        ])

        return res.json({ data: { lists, total, page, totalPages: Math.ceil(total / limit) }, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getListDetail = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        const list = await prisma.list.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, username: true, avatar: true } },
                _count: { select: { items: true } },
                items: {
                    orderBy: { order: 'asc' },
                    include: {
                        movie: {
                            select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true, voteAverage: true, voteCount: true },
                        },
                    },
                },
            },
        })

        if (!list) return res.status(404).json({ data: null, error: 'Not found', message: 'List not found' })
        if (!list.isPublic && list.user.id !== req.user?.id) {
            return res.status(403).json({ data: null, error: 'Forbidden', message: 'This list is private' })
        }

        return res.json({ data: list, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getLists = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query
        if (!userId) return res.status(400).json({ data: null, error: 'Bad request', message: 'userId is required' })

        const includePrivate = req.query.includePrivate === 'true'

        const lists = await prisma.list.findMany({
            where: { userId: String(userId), ...(includePrivate ? {} : { isPublic: true }) },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { items: true } },
                items: {
                    take: 4,
                    orderBy: { order: 'asc' },
                    include: { movie: { select: { posterPath: true } } },
                },
            },
        })

        return res.json({ data: lists, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const createList = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { name, description, isPublic } = req.body

        if (!name?.trim()) return res.status(400).json({ data: null, error: 'Bad request', message: 'name is required' })

        const list = await prisma.list.create({
            data: { userId, name: name.trim(), description: description ?? null, isPublic: isPublic ?? true },
        })

        return res.status(201).json({ data: list, error: null, message: 'List created' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const updateList = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id } = req.params
        const { name, description, isPublic } = req.body

        const existing = await prisma.list.findUnique({ where: { id } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'List not found' })
        if (existing.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your list' })

        const list = await prisma.list.update({
            where: { id },
            data: {
                name: name?.trim() ?? existing.name,
                description: description ?? existing.description,
                isPublic: isPublic ?? existing.isPublic,
            },
        })

        return res.json({ data: list, error: null, message: 'List updated' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const deleteList = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id } = req.params

        const existing = await prisma.list.findUnique({ where: { id } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'List not found' })
        if (existing.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your list' })

        await prisma.list.delete({ where: { id } })

        return res.json({ data: null, error: null, message: 'List deleted' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const addListItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id: listId } = req.params
        const { movieId, notes } = req.body

        if (!movieId) return res.status(400).json({ data: null, error: 'Bad request', message: 'movieId is required' })

        const list = await prisma.list.findUnique({ where: { id: listId } })
        if (!list) return res.status(404).json({ data: null, error: 'Not found', message: 'List not found' })
        if (list.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your list' })

        const count = await prisma.listItem.count({ where: { listId } })

        const item = await prisma.listItem.upsert({
            where: { listId_movieId: { listId, movieId } },
            create: { listId, movieId, order: count, notes: notes ?? null },
            update: { notes: notes ?? null },
        })

        return res.status(201).json({ data: item, error: null, message: 'Film added to list' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getListsByMovie = async (req: Request, res: Response) => {
    try {
        const { movieId } = req.params

        const lists = await prisma.list.findMany({
            where: {
                isPublic: true,
                items: { some: { movieId } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 20,
            include: {
                user: { select: { username: true, avatar: true } },
                _count: { select: { items: true } },
                items: {
                    take: 4,
                    orderBy: { order: 'asc' },
                    include: { movie: { select: { posterPath: true } } },
                },
            },
        })

        return res.json({ data: lists, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const removeListItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id: listId, movieId } = req.params

        const list = await prisma.list.findUnique({ where: { id: listId } })
        if (!list) return res.status(404).json({ data: null, error: 'Not found', message: 'List not found' })
        if (list.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your list' })

        await prisma.listItem.deleteMany({ where: { listId, movieId } })

        return res.json({ data: null, error: null, message: 'Film removed from list' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
