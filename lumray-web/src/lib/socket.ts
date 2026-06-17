import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'

let socket: Socket | null = null

export function getSocket(): Socket {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API_URL!, { autoConnect: false })
    }
    return socket
}

export function connectSocket(): Socket {
    const s = getSocket()
    // Always attach the current JWT (from the auth store, not localStorage) before connecting
    s.auth = { token: useAuthStore.getState().token }
    if (!s.connected) s.connect()
    return s
}

export function disconnectSocket() {
    socket?.disconnect()
    socket = null
}
