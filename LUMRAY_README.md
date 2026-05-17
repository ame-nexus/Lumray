# Lumray — Project Documentation

## What is Lumray?

Lumray is a community-based film logging platform — think **Letterboxd meets Reddit**. Users can log films they've watched, rate and review them, discover new films, and connect with other film lovers through posts and direct messages.

This is a **final year university project** built by a team of 3.

---

## Features

### 🔴 Tier 1 — Must Have

- User registration and login (email + Google OAuth)
- Movie search and browse (powered by TMDb)
- Movie detail page (poster, backdrop, synopsis, cast, genres, ratings)
- Rate a film (0.5 to 5 stars)
- Write / edit / delete a review
- Like a review
- Diary — log a film as watched (date, rating, notes, rewatch flag)
- User profile page (stats, diary, reviews, lists)
- Edit own profile (avatar, cover photo, bio)
- Watchlist

### 🟡 Tier 2 — Should Have

- Follow / unfollow users
- Activity feed (films logged/reviewed by people you follow)
- Custom lists (create, edit, delete, add films)
- Public / private list visibility
- Community posts (text + optional film tag + hashtags)
- Like and comment on posts
- Search films, users and posts
- Genre and decade filters on browse page
- Rating distribution chart on movie detail

### 🟢 Tier 3 — Nice to Have

- Real-time direct messages between users (Socket.io)
- Group chats (if time allows after DMs)
- Stats dashboard (genre breakdown, rating distribution, watch streak, heatmap)
- Recommendation engine (content-based — same genre/director)
- Spotify soundtrack links on movie pages
- Gamification (points, levels, badges)
- Watch streak tracking
- Compare taste between two users

---

## User Flow

### Guest (not logged in)
- View landing page
- Browse and search films
- View movie detail page (info, cast, reviews, posts)
- Read community posts
- View public user profiles
- Register / login

### Logged in user (everything above plus)
- Rate, review and log films
- Add films to lists and watchlist
- Follow users and see activity feed
- Write and like community posts
- Comment on posts and reviews
- Edit own profile
- Send direct messages

---

## Pages

| Page | Route | Tier |
|---|---|---|
| Landing | `/` | 1 |
| Login | `/login` | 1 |
| Signup | `/signup` | 1 |
| Home feed | `/home` | 1 |
| Films browse | `/films` | 1 |
| Movie detail | `/films/[id]` | 1 |
| User profile | `/profile/[username]` | 1 |
| Diary | `/profile/[username]/diary` | 1 |
| Reviews | `/profile/[username]/reviews` | 1 |
| Lists | `/profile/[username]/lists` | 2 |
| Community posts | `/community` | 2 |
| Search results | `/search` | 2 |
| Direct messages | `/messages` | 3 |
| Stats dashboard | `/profile/[username]/stats` | 3 |

---

## Build Order

### Phase 1 — Foundation
1. Backend setup (Express + Prisma + Neon)
2. Auth routes (register + login + JWT)
3. TMDb service + movie caching
4. Next.js setup + Axios + Redux Toolkit
5. Navbar + Footer components
6. Deploy backend to Render, frontend to Vercel early

### Phase 2 — Tier 1
1. Movie search + detail API + pages
2. Rating + review system
3. Diary CRUD
4. User profile page
5. Home feed (trending + recent)
6. Landing page

### Phase 3 — Tier 2
1. Follow system + activity feed
2. Custom lists
3. Community posts + likes + comments
4. Search page
5. Filters on films browse

### Phase 4 — Tier 3
1. Direct messages (Socket.io)
2. Stats dashboard + heatmap
3. Recommendations
4. Spotify links
5. Gamification

---

## Team Split

**Dev 1 — Backend**
- Express setup + all API routes
- Prisma schema + DB migrations
- JWT auth
- TMDb service
- Socket.io (DMs)

**Dev 2 — Frontend**
- Landing page
- Films browse + filter
- Movie detail page
- Component library (cards, modals, buttons)

