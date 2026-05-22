# Lumray — Work Breakdown & Page Plan

> Read this with `CLAUDE.md`. CLAUDE.md is the source of truth for stack, folder
> structure, API shape, and the DB schema. This file is the **task list** — who
> builds what, in what order.

---

## Team & roles

| Person | Role | Owns |
|---|---|---|
| **Omar** | Frontend lead (+ occasional backend) | Page assembly, API wiring, routing, state (Redux), responsive |
| **Dev B** | Backend | All Express routes, controllers, services, Prisma, TMDb |
| **Dev C** | Components | Reusable UI components in `components/ui/` and feature folders — the building blocks, no API calls inside them |

**How the work flows:**
1. Dev C builds reusable components from props only (dummy data, no `api` calls).
2. Dev B builds the backend endpoints.
3. Omar imports Dev C's components into pages and connects them to Dev B's API.

This way all three can work in parallel without blocking each other.

---

## Status — done so far

- [x] Navbar, Footer
- [x] Landing page (`/`) — HeroSection, GenreSection, ConversationSection
- [x] Backend: `GET /api/movies/top-rated`, `GET /api/movies/by-genre/:genreId`
- [~] Auth page (`/login`) — spec written in `lumray-web/AUTH_PAGE_SPEC.md`, in progress

---

## Phase 1 — Shared components (Dev C, do these FIRST)

These are used on almost every page. Nothing else can be assembled until they exist.
All take **props only** — no `api` calls, no Redux. Put them in `components/ui/`.

| Component | Props (rough) | Used on |
|---|---|---|
| `Button` | `variant` (primary/ghost), `size`, `children`, `onClick` | everywhere |
| `Avatar` | `src`, `size`, `alt` | navbar, profile, posts, reviews |
| `Badge` | `label`, `color` | profile, movie detail |
| `Modal` | `open`, `onClose`, `children` | filters, write review/post |
| `StarRating` | `value`, `max`, `editable`, `onChange` | movie card, reviews, diary |
| `MovieCard` | `id`, `title`, `posterPath`, `releaseDate`, `voteAverage` | films grid, home rows, profile |
| `MovieRow` | `title`, `movies[]`, `seeAllHref` | home, movie detail |
| `MovieGrid` | `movies[]` | films page, profile films |
| `Tabs` | `tabs[]`, `active`, `onChange` | movie detail, profile, films |
| `GenrePills` | `genres[]`, `selected`, `onSelect` | films, profile films |
| `Pagination` | `page`, `totalPages`, `onPrev`, `onNext` | films, profile films |
| `RatingHistogram` | `distribution[]` | movie detail, profile |
| `SearchBar` | `value`, `onChange`, `placeholder` | films, search, navbar |

> `MovieCard` is the most important — it appears on 6+ pages. Build it first and well.

---

## Phase 2 — Pages

Each page = route + components + backend it needs. Omar assembles, Dev C supplies
components, Dev B supplies endpoints.

### `/login` — Auth  *(in progress)*
- Spec: `lumray-web/AUTH_PAGE_SPEC.md`
- Backend: `POST /api/auth/register`, `POST /api/auth/login`

### `/home` — Home feed
- **Components:** `MovieRow` ×3 (Popular This Week, Popular With Friends, Recommended for you), `GenreCard` (colored genre tiles — new, Dev C), `CommunityRecommendationCard` (new — review highlight with poster), `PostCard`
- **Backend:** `GET /api/movies/trending`, recommended feed, `GET /api/posts`
- **Notes:** auth-gated rows ("With Friends", "Recommended") show generic content for guests

### `/films` — Browse films
- **Components:** `PageHeader`, `FilterTabs` (Popular / Top rated / New releases / By genre / By year / By decade), `SearchBar`, `GenrePills`, `FilterModal`, view toggle (grid/list), `MovieGrid`, `Pagination`
- **Backend:** `GET /api/movies/search`, `GET /api/movies/trending`, a paginated discover/filter endpoint
- **Notes:** "1,356 films" count + Prev/Next pagination

