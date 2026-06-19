import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const emailService = {
    sendVerificationCode: async (to: string, code: string) => {
        await resend.emails.send({
            from: `Lumray <${process.env.RESEND_FROM}>`,
            to,
            subject: 'Your Lumray verification code',
            html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Lumray Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0d0d; color: #f5f5f5;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0d0d; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1a1a1a; border-radius: 8px; padding: 40px; margin: 0 auto; border: 1px solid #333333;">
              
              <tr>
                <td style="text-align: center; padding-bottom: 30px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: 2px;">LUMRAY</h1>
                </td>
              </tr>
              
              <tr>
                <td style="font-size: 16px; line-height: 24px; color: #cccccc; padding-bottom: 20px;">
                  Hi there,
                </td>
              </tr>
              <tr>
                <td style="font-size: 16px; line-height: 24px; color: #cccccc; padding-bottom: 20px;">
                  Welcome to Lumray! We are thrilled to have you join our community. To complete your registration and secure your new account, please use the verification code below.
                </td>
              </tr>
              
              <tr>
                <td align="center" style="padding: 20px 0 30px 0;">
                  <div style="background-color: #2a2a2a; border-radius: 6px; padding: 15px 30px; display: inline-block; border: 1px solid #444444;">
                    <span style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 6px;">${code}</span>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="font-size: 14px; line-height: 22px; color: #888888; padding-bottom: 30px;">
                  This code is valid for the next 10 minutes. If you did not request this email or attempt to sign up for Lumray, you can safely ignore this message. Your information remains secure.
                </td>
              </tr>
              
              <tr>
                <td style="border-top: 1px solid #333333; padding-top: 20px; font-size: 12px; line-height: 18px; color: #666666; text-align: center;">
                  The Lumray Team<br>
                  Azemmour, Morocco
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`,
            text: `Hi there,\n\nWelcome to Lumray! We are thrilled to have you join our community. To complete your registration and secure your new account, please use the verification code below.\n\nYour verification code is: ${code}\n\nThis code is valid for the next 10 minutes. If you did not request this email or attempt to sign up for Lumray, you can safely ignore this message. Your information remains secure.\n\nThe Lumray Team\nAzemmour, Morocco`
        })
    },
    sendPasswordResetEmail: async (to: string, token: string) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
    await resend.emails.send({
        from: `Lumray <${process.env.RESEND_FROM}>`,
        to,
        subject: 'Reset your Lumray password',
        html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Lumray Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0d0d; color: #f5f5f5;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0d0d; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1a1a1a; border-radius: 8px; padding: 40px; margin: 0 auto; border: 1px solid #333333;">
              
              <tr>
                <td style="text-align: center; padding-bottom: 30px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: 2px;">LUMRAY</h1>
                </td>
              </tr>
              
              <tr>
                <td style="font-size: 16px; line-height: 24px; color: #cccccc; padding-bottom: 20px;">
                  Hi there,
                </td>
              </tr>
              <tr>
                <td style="font-size: 16px; line-height: 24px; color: #cccccc; padding-bottom: 20px;">
                  We received a request to reset your Lumray password. Click the button below to choose a new password. This link will expire in 1 hour.
                </td>
              </tr>
              
              <tr>
                <td align="center" style="padding: 20px 0 30px 0;">
                  <a href="${resetUrl}" style="background-color: #714ee4; border-radius: 6px; padding: 15px 30px; display: inline-block; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border: 1px solid #5a3bc2;">
                    Reset Password
                  </a>
                </td>
              </tr>
              
              <tr>
                <td style="font-size: 14px; line-height: 22px; color: #888888; padding-bottom: 30px;">
                  If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
                </td>
              </tr>
              
              <tr>
                <td style="border-top: 1px solid #333333; padding-top: 20px; font-size: 12px; line-height: 18px; color: #666666; text-align: center;">
                  The Lumray Team<br>
                  Azemmour, Morocco
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`,
        text: `Hi there,\n\nWe received a request to reset your Lumray password. Please use the link below to choose a new password. This link will expire in 1 hour.\n\nReset Password Link: ${resetUrl}\n\nIf you didn't request a password reset, you can safely ignore this email. Your account remains secure.\n\nThe Lumray Team\nAzemmour, Morocco`
    })
}

}