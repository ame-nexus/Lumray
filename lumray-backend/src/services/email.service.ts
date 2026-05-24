import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const emailService = {
    sendVerificationCode: async (to: string, code: string) => {
        await resend.emails.send({
            from: process.env.RESEND_FROM!,
            to,
            subject: 'Your Lumray verification code',
            html: `
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
                    <h2 style="color: #714ee4;">Verify your email</h2>
                    <p>Your verification code is:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #714ee4; margin: 24px 0;">
                        ${code}
                    </div>
                    <p style="color: #7a7882; font-size: 14px;">This code expires in 10 minutes.</p>
                </div>
            `
        })
    },
    sendPasswordResetEmail: async (to: string, token: string) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
    await resend.emails.send({
        from: process.env.RESEND_FROM!,
        to,
        subject: 'Reset your Lumray password',
        html: `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password. It expires in 1 hour.</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>If you didn't request this, ignore this email.</p>
        `
    })
}

}