### `/films/[id]` — Movie detail
- **Components:** `MovieBackdrop` (backdrop + poster + title), `MovieActions` (Watched/Favorite/Watchlist + `StarRating`), `MovieOverview`, `RatingSummary` (`RatingHistogram` + average), `FilmInfoCard` (sidebar), `CastCrewTabs` + `PersonAvatar`, `GenreThemes` pills, `CommunityTabs` (Reviews/Posts/Lists) + `ReviewCard`, `SoundtrackCard`, `MovieRow` (Recommended)
- **Backend:** `GET /api/movies/:id`, `GET /api/movies/:id/credits`, `GET /api/reviews?movieId=`, ratings/diary POST endpoints
- **Notes:** biggest page — break into sub-components

### `/profile/[username]` — Profile (overview tab)
- **Components:** `ProfileHeader` (cover, `Avatar`, name, `Badge`, stats: Films/This year/Following/Followers), `ProfileTabs` (Profile/Films/Diary/Reviews/Lists/Stats), `FavoritesRow`, `DiaryEntryCard`, `ReviewCard`, `ProfileSidebar` (avg rating, recent activity, watch streak, taste badges)
- **Backend:** `GET /api/users/:username`, plus that user's reviews/diary
- **Notes:** guests can view public profiles

### `/profile/[username]/films`
- **Components:** `ProfileHeader` + `ProfileTabs` (reuse), `GenrePills`, `MovieGrid`, `Pagination`

### `/profile/[username]/diary`
- **Components:** `ProfileHeader` + `ProfileTabs` (reuse), diary entries grouped by month, `DiaryEntryCard`, `DiaryStats` sidebar
- **Backend:** `GET /api/diary`

### `/profile/[username]/reviews`
- **Components:** `ProfileHeader` + `ProfileTabs` (reuse), `ReviewCard` list

### `/profile/[username]/lists`
- **Components:** `ProfileHeader` + `ProfileTabs` (reuse), `ListCard`
- **Backend:** `GET /api/lists?userId=`

### `/community` — Posts feed
- **Components:** `PostCard`, `WritePost` / post composer
- **Backend:** `GET /api/posts`, `POST /api/posts`

### `/search`
- **Components:** `SearchBar`, `MovieGrid` (results)
- **Backend:** `GET /api/movies/search`

### `/messages` — *(Tier 3, only if time allows)*
- **Components:** `ConversationList`, `ChatWindow`, `MessageBubble`
- **Backend:** messages routes + Socket.io

---

## Phase 3 — Backend task list (Dev B)

Build in this order. Every response must follow `{ data, error, message }` (see CLAUDE.md).

1. [x] Movies — top-rated, by-genre
2. [ ] Auth — register, login, `GET /me` + JWT middleware
3. [ ] Movies — `GET /:id` (detail + cache), `GET /:id/credits`, `search`, `trending`
4. [ ] Ratings — POST / PUT / DELETE
5. [ ] Reviews — GET / POST / PUT / DELETE / like
6. [ ] Diary — GET / POST / PUT / DELETE
7. [ ] Users — `GET /:username`, update profile, follow / unfollow
8. [ ] Lists — CRUD + items
9. [ ] Posts — feed, create, like, comment
10. [ ] Messages (Tier 3) — conversations + Socket.io

---

## Suggested order (next 2 weeks)

**Week 1**
- Dev C: `Button`, `Avatar`, `StarRating`, `MovieCard`, `MovieGrid`, `MovieRow`
- Dev B: Auth + Movie detail/search endpoints
- Omar: finish `/login` integration, then build `/films` page

**Week 2**
- Dev C: `Tabs`, `GenrePills`, `Pagination`, `RatingHistogram`, `Modal`, `ReviewCard`, `PostCard`
- Dev B: Ratings, Reviews, Diary endpoints
- Omar: `/films/[id]` movie detail, then `/home`

**After that:** `/profile` + sub-pages, `/community`, `/search`, then Tier 3 if time.

---

## Rules for everyone (from CLAUDE.md — don't break these)

- TypeScript only, never `any`
- API responses: `{ data, error, message }`
- All TMDb calls go through the backend
- Frontend uses the Axios instance in `services/api.ts` — never `fetch` in components
- Tailwind for styling, Lucide for icons, `<Image>` and `<Link>` from Next.js
- Branch per person, PR into `main` — never push to `main` directly