**Dev 3 — Full-stack**
- Auth pages (login/signup)
- Home feed
- User profile + diary
- Community posts
- Connect frontend to API

---

---

## Technical Stack

### Frontend
| What | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State management | Redux Toolkit |
| HTTP client | Axios |
| Icons | Lucide React |
| Components | shadcn/ui + Radix UI |

### Backend
| What | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| Authentication | JWT (jsonwebtoken) |
| Password hashing | bcryptjs |
| File uploads | Multer + Cloudinary |
| Real-time | Socket.io |
| Validation | express-validator |
| Security | Helmet + CORS |

### Data
| What | Technology |
|---|---|
| Database | PostgreSQL |
| ORM | Prisma |
| DB hosting | Neon (free) |
| Movie data | TMDb API |
| Image storage | Cloudinary |

### Hosting
| What | Technology |
|---|---|
| Frontend | Vercel (free) |
| Backend | Render.com (free) |
| Database | Neon (free) |

---

## Environment Variables

### `lumray-backend/.env`
```env
DATABASE_URL="your-neon-connection-string"
JWT_SECRET="lumray-super-secret-key-2024"
PORT=5000
CLIENT_URL="http://localhost:3000"
TMDB_API_KEY="your-tmdb-key"
TMDB_BASE_URL="https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL="https://image.tmdb.org/t/p"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### `lumray-web/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

---

## Project Structure

### Backend
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
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── services/
│   │   ├── tmdb.service.ts
│   │   └── cloudinary.service.ts
│   ├── lib/
│   │   └── prisma.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .gitignore
└── package.json
```

### Frontend
```
lumray-web/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── home/page.tsx
│   │   ├── films/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
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
│   │   ├── index.ts
│   │   ├── auth.slice.ts
│   │   └── ui.slice.ts
│   ├── services/
│   │   └── api.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useMovie.ts
│   └── types/
│       └── index.ts
├── public/
│   └── images/
└── package.json
```

---

## Database Schema

### Core tables
- **User** — accounts, profiles, auth
- **Movie** — cached TMDb data
- **Person** — cached TMDb cast/crew
- **Genre** — cached TMDb genres

### Join tables (TMDb)
- **MovieGenre** — Movie ↔ Genre
- **MovieCast** — Movie ↔ Person (actors)
- **MovieCrew** — Movie ↔ Person (directors, writers)

### User activity
- **Rating** — user rates a movie (unique per user+movie)
- **Review** — user writes a review
- **ReviewLike** — user likes a review
- **DiaryEntry** — user logs a film as watched
- **List** — user creates a list
- **ListItem** — films inside a list

### Social
- **Follow** — user follows another user (self-relation)
- **Post** — community post (optional film tag)
- **PostLike** — user likes a post
- **Comment** — on posts or reviews

### Chat
- **Conversation** — DM between 2 users
- **Message** — message inside a conversation

### Gamification
- **UserBadge** — badges earned by user

---

## Key Rules

1. Always check DB before calling TMDb — never fetch the same movie twice
2. Use `prisma.upsert` when syncing TMDb data
3. All API routes return `{ data, error, message }`
4. Auth required for: rating, reviewing, diary, lists, posts, messages, follow
5. Guests can: browse films, read reviews, read posts, view public profiles
6. Image paths from TMDb are partial — always build full URL with `tmdb.image(path)`
7. Never store TMDb API key on the frontend
8. Never push `.env` to GitHub

---

## Useful Commands

```bash
# Backend
npm run dev              # start dev server
npx prisma db push       # push schema to DB
npx prisma generate      # generate Prisma client
npx prisma studio        # open DB GUI

# Frontend
npm run dev              # start Next.js dev server
npm run build            # build for production
```

---

## Figma Design File

[Lumray on Figma](https://www.figma.com/design/2M6rRiYGWIdoDFa4SDQkff/Lumray)

Completed screens: Landing, Login, Signup, Home, Films, Movie Detail, User Profile, Diary

---

*Built with Next.js, Express, Prisma, PostgreSQL, Tailwind CSS, Redux Toolkit, TMDb API*
