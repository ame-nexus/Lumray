import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import cors from 'cors'
import helmet from 'helmet'
import movieRoutes from './routes/movies.routes'
import authRoutes from './routes/auth.routes'
import passport from './config/passport'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use(passport.initialize())

app.use('/api/movies', movieRoutes)
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
