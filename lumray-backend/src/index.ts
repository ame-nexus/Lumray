import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import cors from 'cors'
import helmet from 'helmet'
import movieRoutes  from './routes/movies.routes'
import authRoutes   from './routes/auth.routes'
import ratingRoutes from './routes/ratings.routes'
import reviewRoutes from './routes/reviews.routes'
import diaryRoutes  from './routes/diary.routes'
import userRoutes   from './routes/users.routes'
import listRoutes   from './routes/lists.routes'
import postRoutes       from './routes/posts.routes'
import filmStatusRoutes from './routes/filmStatus.routes'
import personRoutes     from './routes/persons.routes'
import searchRoutes     from './routes/search.routes'
import passport from './config/passport'
import cron from 'node-cron'
import { syncAll } from './services/sync.service'


const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use(passport.initialize())

app.use('/api/movies',  movieRoutes)
app.use('/api/auth',    authRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/diary',   diaryRoutes)
app.use('/api/users',   userRoutes)
app.use('/api/lists',   listRoutes)
app.use('/api/posts',        postRoutes)
app.use('/api/film-status',  filmStatusRoutes)
app.use('/api/persons',      personRoutes)
app.use('/api/search',       searchRoutes)

setTimeout(() => syncAll().catch(console.error), 6000)

cron.schedule('0 3 * * *', () => { syncAll().catch(console.error) })
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
