# CLAUDE.md — AI Assistant Context for Lumray

> This file is for the AI coding assistant. Read this entire file before writing any code, suggesting any changes, or answering any questions about this project.

---

## What is this project?

Lumray is a **community-based film logging web application** — similar to Letterboxd but with Reddit-style community posts and direct messaging. Users can log films, rate and review them, discover new films through TMDb, and connect with other film lovers.

This is a **final year university project** built by a team of 3 developers. The main developer is Omar — he makes all architecture decisions. Do not suggest changing the stack or architecture unless explicitly asked.

---

## Critical rules — read before writing any code

1. **Never change the tech stack** without being asked. The stack is final and locked.
2. **Always use TypeScript** — no plain JavaScript files ever.
3. **Never use `any` type** in TypeScript — always type everything properly.
4. **Always check if a movie exists in DB before calling TMDb** — lazy caching pattern.
5. **All API responses must follow this shape:**
   ```typescript
   { data: T | null, error: string | null, message: string }
   ```
6. **Never store the TMDb API key in frontend code** — all TMDb calls go through the backend.
7. **Never commit `.env` files** — always use `.env.example` as reference.
8. **Auth middleware must be applied** to any route that modifies data.
9. **Guests can read** — browsing films, reading reviews, viewing profiles is always public.
10. **Use Prisma for all DB operations** — never write raw SQL.
11. **Always handle errors** — every async function needs try/catch.
12. **Use `prisma.upsert`** when syncing data from TMDb to avoid duplicate errors.

---

## Project structure

This is a **monorepo with two separate projects:**

```
lumray/
├── lumray-backend/    ← Node.js + Express API
└── lumray-web/        ← Next.js frontend
```

They are **completely separate** — different `package.json`, different deployments, different repos. The frontend calls the backend via HTTP (Axios). They do NOT share code.

---

## Backend — lumray-backend

### Stack
- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Auth:** JWT (jsonwebtoken) + argon2
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **File uploads:** Multer + Cloudinary
- **Real-time:** Socket.io (DMs only — no global rooms)
- **Validation:** express-validator
- **Security:** Helmet + CORS

### Folder structure
```
lumray-backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── movies.routes.ts
│   │   ├── reviews.routes.ts
│   │   ├── diary.routes.ts
│   │   ├── users.routes.ts
│   │   ├── lists.routes.ts
│   │   ├── posts.routes.ts
│   │   └── messages.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── movies.controller.ts
│   │   ├── reviews.controller.ts
│   │   ├── diary.controller.ts
│   │   ├── users.controller.ts
│   │   ├── lists.controller.ts
│   │   ├── posts.controller.ts
│   │   └── messages.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts     ← JWT verification
│   │   └── error.middleware.ts    ← global error handler
│   ├── services/
│   │   ├── tmdb.service.ts        ← all TMDb API calls
│   │   └── cloudinary.service.ts  ← image upload helper
│   ├── lib/
│   │   └── prisma.ts              ← Prisma client singleton
│   └── index.ts                   ← Express app entry point
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```

### Entry point pattern (index.ts)
```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL }
})

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// routes go here
app.use('/api/auth', authRoutes)
app.use('/api/movies', movieRoutes)
// etc.

httpServer.listen(process.env.PORT || 5000)
```

### Auth middleware pattern
```typescript
// middleware/auth.middleware.ts
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: { id: string; username: string }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ data: null, error: 'Unauthorized', message: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username: string }
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ data: null, error: 'Unauthorized', message: 'Invalid token' })
  }
}
```

### Password hashing pattern (argon2 — always use this)
```typescript
import argon2 from 'argon2'

// Hash password before saving to DB
const hash = await argon2.hash(password)

// Verify password on login
const match = await argon2.verify(hash, password)
```

> Note: If argon2 fails to install on Windows run `npm install --global windows-build-tools` first. If it still fails fall back to `bcryptjs` with `await bcrypt.hash(password, 12)` and `await bcrypt.compare(password, hash)`.

### Controller pattern (always use this structure)
```typescript
// controllers/movies.controller.ts
import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { tmdbService } from '../services/tmdb.service'

export const getMovie = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)

    // 1. Check DB first
    const cached = await prisma.movie.findUnique({ where: { id } })
    if (cached) return res.json({ data: cached, error: null, message: 'ok' })

    // 2. Fetch from TMDb
    const movie = await tmdbService.getMovie(id)

    // 3. Cache in DB
    const saved = await prisma.movie.create({ data: { ...movie } })

    return res.json({ data: saved, error: null, message: 'ok' })
  } catch (error) {
    return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
  }
}
```

