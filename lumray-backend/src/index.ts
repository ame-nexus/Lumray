import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import cors from 'cors'
import helmet from 'helmet'

import movieRoutes from './routes/movies.routes'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.use('/api/movies', movieRoutes)

const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
  res.send("Welcome to the Lumray API!");
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
