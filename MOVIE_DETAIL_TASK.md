# Movie Detail Page — Teammate Task

## What you are building

This is your task for the **movie detail page** (`/films/[id]`). Omar is building the hero banner at the top. You are building everything below it — all the content sections and the right sidebar cards.

The page shows detailed information about a single film: cast, crew, genres, community reviews, film metadata, rating distribution, and recommended films.

---

## Project setup

```bash
cd lumray-web
npm install
npm run dev   # runs on http://localhost:3000
```

The backend is not required for your task — use dummy/hardcoded data. Omar will wire up real API calls later.

---

## Design system

Use these exact colour values with Tailwind arbitrary syntax (e.g. `bg-[#2c2d38]`):

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#2c2d38` | main page background |
| `--bg-dark` | `#1a1b21` | navbar, dark surfaces |
| `--surface` | `#383a47` | cards |
| `--surface-2` | `#2b2c36` | nested elements inside cards |
| `--purple` | `#714ee4` | primary brand, active states |
| `--purple-light` | `#b9a4fc` | links, highlights, active text |
| `--purple-deep` | `#534ab7` | borders, deep accents |
| `--text` | `#ede9fc` | primary text |
| `--text-muted` | `#7a7882` | labels, metadata |
| `--text-dim` | `#cfcfcf` | dimmed text |

Fonts:
- `font-outfit` — headings, titles, large numbers
- `font-roboto` — body text, labels, metadata

In Tailwind config these are already set up as: `text-text`, `text-text-muted`, `bg-surface`, `bg-surface-2`, `bg-purple`, `text-purple-light`, etc.

---

## Page layout

On **desktop** the page has a two-column layout. Your components fill both columns.

```
┌────────── left column (flex-1) ──────────┐  ┌── right sidebar (w-80) ──┐
│  [overview text — Omar wires this]        │  │  MovieActions            │
│  CastCrewSection                          │  │  MovieRating             │
│  GenreThemesSection                       │  │  MovieInfo               │
│  MovieCommunity                           │  └──────────────────────────┘
│  RecommendedRow                           │
└───────────────────────────────────────────┘
```

On **mobile** everything stacks in a single column in this order:
1. MovieActions (compact strip — details below)
2. Overview text
3. CastCrewSection
4. GenreThemesSection
5. MovieRating
6. MovieInfo
7. MovieCommunity
8. RecommendedRow

---

## Where to put your files

Create all components inside `lumray-web/src/components/movie/`:

```
lumray-web/src/components/movie/
├── MovieActions.tsx
├── MovieRating.tsx
├── MovieInfo.tsx
├── CastCrewSection.tsx
├── GenreThemesSection.tsx
├── MovieCommunity.tsx
└── ReviewCard.tsx
```

Do **not** create the page file — Omar handles `src/app/films/[id]/page.tsx`.

---

## Existing components you must reuse

**`src/components/films/MoviePoster.tsx`** — already built. Use it for the RecommendedRow posters. It handles the hover overlay, watchlist/log buttons, and star rating display. Do not build a new poster card.

Look at these files to understand the coding style before you start:
- `src/components/community/CommunityReview.tsx` — how cards and tab switchers are built
- `src/components/films/MovieRow.tsx` — how a horizontal film row works
- `src/components/layout/Navbar.tsx` — how auth state is read with Zustand

---

## TypeScript rules (strictly enforced)

- Never use `any` — type everything
- Every prop has an interface defined above the component
- Export the interface so it can be imported by the page
- Export a `DUMMY_*` const at the bottom of each file with realistic placeholder data

---

## Component specifications

---

### MovieActions

The main action panel for interacting with a film.

**Desktop** — a card in the right sidebar.

```
┌─────────────────────────────────────┐
│  👁 Watched   ♡ Favourite  🔖 Watchlist  │  ← 3 icon buttons, evenly spaced
│                                     │
│        ★  ★  ★  ★  ★               │  ← 5 clickable star rating
│                                     │
│ ─────────────────────────────────── │
│          Review or Log              │
│ ─────────────────────────────────── │
│          Add to lists               │
│ ─────────────────────────────────── │
│       Change Poster/Backdrop        │
│ ─────────────────────────────────── │
│               Share                 │
└─────────────────────────────────────┘
```

Icon buttons: each is a `w-12 h-12` circle with `bg-[#2b2c36]` background and a small text label underneath. Active (toggled on) state → icon colour becomes `text-[#714ee4]`, circle gets `border border-[#714ee4]`.

Use Lucide icons: `Eye` for Watched, `Heart` for Favourite, `Bookmark` for Watchlist.

Star rating: 5 `Star` icons in a row. Filled = `fill-[#b9a4fc] text-[#b9a4fc]`. Empty = `text-[#7a7882]`. Hovering star N previews filling stars 1–N. Clicking sets the rating.