### TMDb service pattern
```typescript
// services/tmdb.service.ts
const BASE_URL = process.env.TMDB_BASE_URL
const API_KEY = process.env.TMDB_API_KEY
export const IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL

export const tmdbService = {
  search: async (query: string) => {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    return res.json()
  },
  getMovie: async (id: number) => {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`)
    return res.json()
  },
  getTrending: async () => {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`)
    return res.json()
  },
  image: (path: string, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500') => {
    return `${IMAGE_BASE_URL}/${size}${path}`
  }
}
```

### Prisma singleton pattern
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Frontend — lumray-web

### Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State management:** Zustand
- **HTTP client:** Axios
- **Icons:** Lucide React
- **Components:** shadcn/ui + Radix UI

### Folder structure
```
lumray-web/
├── src/
│   ├── app/
│   │   ├── page.tsx               ← Landing page
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── home/page.tsx
│   │   ├── films/
│   │   │   ├── page.tsx           ← Films browse
│   │   │   └── [id]/page.tsx      ← Movie detail
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       ├── page.tsx
│   │   │       ├── diary/page.tsx
│   │   │       ├── reviews/page.tsx
│   │   │       └── lists/page.tsx
│   │   ├── community/page.tsx
│   │   ├── search/page.tsx
│   │   └── messages/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── films/
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieGrid.tsx
│   │   │   └── FilterModal.tsx
│   │   ├── reviews/
│   │   │   ├── ReviewCard.tsx
│   │   │   └── WriteReview.tsx
│   │   ├── diary/
│   │   │   ├── DiaryRow.tsx
│   │   │   └── ActivityHeatmap.tsx
│   │   ├── community/
│   │   │   ├── PostCard.tsx
│   │   │   └── WritePost.tsx
│   │   ├── messages/
│   │   │   ├── ChatWindow.tsx
│   │   │   └── MessageBubble.tsx
│   │   └── ui/
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Button.tsx
│   │       └── StarRating.tsx
│   ├── store/
│   │   └── auth.store.ts          ← Zustand auth store (user, token, setCredentials, logout)
│   ├── services/
│   │   └── api.ts                 ← Axios instance
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useMovie.ts
│   └── types/
│       └── index.ts               ← shared TypeScript types
├── public/
│   └── images/                    ← static assets exported from Figma
└── package.json
```

### Axios instance (always use this — never use fetch directly)
```typescript
// services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Zustand auth store pattern
```typescript
// store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  username: string
  email: string
  name: string | null
  bio: string | null
  avatar: string | null
  coverImage: string | null
  emailVerified: boolean
  points: number
  level: number
}

interface AuthStore {
  user: User | null
  token: string | null
  setCredentials: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setCredentials: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth' } // persisted to localStorage automatically
  )
)
```

In components: `const user = useAuthStore(s => s.user)`
Outside components (e.g. api.ts): `useAuthStore.getState().token`

### Component pattern (always use this structure)
```typescript
// components/films/MovieCard.tsx
import Image from 'next/image'
import Link from 'next/link'

interface MovieCardProps {
  id: number
  title: string
  posterPath: string | null
  releaseDate: string
  voteAverage?: number
}

