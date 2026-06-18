import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

declare global {
    namespace Express {
        interface User {
            id: string
            username: string
        }
    }
}

export type AuthRequest = Request

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username: string }
        } catch { /* invalid token — treat as guest */ }
    }
    next()
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ data: null, error: 'Unauthorized', message: 'No token provided' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username: string }
        req.user = decoded
        next()
    } catch {
        return res.status(401).json({ data: null, error: 'Unauthorized', message: 'Invalid or expired token' })
    }
}