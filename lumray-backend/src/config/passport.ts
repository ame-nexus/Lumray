import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from '../lib/prisma'

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback',
    // Render runs behind a proxy — honour X-Forwarded-Proto so the redirect_uri
    // is built as https:// (otherwise Google rejects it as a mismatch).
    proxy: true,
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value
        if (!email) return done(new Error('No email from Google'))

        // find existing account link
        let account = await prisma.account.findUnique({
            where: { provider_providerAccountId: { provider: 'google', providerAccountId: profile.id } },
            include: { user: true }
        })

        if (account) return done(null, account.user)

        // check if user with this email already exists
        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            // new user — create them
            user = await prisma.user.create({
                data: {
                    email,
                    username: profile.displayName.toLowerCase().replace(/\s+/g, '_') + '_' + profile.id.slice(0, 5),
                    emailVerified: true,
                    avatar: profile.photos?.[0].value ?? null,
                }
            })
        }

        // link the Google account
        await prisma.account.create({
            data: {
                userId: user.id,
                provider: 'google',
                providerAccountId: profile.id,
            }
        })

        return done(null, user)
    } catch (err) {
        return done(err)
    }
}))

export default passport
