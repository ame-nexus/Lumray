import { Router } from 'express'
import { register, login, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import passport from '../config/passport'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/verify-email', verifyEmail)
router.post('/resend-verification', resendVerification)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.get('/google',
    passport.authenticate('google', { scope: ['email', 'profile'], session: false })
)
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
    (req, res) => {
        const user = req.user as { id: string; username: string }
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: '30d' }
        )
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
    }
)

router.get('/me', authenticate, getMe)

export default router