export default function MovieCard({ id, title, posterPath, releaseDate, voteAverage }: MovieCardProps) {
  return (
    <Link href={`/films/${id}`}>
      <div className="group relative cursor-pointer">
        {/* component content */}
      </div>
    </Link>
  )
}
```

---

## Design system

### Colors (from Figma — use these exact values)
```css
--bg:           #2c2d38   /* Main background */
--bg-dark:      #1a1b21   /* Navbar / darker surface */
--bg-darker:    #12101f   /* Footer */
--surface:      #383a47   /* Cards */
--surface-2:    #2b2c36   /* Nested elements */
--purple:       #714ee4   /* Primary brand color */
--purple-light: #b9a4fc   /* Highlights, links */
--purple-mid:   #947aeb   /* Secondary purple */
--purple-deep:  #534ab7   /* Borders, deep accents */
--text:         #ede9fc   /* Primary text */
--text-muted:   #7a7882   /* Muted text */
--text-dim:     #cfcfcf   /* Dimmed text */
```

In Tailwind use arbitrary values:
```tsx
<div className="bg-[#2c2d38] text-[#ede9fc]">
```

### Fonts
- **Outfit** — headings, logo, titles, buttons (font-family: 'Outfit')
- **Roboto** — body text, labels, metadata (font-family: 'Roboto')

### Key design patterns
- Cards: `bg-[#383a47]` with `rounded-xl` and `border border-[#ede9fc]/10`
- Buttons primary: `bg-[#714ee4] text-white rounded-lg`
- Buttons ghost: `border border-[#ede9fc]/15 text-[#ede9fc] rounded-lg`
- Purple accent text: `text-[#b9a4fc]`
- Muted text: `text-[#7a7882]`

---

## Database schema summary

### Tables and their purpose
| Table | Purpose |
|---|---|
| User | User accounts and profiles |
| Account | OAuth provider accounts (Google, X, etc.) |
| PasswordReset | Password reset tokens sent by email |
| Movie | Cached TMDb movie data |
| Person | Cached TMDb cast/crew |
| Genre | Cached TMDb genres |
| MovieGenre | Movie ↔ Genre (many-to-many) |
| MovieCast | Movie ↔ Person as actors |
| MovieCrew | Movie ↔ Person as directors/writers |
| Rating | User rates a movie (unique per user+movie) |
| Review | User writes a review (unique per user+movie) |
| ReviewLike | User likes a review |
| DiaryEntry | User logs a film as watched (multiple entries allowed for rewatches) |
| List | User creates a custom list |
| ListItem | Films inside a list |
| Follow | User follows another user (self-relation) |
| Post | Community post with optional film tag and hashtags |
| PostLike | User likes a post |
| Comment | On posts or reviews (nullable FKs — only one set at a time) |
| Conversation | DM between exactly 2 users |
| ConversationParticipant | Links users to conversations |
| Message | Message inside a conversation |
| UserBadge | Gamification badges earned by user |

### Full schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  username          String    @unique
  passwordHash      String?
  name              String?
  bio               String?
  avatar            String?
  coverImage        String?
  emailVerified     Boolean   @default(false)
  verificationToken String?
  tokenExpiry       DateTime?
  points            Int       @default(0)
  level             Int       @default(1)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  accounts          Account[]
  passwordResets    PasswordReset[]
  ratings           Rating[]
  reviews           Review[]
  reviewLikes       ReviewLike[]
  diaryEntries      DiaryEntry[]
  lists             List[]
  posts             Post[]
  postLikes         PostLike[]
  comments          Comment[]
  followers         Follow[]                  @relation("following")
  following         Follow[]                  @relation("follower")
  badges            UserBadge[]
  messages          Message[]
  conversations     ConversationParticipant[]
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  access_token      String?  @db.Text
  refresh_token     String?  @db.Text
  expires_at        Int?
  createdAt         DateTime @default(now())

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model PasswordReset {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Movie {
  id           String   @id @default(cuid())
  tmdbId       Int      @unique
  title        String
  overview     String   @db.Text
  tagline      String?
  posterPath   String?
  backdropPath String?
  runtime      Int?
  releaseDate  String?
  language     String?
  status       String?
  cachedAt     DateTime @default(now())
  updatedAt    DateTime @updatedAt

  genres       MovieGenre[]
  cast         MovieCast[]
  crew         MovieCrew[]
  ratings      Rating[]
  reviews      Review[]
  diaryEntries DiaryEntry[]
  listItems    ListItem[]
  posts        Post[]
}

model Person {
  id          String   @id @default(cuid())
  tmdbId      Int      @unique
  name        String
  biography   String?  @db.Text
  birthday    String?
  deathday    String?
  profilePath String?
  cachedAt    DateTime @default(now())
  updatedAt   DateTime @updatedAt

  cast        MovieCast[]
  crew        MovieCrew[]
}

model Genre {
  id     String       @id @default(cuid())
  tmdbId Int          @unique
  name   String

  movies MovieGenre[]
}

model MovieGenre {
  movieId String
  genreId String

  movie   Movie  @relation(fields: [movieId], references: [id])
  genre   Genre  @relation(fields: [genreId], references: [id])

  @@id([movieId, genreId])
}

model MovieCast {
  id        String  @id @default(cuid())
  movieId   String
  personId  String
  character String?
  order     Int?

  movie     Movie   @relation(fields: [movieId], references: [id])
  person    Person  @relation(fields: [personId], references: [id])

  @@unique([movieId, personId, character])
}

model MovieCrew {
  id         String @id @default(cuid())
  movieId    String
  personId   String
  job        String
  department String

  movie      Movie  @relation(fields: [movieId], references: [id])
  person     Person @relation(fields: [personId], references: [id])

  @@unique([movieId, personId, job])
}

model Rating {
  id        String   @id @default(cuid())
  userId    String
  movieId   String
  score     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  movie     Movie    @relation(fields: [movieId], references: [id])

  @@unique([userId, movieId])
}

model Review {
  id        String       @id @default(cuid())
  userId    String
  movieId   String
  content   String       @db.Text
  rating    Float?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  movie     Movie        @relation(fields: [movieId], references: [id])
  likes     ReviewLike[]
  comments  Comment[]

  @@unique([userId, movieId])
}

model ReviewLike {
  userId   String
  reviewId String

  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  review   Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@id([userId, reviewId])
}

model DiaryEntry {
  id        String   @id @default(cuid())
  userId    String
  movieId   String
  watchedAt DateTime @default(now())
  rating    Float?
  notes     String?  @db.Text
  isRewatch Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  movie     Movie    @relation(fields: [movieId], references: [id])
}

model List {
  id          String     @id @default(cuid())
  userId      String
  name        String
  description String?
  isPublic    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items       ListItem[]
}

model ListItem {
  id      String   @id @default(cuid())
  listId  String
  movieId String
  order   Int      @default(0)
  notes   String?
  addedAt DateTime @default(now())

  list    List     @relation(fields: [listId], references: [id], onDelete: Cascade)
  movie   Movie    @relation(fields: [movieId], references: [id])

  @@unique([listId, movieId])
}

model Follow {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower    User     @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  following   User     @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@id([followerId, followingId])
}

model Post {
  id        String     @id @default(cuid())
  userId    String
  movieId   String?
  content   String     @db.Text
  tags      String[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  movie     Movie?     @relation(fields: [movieId], references: [id])
  likes     PostLike[]
  comments  Comment[]
}

model PostLike {
  userId String
  postId String

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@id([userId, postId])
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  postId    String?
  reviewId  String?
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  review    Review?  @relation(fields: [reviewId], references: [id], onDelete: Cascade)
}

model Conversation {
  id           String                    @id @default(cuid())
  createdAt    DateTime                  @default(now())
  updatedAt    DateTime                  @updatedAt

  participants ConversationParticipant[]
  messages     Message[]
}

model ConversationParticipant {
  userId         String
  conversationId String

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@id([userId, conversationId])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  senderId       String
  content        String       @db.Text
  read           Boolean      @default(false)
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badge     String
  awardedAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badge])
}
```

### Important constraints
- `Rating` unique per `[userId, movieId]` — one rating per user per film
- `Review` unique per `[userId, movieId]` — one review per user per film
- `ReviewLike` composite key `[userId, reviewId]`
- `PostLike` composite key `[userId, postId]`
- `ListItem` unique per `[listId, movieId]` — same film can't appear twice in a list
- `Follow` composite key `[followerId, followingId]`
- `ConversationParticipant` composite key `[userId, conversationId]`
- `UserBadge` unique per `[userId, badge]` — can't earn same badge twice
- `Movie` and `Person` use cuid as primary key + tmdbId as unique external reference
- `DiaryEntry` allows multiple entries per user+movie — each rewatch is a new entry
- `Comment` has nullable `postId` AND `reviewId` — only one is set at a time
- No Session table — JWT handles auth with rememberMe controlling expiry (30d vs 24h)

---

## API routes reference

### Auth
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |

### Movies
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| GET | `/api/movies/search?q=` | No | Search TMDb |
| GET | `/api/movies/trending` | No | Trending films |
| GET | `/api/movies/:id` | No | Movie detail + cache |
| GET | `/api/movies/:id/credits` | No | Cast and crew |

### Ratings
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| POST | `/api/ratings` | Yes | Rate a film |
| PUT | `/api/ratings/:id` | Yes | Update rating |
| DELETE | `/api/ratings/:id` | Yes | Remove rating |

### Reviews
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| GET | `/api/reviews?movieId=` | No | Get reviews for film |
| POST | `/api/reviews` | Yes | Write a review |
| PUT | `/api/reviews/:id` | Yes | Edit review |
| DELETE | `/api/reviews/:id` | Yes | Delete review |
| POST | `/api/reviews/:id/like` | Yes | Like a review |
| DELETE | `/api/reviews/:id/like` | Yes | Unlike |

### Diary
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| GET | `/api/diary` | Yes | Get own diary |
| POST | `/api/diary` | Yes | Log a film |
| PUT | `/api/diary/:id` | Yes | Edit entry |
| DELETE | `/api/diary/:id` | Yes | Delete entry |

### Users
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| GET | `/api/users/:username` | No | Public profile |
| PUT | `/api/users/me` | Yes | Update own profile |
| POST | `/api/users/:id/follow` | Yes | Follow user |
| DELETE | `/api/users/:id/follow` | Yes | Unfollow user |

### Lists
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| GET | `/api/lists?userId=` | No | Get user lists |
| POST | `/api/lists` | Yes | Create list |
| PUT | `/api/lists/:id` | Yes | Update list |
| DELETE | `/api/lists/:id` | Yes | Delete list |
| POST | `/api/lists/:id/items` | Yes | Add film to list |
| DELETE | `/api/lists/:id/items/:movieId` | Yes | Remove film |

### Posts
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| GET | `/api/posts` | No | Community posts feed |
| POST | `/api/posts` | Yes | Create post |
| DELETE | `/api/posts/:id` | Yes | Delete post |
| POST | `/api/posts/:id/like` | Yes | Like post |
| POST | `/api/posts/:id/comments` | Yes | Comment on post |

### Messages (Tier 3)
| Method | Route | Auth required | Purpose |
|---|---|---|---|
| GET | `/api/messages/conversations` | Yes | Get all DM conversations |
| POST | `/api/messages/conversations` | Yes | Start new DM |
| GET | `/api/messages/:conversationId` | Yes | Get messages in DM |

---

## Features priority

### Build in this exact order:

**Phase 1 — Foundation (do first)**
1. Express server + middleware
2. Prisma schema + push to Neon DB
3. Auth routes (register + login + JWT)
4. TMDb service
5. Next.js Axios instance + Redux store
6. Navbar + Footer

**Phase 2 — Tier 1 (core features)**
1. Movie search + detail
2. Rating system
3. Review system
4. Diary
5. User profile
6. Home feed
7. Landing page

**Phase 3 — Tier 2 (social)**
1. Follow system
2. Activity feed
3. Lists
4. Community posts
5. Search

**Phase 4 — Tier 3 (advanced — only if time allows)**
1. Direct messages (Socket.io)
2. Stats dashboard
3. Recommendations
4. Spotify links
5. Gamification

---

## What guests can and cannot do

| Feature | Guest | Logged in |
|---|---|---|
| Browse films | ✅ | ✅ |
| View movie detail | ✅ | ✅ |
| Read reviews | ✅ | ✅ |
| Read community posts | ✅ | ✅ |
| View public profiles | ✅ | ✅ |
| Rate a film | ❌ | ✅ |
| Write a review | ❌ | ✅ |
| Log to diary | ❌ | ✅ |
| Add to list | ❌ | ✅ |
| Follow users | ❌ | ✅ |
| Write posts | ❌ | ✅ |
| Send messages | ❌ | ✅ |

---

## Environment variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="lumray-super-secret-key-2024"
PORT=5000
CLIENT_URL="http://localhost:3000"
TMDB_API_KEY="..."
TMDB_BASE_URL="https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL="https://image.tmdb.org/t/p"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

---

## Common commands

```bash
# Backend
npm run dev                  # nodemon dev server on port 5000
npx prisma db push           # push schema changes to Neon
npx prisma generate          # regenerate Prisma client after schema change
npx prisma studio            # visual DB editor at localhost:5555

# Frontend
npm run dev                  # Next.js dev server on port 3000
npm run build                # production build
```

---

## Hosting

| Service | Platform | URL pattern |
|---|---|---|
| Frontend | Vercel | lumray.vercel.app |
| Backend | Render.com | lumray-api.onrender.com |
| Database | Neon | (connection string only) |
| Images | Cloudinary | res.cloudinary.com/... |

When deploying add all env variables to Vercel and Render dashboards.

---

## Figma design reference

Design file: https://www.figma.com/design/2M6rRiYGWIdoDFa4SDQkff/Lumray

Completed screens:
- Landing page
- Login + Signup
- Home feed
- Films browse page
- Movie detail page
- User profile page
- Diary page

Some decorative design elements are exported as PNG/SVG from Figma and placed in `public/images/` — use Next.js `<Image>` component to render them.

---

## Notes for the AI assistant

- Omar is the lead developer — follow his decisions, do not suggest architectural changes
- When generating code always generate the complete file, not snippets
- Always add TypeScript types — never use `any`
- Always follow the folder structure defined above
- When asked to build a feature, build the backend route AND the frontend component together
- Always use the Axios instance from `services/api.ts` — never use fetch directly in components
- Use Tailwind for all styling — no inline styles, no CSS modules
- Use Lucide React for all icons
- Use Next.js `<Image>` component instead of `<img>` tags
- Use Next.js `<Link>` component instead of `<a>` tags for internal navigation
- Zustand for global state (`useAuthStore`) — local component state uses `useState`
- When building forms always add loading and error states
- The backend runs on port 5000, the frontend on port 3000
