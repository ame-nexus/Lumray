import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.schema'
import { AppError } from '../utils/AppError'
import type { AuthRequest } from '../middleware/auth.middleware'

export const register = async (req: Request, res: Response) => {
    try {
        const parsed = registerSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ data: null, error: parsed.error.issues[0].message, message: 'Validation failed' })
        }
        const result = await authService.register(parsed.data)
        return res.status(201).json({ data: result, error: null, message: 'Account created' })
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ data: null, error: err.message, message: err.message })
        return res.status(500).json({ data: null, error: 'Server error', message: String(err) })
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body
        if (!email || !code) return res.status(400).json({ data: null, error: 'Email and code are required', message: 'Validation failed' })
        const result = await authService.verifyEmail(email, code)
        return res.status(200).json({ data: result, error: null, message: 'Email verified' })
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ data: null, error: err.message, message: err.message })
        return res.status(500).json({ data: null, error: 'Server error', message: String(err) })
    }
}

export const resendVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ data: null, error: 'Email is required', message: 'Validation failed' })
        const result = await authService.resendVerification(email)
        return res.status(200).json({ data: result, error: null, message: 'Code resent' })
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ data: null, error: err.message, message: err.message })
        return res.status(500).json({ data: null, error: 'Server error', message: String(err) })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const parsed = loginSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ data: null, error: parsed.error.issues[0].message, message: 'Validation failed' })
        }
        const result = await authService.login(parsed.data)
        return res.status(200).json({ data: result, error: null, message: 'Logged in' })
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ data: null, error: err.message, message: err.message })
        return res.status(500).json({ data: null, error: 'Server error', message: String(err) })
    }
}

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await authService.getMe((req as AuthRequest).user!.id)
        return res.status(200).json({ data: user, error: null, message: 'ok' })
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ data: null, error: err.message, message: err.message })
        return res.status(500).json({ data: null, error: 'Server error', message: String(err) })
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ data: null, error: parsed.error.issues[0].message, message: 'Validation error' })
        }
        await authService.forgotPassword(parsed.data)
        return res.json({ data: null, error: null, message: 'If that email exists, a reset link has been sent' })
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ data: null, error: err.message, message: 'Error' })
        return res.status(500).json({ data: null, error: 'Server error', message: String(err) })
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ data: null, error: parsed.error.issues[0].message, message: 'Validation error' })
        }
        await authService.resetPassword(parsed.data)
        return res.json({ data: null, error: null, message: 'Password reset successfully' })
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ data: null, error: err.message, message: 'Error' })
        return res.status(500).json({ data: null, error: 'Server error', message: String(err) })
    }
}
