import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import movieRoutes  from './routes/movies.routes'
import authRoutes   from './routes/auth.routes'
import ratingRoutes from './routes/ratings.routes'
import reviewRoutes from './routes/reviews.routes'
import diaryRoutes  from './routes/diary.routes'
import userRoutes   from './routes/users.routes'
import listRoutes   from './routes/lists.routes'
import postRoutes       from './routes/posts.routes'
import messageRoutes    from './routes/messages.routes'
import filmStatusRoutes from './routes/filmStatus.routes'
import personRoutes     from './routes/persons.routes'
import searchRoutes     from './routes/search.routes'
import uploadRoutes     from './routes/upload.routes'
import passport from './config/passport'
import cron from 'node-cron'
import { syncAll } from './services/sync.service'
import { initSocket } from './socket'


const app = express()
const httpServer = createServer(app)

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
app.use('/api/messages',    messageRoutes)
app.use('/api/film-status',  filmStatusRoutes)
app.use('/api/persons',      personRoutes)
app.use('/api/search',       searchRoutes)
app.use('/api/upload',       uploadRoutes)

initSocket(httpServer)

setTimeout(() => syncAll().catch(console.error), 6000)

cron.schedule('0 3 * * *', () => { syncAll().catch(console.error) })
const PORT = process.env.PORT || 5000

httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n✖ Port ${PORT} is already in use — another server instance is still running.`)
        console.error(`  Kill it, then restart:  npx kill-port ${PORT}   (or close the other terminal)\n`)
        process.exit(1)
    }
    throw err
})

httpServer.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

// Graceful shutdown so the port is released on restart/Ctrl+C
const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down...`)
    httpServer.close(() => process.exit(0))
    // Force-exit if connections (e.g. open sockets) keep the server alive
    setTimeout(() => process.exit(0), 3000).unref()
}
process.on('SIGINT',  () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