Action buttons: full width, text only, separated by `border-t border-[#ede9fc]/10`. Style: `py-2.5 text-sm font-roboto text-[#ede9fc] hover:text-[#b9a4fc] transition-colors`.

**Mobile** — instead of the sidebar card, show a compact horizontal strip directly below the hero:

```
[ 👁 Watched ]  [ ♡ ]  [ 🔖 ]     [ Rate & Log ▸ ]
```

The "Rate & Log" button (purple pill, right-aligned) opens a **bottom sheet modal** containing:
- The 5-star rating row
- "Review or Log" button
- "Add to lists" button

The modal slides up from the bottom. Close it by tapping the backdrop or an X button.

**Auth check**: if `useAuthStore(s => s.user)` is null, clicking any action (watched, favourite, watchlist, rating, buttons) redirects to `/login` instead of performing the action. Import `useAuthStore` from `@/store/auth.store` and `useRouter` from `next/navigation`.

```typescript
export interface MovieActionsProps {
  movieId: string
  isWatched?: boolean
  isFavourite?: boolean
  isWatchlisted?: boolean
  userRating?: number    // 0–5, 0 means no rating set
}
```

---

### MovieRating

Display-only card showing the community's rating for the film.

```
┌────────────────────────────────┐
│  Rating              117K ratings │
│                                │
│           4.5                  │
│        ★ ★ ★ ★ ½               │
│                                │
│  5  ████████████░░░░  62%      │
│  4  ████████░░░░░░░░  41%      │
│  3  ████░░░░░░░░░░░░  22%      │
│  2  ██░░░░░░░░░░░░░░  11%      │
│  1  █░░░░░░░░░░░░░░░   5%      │
└────────────────────────────────┘
```

The large "4.5" number: `font-outfit text-5xl font-bold text-white`.

Bar chart: each bar is a `flex` row. Left label (`text-xs text-[#7a7882]` fixed width `w-3`), then a track (`bg-[#2b2c36] rounded-full flex-1 h-1.5`), inside the track a fill `bg-[#714ee4] rounded-full h-full` with `style={{ width: percentage + '%' }}`.

```typescript
export interface MovieRatingProps {
  average: number
  totalCount: number
  distribution: { stars: 1 | 2 | 3 | 4 | 5; count: number }[]
}

export const DUMMY_RATING: MovieRatingProps = {
  average: 4.5,
  totalCount: 117000,
  distribution: [
    { stars: 5, count: 62000 },
    { stars: 4, count: 32000 },
    { stars: 3, count: 14000 },
    { stars: 2, count: 6000 },
    { stars: 1, count: 3000 },
  ],
}
```

---

### MovieInfo

A simple table of film metadata.

```
Film info
─────────────────────────────────
Director          Charlotte Wells
Writers           Charlotte Wells
Cinematography       Gregory Oke
Music             Oliver Coates
Runtime                   1h 42m
Language                 English
Country                  UK / USA
Studio             A24, BBC Film
Released            Oct 28, 2022
```

Card style: `bg-[#383a47] rounded-xl p-5`.

Each row: `flex items-start justify-between gap-4 py-1.5 border-b border-[#ede9fc]/5 last:border-0`.

Key: `text-xs text-[#7a7882] font-roboto shrink-0`.

Value: `text-xs text-[#ede9fc] font-roboto text-right`. Director and writer names use `text-[#b9a4fc]` to look like links.

Runtime: receive as minutes (e.g. `102`), display as `"1h 42m"`. Write a small helper `formatRuntime(mins: number): string`.

```typescript
export interface MovieInfoProps {
  director?: string
  writers?: string[]
  cinematography?: string
  music?: string
  runtime?: number
  language?: string
  country?: string
  studio?: string
  released?: string
}
```

---

### CastCrewSection

```
Cast    Crew                          see full cast →
────────────────────────────────────────────────────
 ⬤       ⬤       ⬤       ⬤       ⬤
Paul   Frankie  Celia  Brooklyn  Penelope
Mescal  Corio  R-Hall  Moves    Kirby
Calum  Sophie  Adult   Michael    Em
```

Tab bar: "Cast" and "Crew" tabs. Active tab has `border-b-2 border-[#b9a4fc] text-[#b9a4fc]`, inactive has `text-[#7a7882]`. "see full cast" is a small purple underline link on the far right.

Person card: circular image `w-16 h-16 rounded-full overflow-hidden bg-[#2b2c36]`. Use Next.js `<Image>` with `fill` and `object-cover`. If `profilePath` is null, show initials in the circle (first letter of each word in the name). Name below the circle in `text-xs font-semibold text-[#ede9fc] text-center mt-2 leading-tight`. Character/job below that in `text-xs text-[#7a7882] text-center`.

On desktop: show a row of 5 people. On mobile: make the row horizontally scrollable — `overflow-x-auto` with the inner div `flex gap-4 w-max` so it never wraps. Hide the scrollbar with inline style `style={{ scrollbarWidth: 'none' }}`.

