import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import { prisma } from './lib/prisma'

const onlineUsers = new Map<string, Set<string>>()

let _io: Server | null = null

export function getIO(): Server {
    if (!_io) throw new Error('Socket.io not initialized')
    return _io
}

export function isUserOnline(userId: string): boolean {
    const sockets = onlineUsers.get(userId)
    return (sockets?.size ?? 0) > 0
}

export function initSocket(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: { origin: process.env.CLIENT_URL, credentials: true },
    })
    _io = io

    io.use((socket, next) => {
        const token = socket.handshake.auth.token as string | undefined
        if (!token) return next(new Error('Unauthorized'))
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username: string }
            socket.data.userId   = decoded.id
            socket.data.username = decoded.username
            next()
        } catch {
            next(new Error('Unauthorized'))
        }
    })

    io.on('connection', async (socket) => {
        const userId   = socket.data.userId   as string
        const username = socket.data.username as string

        // Track online presence
        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set())
        onlineUsers.get(userId)!.add(socket.id)
        socket.broadcast.emit('user_online', { userId })

        // Seed the newcomer with everyone who is already online
        socket.emit('online_users', [...onlineUsers.keys()])

        // Auto-join all existing conversation rooms
        try {
            const participations = await prisma.conversationParticipant.findMany({
                where: { userId },
                select: { conversationId: true },
            })
            for (const { conversationId } of participations) {
                socket.join(`conversation:${conversationId}`)
            }
        } catch { /* non-fatal */ }

        // Client joins a newly created conversation room
        socket.on('join_conversation', (conversationId: string) => {
            socket.join(`conversation:${conversationId}`)
        })

        // Typing indicators
        socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
            socket.to(`conversation:${conversationId}`).emit('typing_start', {
                conversationId,
                userId,
                username,
            })
        })

        socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
            socket.to(`conversation:${conversationId}`).emit('typing_stop', {
                conversationId,
                userId,
            })
        })

        // Read receipts — mark incoming messages read and notify the sender
        socket.on('mark_read', async ({ conversationId }: { conversationId: string }) => {
            try {
                const { count } = await prisma.message.updateMany({
                    where: { conversationId, senderId: { not: userId }, read: false },
                    data: { read: true },
                })
                if (count > 0) {
                    socket.to(`conversation:${conversationId}`).emit('messages_read', {
                        conversationId,
                        readerId: userId,
                    })
                }
            } catch { /* non-fatal */ }
        })

        socket.on('disconnect', () => {
            const sockets = onlineUsers.get(userId)
            if (sockets) {
                sockets.delete(socket.id)
                if (sockets.size === 0) {
                    onlineUsers.delete(userId)
                    socket.broadcast.emit('user_offline', { userId })
                }
            }
        })
    })

    return io
}
