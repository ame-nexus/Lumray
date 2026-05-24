import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
    user?: { id: string; username: string }
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