```typescript
export interface CastMember {
  id: string
  name: string
  character?: string
  profilePath?: string | null
}

export interface CrewMember {
  id: string
  name: string
  job: string
  profilePath?: string | null
}

export interface CastCrewSectionProps {
  cast: CastMember[]
  crew: CrewMember[]
}
```

---

### GenreThemesSection

```
Genre    Themes
───────────────────────────────
[ Drama ]  [ Coming-of-age ]  [ Memory ]
```

Tab bar same pattern as CastCrewSection — "Genre" and "Themes" tabs.

Pill style: `bg-[#2b2c36] text-[#b9a4fc] text-sm px-4 py-1.5 rounded-full border border-[#b9a4fc]/30`.

If `themes` array is empty or undefined, show a `<p className="text-sm text-[#7a7882]">No themes tagged yet.</p>` placeholder.

```typescript
export interface GenreThemesSectionProps {
  genres: string[]
  themes?: string[]
}
```

---

### ReviewCard

Individual review card used inside `MovieCommunity`.

```
┌───────────────────────────────────────────┐
│  [av] rach_m                   ★★★★★      │
│                                           │
│  There is a haunting, rhythmic quality    │
│  to this film that most modern cinema     │
│  seems to have lost in the edit...        │
│                                           │
│  ♡ 41 likes  ·  💬 11 comments           │
└───────────────────────────────────────────┘
```

Avatar: `w-8 h-8 rounded-full overflow-hidden bg-[#714ee4]`. Show image if available, otherwise initials (first 2 chars of username, uppercase) in `text-white text-xs font-semibold`.

Star rating: displayed as 5 small `Star` icons (Lucide), filled = `fill-[#b9a4fc] text-[#b9a4fc]`, size 12.

Review text: full content, no truncation. `font-roboto text-sm text-[#ede9fc] leading-relaxed`.

Footer: `♡ {likeCount} likes · 💬 {commentCount} comments` in `text-xs text-[#7a7882]`. Use Lucide `Heart` and `MessageCircle` icons at size 12.

```typescript
export interface ReviewCardProps {
  user: { username: string; avatar?: string | null }
  rating: number
  content: string
  likeCount: number
  commentCount: number
  createdAt?: string
}
```

---

### MovieCommunity

Groups ReviewCards under a tabbed "Community" section.

```
Community                       check all reviews →
────────────────────────────────────────────────
Reviews   Posts   Lists
─────────
[ReviewCard]
[ReviewCard]
[ReviewCard]
```

"Community" heading: `font-outfit text-xl font-bold text-[#ede9fc]`. "check all reviews" link: `text-sm text-[#b9a4fc] underline`.

Tab switcher: same underline pattern as other sections. Show 3 `ReviewCard` components in the Reviews tab. Posts and Lists tabs show a simple `<p className="text-sm text-[#7a7882] py-4">Coming soon.</p>` placeholder.

```typescript
export interface MovieCommunityProps {
  movieId: string
  reviews: ReviewCardProps[]
}
```

---

### RecommendedRow

```
Recommended for you                        more →
┌────┐  ┌────┐  ┌────┐  ┌────┐
│    │  │    │  │    │  │    │
│    │  │    │  │    │  │    │
└────┘  └────┘  └────┘  └────┘
```

Header row: `font-outfit text-xl font-bold text-[#ede9fc]` on left, "more" underline link on right.

Desktop: `grid grid-cols-4 gap-4`.

Mobile: horizontally scrollable row — `flex gap-3 overflow-x-auto` with `style={{ scrollbarWidth: 'none' }}` and each poster wrapped in a `div` with `min-w-[140px]`.

**Use the existing `MoviePoster` component** from `@/components/films/MoviePoster`. Pass `id`, `title`, `posterPath`, `year`, `rating`, `ratingCount`. Do not recreate a poster component.

```typescript
import MoviePoster from '@/components/films/MoviePoster'

export interface RecommendedRowProps {
  movies: {
    id: string | number
    title: string
    posterPath: string | null
    year?: string | number
    rating?: number
    ratingCount?: number
  }[]
}
```

---

## Dummy data summary

Define and export a `DUMMY_*` const at the bottom of each file so the component renders without any API. Use the film **"Aftersun" (2022)** by Charlotte Wells, A24 studio, 102 min, English, UK/USA. Cast: Paul Mescal (Calum), Frankie Corio (Sophie), Celia Rowson-Hall (Adult Sophie). Rating 4.5 out of 117K. Genres: Drama, Coming-of-age, Memory.

---

## What NOT to build

- The hero banner at the top — Omar's task
- The soundtrack card — deferred for later
- The `src/app/films/[id]/page.tsx` file — Omar wires everything together
- Any backend routes or API calls
