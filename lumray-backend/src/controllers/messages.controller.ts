import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { uploadImage } from '../services/cloudinary.service'
import { getIO } from '../socket'

export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id

        const convos = await prisma.conversation.findMany({
            where: { participants: { some: { userId } } },
            orderBy: { updatedAt: 'desc' },
            include: {
                participants: {
                    where: { userId: { not: userId } },
                    include: { user: { select: { id: true, username: true, avatar: true } } },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { content: true, createdAt: true, senderId: true, read: true, attachmentUrl: true },
                },
            },
        })

        const data = convos.map(c => ({
            id: c.id,
            other: c.participants[0]?.user ?? null,
            lastMessage: c.messages[0] ?? null,
            unreadCount: c.messages.filter(m => m.senderId !== userId && !m.read).length,
            updatedAt: c.updatedAt,
        }))

        return res.json({ data, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const count = await prisma.message.count({
            where: {
                senderId: { not: userId },
                read: false,
                conversation: { participants: { some: { userId } } },
            },
        })
        return res.json({ data: { count }, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const startConversation = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { targetUserId } = req.body

        if (!targetUserId) return res.status(400).json({ data: null, error: 'Bad request', message: 'targetUserId required' })
        if (targetUserId === userId) return res.status(400).json({ data: null, error: 'Bad request', message: 'Cannot message yourself' })

        const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } })
        if (!target) return res.status(404).json({ data: null, error: 'Not found', message: 'User not found' })

        // Mutual follow required
        const [iFollow, theyFollow] = await Promise.all([
            prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userId,       followingId: targetUserId } } }),
            prisma.follow.findUnique({ where: { followerId_followingId: { followerId: targetUserId, followingId: userId       } } }),
        ])
        if (!iFollow || !theyFollow) {
            return res.status(403).json({ data: null, error: 'Forbidden', message: 'You can only message users who follow you back' })
        }

        const existing = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: targetUserId } } },
                ],
            },
        })

        if (existing) return res.json({ data: { id: existing.id }, error: null, message: 'ok' })

        const convo = await prisma.conversation.create({
            data: {
                participants: { create: [{ userId }, { userId: targetUserId }] },
            },
        })

        return res.status(201).json({ data: { id: convo.id }, error: null, message: 'Conversation started' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { conversationId } = req.params

        const participant = await prisma.conversationParticipant.findUnique({
            where: { userId_conversationId: { userId, conversationId } },
        })
        if (!participant) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not a participant' })

        const page = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = 50

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: { sender: { select: { id: true, username: true, avatar: true } } },
        })

        await prisma.message.updateMany({
            where: { conversationId, senderId: { not: userId }, read: false },
            data: { read: true },
        })

        return res.json({ data: messages.reverse(), error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { conversationId } = req.params
        const { content, attachmentUrl, attachmentType, movieTmdbId, movieTitle, moviePosterPath } = req.body

        if (!content?.trim() && !attachmentUrl && !movieTmdbId) {
            return res.status(400).json({ data: null, error: 'Bad request', message: 'Message must have content, attachment, or movie reference' })
        }

        const participant = await prisma.conversationParticipant.findUnique({
            where: { userId_conversationId: { userId, conversationId } },
        })
        if (!participant) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not a participant' })

        const [message] = await prisma.$transaction([
            prisma.message.create({
                data: {
                    conversationId,
                    senderId: userId,
                    content: content?.trim() ?? '',
                    attachmentUrl:   attachmentUrl   ?? null,
                    attachmentType:  attachmentType  ?? null,
                    movieTmdbId:     movieTmdbId     ? parseInt(movieTmdbId) : null,
                    movieTitle:      movieTitle       ?? null,
                    moviePosterPath: moviePosterPath  ?? null,
                },
                include: { sender: { select: { id: true, username: true, avatar: true } } },
            }),
            prisma.conversation.update({
                where: { id: conversationId },
                data:  { updatedAt: new Date() },
            }),
        ])

        // Emit to all participants in the conversation room
        try {
            getIO().to(`conversation:${conversationId}`).emit('new_message', message)
        } catch { /* Socket.io not yet ready — response still sent */ }

        return res.status(201).json({ data: message, error: null, message: 'Sent' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const editMessage = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { messageId } = req.params
        const { content } = req.body

        if (!content?.trim()) return res.status(400).json({ data: null, error: 'Bad request', message: 'content required' })

        const existing = await prisma.message.findUnique({ where: { id: messageId } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Message not found' })
        if (existing.senderId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your message' })

        const message = await prisma.message.update({
            where: { id: messageId },
            data:  { content: content.trim() },
            include: { sender: { select: { id: true, username: true, avatar: true } } },
        })

        try { getIO().to(`conversation:${existing.conversationId}`).emit('message_edited', message) } catch { /* socket not ready */ }

        return res.json({ data: message, error: null, message: 'Edited' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { messageId } = req.params

        const existing = await prisma.message.findUnique({ where: { id: messageId } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Message not found' })
        if (existing.senderId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your message' })

        await prisma.message.delete({ where: { id: messageId } })

        try { getIO().to(`conversation:${existing.conversationId}`).emit('message_deleted', { id: messageId, conversationId: existing.conversationId }) } catch { /* socket not ready */ }

        return res.json({ data: { id: messageId }, error: null, message: 'Deleted' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const uploadAttachment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ data: null, error: 'Bad request', message: 'No file provided' })

        const url = await uploadImage(req.file.buffer, 'messages')
        const type = req.file.mimetype.startsWith('image/') ? 'image' : 'file'

        return res.json({ data: { url, type }, error: null, message: 'Uploaded' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
