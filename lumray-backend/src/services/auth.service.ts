import { prisma } from '../lib/prisma'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError'
import { emailService } from './email.service'
import crypto from 'crypto'
import { LoginSchema, RegisterSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../validators/auth.schema'


//sign token for a user
function signToken(user: {
    id: string,
    username: string
}, rememberMe = false) {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: rememberMe ? '30d' : '24h' }
    )
}

function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

//authservice
export const authService = {
    register: async (input: RegisterSchema) => {
        //reject if email or username already taken
        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ email: input.email }, { username: input.username }]
            },
        })
        if (existing) {
            throw new AppError('Email or username already taken', 409)
        }
        //hashing the password
        const passwordHash = await argon2.hash(input.password)

        //email verification
        const code = generateCode()

        //creating the user
        const user = await prisma.user.create({
            data: {
                email: input.email,
                username: input.username,
                passwordHash,
                verificationToken: code,
                tokenExpiry: new Date(Date.now() + 10 * 60 * 1000)
            }
        })

        //send email
        await emailService.sendVerificationCode(input.email, code)

        //return the user
        const { passwordHash: _, verificationToken: __, tokenExpiry: ___, ...safeUser } = user
        return { user: safeUser }
    },

    verifyEmail: async (email: string, code: string) => {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new AppError('User not found', 404)
        if (user.emailVerified) throw new AppError('Email already verified', 400)

        //code matching
        if (user.verificationToken !== code) throw new AppError('Invalid verification code', 400)
        if (!user.tokenExpiry || user.tokenExpiry < new Date()) throw new AppError('Verification code expired', 400)

        //mark verified
        const updated = await prisma.user.update({
            where: { email },
            data: {
                emailVerified: true,
                verificationToken: null,
                tokenExpiry: null
            }
        })

        //sign token
        const token = signToken(updated)
        const { passwordHash: _, verificationToken: __, tokenExpiry: ___, ...safeUser } = updated
        return { user: safeUser, token }
    },
    resendVerification: async (email: string) => {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new AppError('User not found', 404)
        if (user.emailVerified) throw new AppError('Email already verified', 400)

        const code = generateCode()

        await prisma.user.update({
            where: { email },
            data: {
                verificationToken: code,
                tokenExpiry: new Date(Date.now() + 10 * 60 * 1000)
            }
        })
        await emailService.sendVerificationCode(email, code)
        return { message: 'Verification code resent' }
    },

    login: async (input: LoginSchema) => {
        //find the user
        const user = await prisma.user.findUnique({ where: { email: input.email } })

        //no user found or using another way(Oauth)
        if (!user || !user.passwordHash) {
            throw new AppError('Invalid email or password', 401)
        }

        //check the password
        const valid = await argon2.verify(user.passwordHash, input.password)
        if (!valid) {
            throw new AppError('Invalid email or password', 401)
        }

        //block unverified users
        if (!user.emailVerified) throw new AppError('please verify your email', 403)

        //sign token
        const token = signToken(user, input.rememberMe)

        //return the user
        const { passwordHash: _, verificationToken: __, tokenExpiry: ___, ...safeUser } = user
        return { user: safeUser, token }
    },
    getMe: async (userId: string) => {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            throw new AppError('User not found', 404)
        }
        const { passwordHash: _, verificationToken: __, tokenExpiry: ___, ...safeUser } = user
        return safeUser
    },
    forgotPassword: async (input: ForgotPasswordSchema) => {
        const user = await prisma.user.findUnique({ where: { email: input.email } })
        if (!user) return

        const token = crypto.randomBytes(32).toString('hex')

        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            }
        })
        await emailService.sendPasswordResetEmail(user.email, token)
    },

    resetPassword: async (input: ResetPasswordSchema) => {
        const record = await prisma.passwordReset.findUnique({ where: { token: input.token } })
        if (!record) throw new AppError('Invalid or expired reset link', 400)
        if (record.used) throw new AppError('Reset link already used', 400)
        if (record.expiresAt < new Date()) throw new AppError('Reset link has expired', 400)

        const passwordHash = await argon2.hash(input.password)

        await prisma.user.update({
            where: {id: record.userId},
            data: {passwordHash}
        })

        await prisma.passwordReset.update({
            where: {token: input.token},
            data: {used: true}
        })
    }
}