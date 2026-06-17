# Profile Page — Component Specification

> This document is for the teammate building the Profile page.
> Reference design: Figma → Profile, Diary tabs.
> Stack: Next.js 14 App Router · TypeScript · Tailwind CSS · Lucide React · Zustand

---

## Route structure

```
src/app/profile/
└── [username]/
    ├── page.tsx          ← Profile tab (default)
    ├── diary/page.tsx    ← Diary tab
    ├── films/page.tsx    ← Films tab
    ├── reviews/page.tsx  ← Reviews tab
    ├── lists/page.tsx    ← Lists tab
    └── stats/page.tsx    ← Stats tab
```

Each sub-page shares the same `ProfileHeader` and `ProfileTabs` — put them in a `layout.tsx` at the `[username]` level so they don't re-render on tab switch.

---

## Layout pattern (desktop)

All tabs use a **2-column layout** identical to the film detail page:

```
┌─────────────────────────────────┬──────────────┐
│  Main content  (flex-1)         │  Sidebar     │
│                                 │  (w-72 xl:w-80) │
└─────────────────────────────────┴──────────────┘
```

```tsx
<div className="flex gap-8 xl:gap-12 px-6 md:px-12 xl:px-60 py-10">
  <div className="min-w-0 flex-1 space-y-10">{/* main */}</div>
  <div className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col gap-4">{/* sidebar */}</div>
</div>
```

On mobile the sidebar collapses and stacks below main content or is hidden depending on the card.

---

## Shared components

---

### `ProfileHeader`

**File:** `src/components/profile/ProfileHeader.tsx`

**Props:**
```typescript
interface ProfileHeaderProps {
  username: string
  name: string | null
  bio: string | null
  avatar: string | null
  coverImage: string | null
  memberSince: string        // ISO date string
  isOwnProfile: boolean
  stats: {
    totalFilms: number
    thisYear: number
    following: number
    followers: number
  }
}
```

**Layout:**
- Full-width cover image (height ~280px desktop, ~200px mobile) — use `object-cover`
- Avatar overlaps the bottom edge of the cover (translate-y-1/2 trick), circular, ~96px desktop / 72px mobile, `ring-2 ring-bg`
- Name + "Edit profile" button sit to the right of the avatar on desktop
- Bio text below the name
- Stats row: Films · This year · Following · Followers — each is a number + label, separated by a subtle vertical divider
- "Member since" displayed as "Member since 2024" in muted text

**Responsiveness:**
- Mobile: avatar shrinks to 72px, name font shrinks, stats row wraps to 2×2 grid if needed
- Tablet: same as desktop but slightly smaller cover
- The "Edit profile" button is hidden entirely when `isOwnProfile === false`
- Cover image falls back to a gradient `bg-gradient-to-r from-bg-dark to-surface` if `coverImage` is null
- Avatar falls back to initials in a purple circle if `avatar` is null

**Key classes:**
```tsx
// Cover
<div className="relative h-48 md:h-64 xl:h-72 w-full overflow-hidden">
  <Image src={coverImage} fill className="object-cover object-center" />
  {/* dark gradient overlay so text is readable */}
  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
</div>

// Avatar — positioned absolute, overlapping cover bottom
<div className="absolute -bottom-12 left-6 md:left-12 xl:left-60 h-24 w-24 rounded-full ring-4 ring-bg overflow-hidden">

// Stats row
<div className="flex items-center gap-6 md:gap-10">
  {/* each stat */}
  <div className="flex flex-col items-center">
    <span className="font-outfit text-xl font-bold text-text">{value}</span>
    <span className="font-roboto text-xs text-text-muted">{label}</span>
  </div>
  <div className="h-8 w-px bg-text/10" /> {/* divider */}
</div>
```

---

### `ProfileTabs`

**File:** `src/components/profile/ProfileTabs.tsx`

**Props:**
```typescript
interface ProfileTabsProps {
  username: string
  activeTab: 'profile' | 'films' | 'diary' | 'reviews' | 'lists' | 'stats'
}
```

**Tabs:** Profile · Films · Diary · Reviews · Lists · Stats

**Behaviour:**
- Each tab is a `<Link>` to `/profile/[username]`, `/profile/[username]/diary`, etc.
- Active tab has `border-b-2 border-purple-light text-text font-semibold`
- Inactive tabs: `text-text-muted hover:text-text-dim`

**Responsiveness:**
- Desktop: tabs on one row, full width, `border-b border-text/10`
- Mobile: horizontally scrollable, `overflow-x-auto scrollbar-none`, tabs don't wrap
- Tab font: `font-outfit text-sm`

---

## Profile Tab components

---

### `FavoritesRow`

**File:** `src/components/profile/FavoritesRow.tsx`

**Props:**
```typescript
interface FavoritesRowProps {
  movies: { id: string; title: string; posterPath: string | null }[]
}
```

**Layout:**
- Heading "Favorites" in `font-outfit font-semibold`
- 4 movie poster cards in a horizontal row
- Each poster: `aspect-2/3 rounded-lg overflow-hidden` with hover scale effect
- Clicking a poster links to `/films/[id]`
- If `movies` is empty show 4 dashed placeholder boxes

**Responsiveness:**
- Desktop: 4 posters side by side, roughly equal width
- Tablet: same
- Mobile: horizontal scroll if less than 4 posters, or reduce to 3 visible

---

### `RecentDiaryRow`

**File:** `src/components/profile/RecentDiaryRow.tsx`

**Props:**
```typescript
interface RecentDiaryRowProps {
  username: string
  entries: {
    id: string
    movie: { id: string; title: string; posterPath: string | null }
    watchedAt: string
    rating: number | null
  }[]
}
```

**Layout:**
- Row header: "Recent diary entries" (left) + "more →" link to `/profile/[username]/diary` (right)
- 4 poster thumbnails in a row, each with rounded corners and shadow
- No text labels under posters — clean poster-only grid

**Responsiveness:**
- Mobile: show 3 posters instead of 4
- Use `grid grid-cols-3 md:grid-cols-4` for the poster grid

---

### `RecentReviewsList`

**File:** `src/components/profile/RecentReviewsList.tsx`

**Props:**
```typescript
interface RecentReviewsListProps {
  username: string
  reviews: {
    id: string
    movie: { id: string; title: string; posterPath: string | null; releaseDate: string | null }
    content: string
    rating: number | null
    createdAt: string
    _count: { likes: number; comments: number }
    isRewatch?: boolean
  }[]
}
```

**Layout of each `ReviewCard`:**
```
┌──────┬────────────────────────────────────────┐
│poster│ TITLE  year              [Watched badge]│
│      │ ★★★★☆  2 May 2025                      │
│      │ review text (line-clamp-3)...           │
│      │ ♡ 41 likes  💬 11 comments             │
└──────┴────────────────────────────────────────┘
```

- Poster: `w-20 h-28` with `rounded-lg object-cover`
- Title: uppercase, `font-outfit font-bold text-sm tracking-wide`
- Stars: use the shared `StarRating` component (read-only)
- Date: `font-roboto text-xs text-text-muted`
- Content: `font-roboto text-sm text-text-dim line-clamp-3`
- Likes/comments row: `Heart` and `MessageCircle` icons from Lucide, `text-xs text-text-muted`
- Cards separated by `border-b border-text/10`

**Responsiveness:**
- Full width on all sizes — stacks naturally
- On mobile the poster shrinks to `w-16 h-22`

---

### `AvgRatingCard` (sidebar)

**File:** `src/components/profile/AvgRatingCard.tsx`

**Props:**
```typescript
interface AvgRatingCardProps {
  average: number       // e.g. 4.2
  totalRatings: number  // e.g. 254
  distribution: number[] // [count per star 1–5], length 5
}
```

**Layout:**
- Card shell: `bg-surface rounded-xl p-4`
- Header row: "Avg Rating" label (left) + total count (right, muted)
- Large number: `font-outfit text-4xl font-bold text-text`
- Star row below the number (read-only, half-star support)
- Bar chart: 5 vertical bars, heights proportional to distribution counts, purple fill `bg-purple`

**Responsiveness:**
- Full width of the sidebar column
- On mobile this card is hidden (sidebar collapses) — show only on `lg:`

---

### `RecentActivityCard` (sidebar)

**File:** `src/components/profile/RecentActivityCard.tsx`

**Props:**
```typescript
interface ActivityItem {
  id: string
  type: 'logged' | 'reviewed' | 'added' | 'followed'
  text: string        // e.g. "Logged Aftersun and gave it 5 stars"
  createdAt: string   // relative time: "3 hours ago"
}

interface RecentActivityCardProps {
  items: ActivityItem[]
}
```

**Layout:**
- "Recent activity" heading
- Each item: icon (circle with type-specific icon) + text + time
  - `logged` → `Eye` icon, purple bg
  - `reviewed` → `PenLine` icon, purple bg
  - `added` → `Plus` icon, purple bg
  - `followed` → `UserPlus` icon, purple bg
- Icon circle: `h-8 w-8 rounded-full bg-purple/20 text-purple-light`
- Text: `font-roboto text-xs text-text-dim line-clamp-2`
- Time: `font-roboto text-[10px] text-text-muted`

---

### `WatchStreakCard` (sidebar)

**File:** `src/components/profile/WatchStreakCard.tsx`

**Props:**
```typescript
interface WatchStreakCardProps {
  currentStreak: number
  personalBest: number
  activeDays: ('M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S')[]
}
```

**Layout:**
- "Watch streak 🔥" heading
- Large number + "days in a row"
- "Personal best: X days" in muted text
- 7 day circles: M T W T F S S — filled purple if active, muted if not
  ```tsx
  <div className="flex gap-1.5 mt-3">
    {days.map((d, i) => (
      <div key={i} className={`h-8 w-8 rounded-full flex items-center justify-center font-roboto text-xs
        ${activeDays.includes(i) ? 'bg-purple text-white' : 'bg-surface-2 text-text-muted'}`}>
        {d}
      </div>
    ))}
  </div>
  ```

---

### `TasteBadgesCard` (sidebar)

**File:** `src/components/profile/TasteBadgesCard.tsx`

**Props:**
```typescript
interface Badge {
  id: string
  label: string      // e.g. "Drama King"
  emoji: string      // e.g. "🎭"
  description: string // e.g. "50 dramas watched"
}

interface TasteBadgesCardProps {
  badges: Badge[]
}
```

**Layout:**
- "Taste badges" heading
- 2×2 grid of badge cards
- Each badge: emoji (large) + label (bold) + description (muted xs)
- Badge card: `bg-surface-2 rounded-lg p-3 flex flex-col items-center text-center`

---

## Diary Tab components

---

### `DiaryToolbar`

**File:** `src/components/profile/DiaryToolbar.tsx`

**Props:**
```typescript
interface DiaryToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  view: 'list' | 'grid'
  onViewChange: (v: 'list' | 'grid') => void
  onFilterOpen: () => void
}
```

**Layout:**
- Search input (left): `border border-text/10 bg-surface-2 rounded-lg px-3 py-1.5 text-sm`
- Filter button (next to search): `bg-purple text-white rounded-lg px-3 py-1.5 text-sm`
- View toggle (right): two icon buttons — `List` and `LayoutGrid` from Lucide
  - Active view button gets `text-purple-light`, inactive `text-text-muted`

**Responsiveness:**
- Mobile: search takes full width, filter + toggle sit below on a second row
- Desktop: all on one row, search takes `max-w-xs`

---

### `DiaryMonthGroup`

**File:** `src/components/profile/DiaryMonthGroup.tsx`

**Props:**
```typescript
interface DiaryMonthGroupProps {
  month: string   // e.g. "May 2025"
  entries: DiaryEntryData[]
  view: 'list' | 'grid'
}
```

**Layout:**
- Month label: `font-outfit text-sm font-semibold text-text-muted mb-3`
- Renders a list of `DiaryEntryRow` components
- In grid view, renders `DiaryEntryGrid` (poster-only grid, 4 cols)

---

### `DiaryEntryRow`

**File:** `src/components/profile/DiaryEntryRow.tsx`

**Props:**
```typescript
interface DiaryEntryData {
  id: string
  watchedAt: string
  isRewatch: boolean
  rating: number | null
  movie: {
    id: string
    title: string
    releaseDate: string | null
    posterPath: string | null
  }
}
```

**Layout:**
```
┌────┬──────┬──────────────────────────────────┬────┬────┐
│DATE│POSTER│ Title           year             │ ✏️ │ 🗑️ │
│ 12 │      │ ★★★★★                            │    │    │
│Mon │      │ ○ Rewatch                        │    │    │
└────┴──────┴──────────────────────────────────┴────┴────┘
```

- Date block: day number (bold, large) + weekday abbreviation (muted xs) — `bg-surface-2 rounded-lg px-2 py-1 text-center min-w-[40px]`
- Poster: `w-14 h-20 rounded-md object-cover`
- Title: `font-outfit font-semibold text-sm text-text`
- Year: `font-roboto text-xs text-text-muted`
- Stars: read-only, small size (16px)
- Rewatch badge: `○ Rewatch` in `text-purple-light text-xs` — only shown if `isRewatch === true`
- Edit + Delete: icon buttons, appear on hover (`opacity-0 group-hover:opacity-100`)

**Responsiveness:**
- Mobile: hide the edit/delete icons behind a `⋯` menu button
- Date block shrinks on mobile — show only the day number, not weekday
- Poster stays visible on all sizes

---

### `DiaryStatsCard` (sidebar)

**File:** `src/components/profile/DiaryStatsCard.tsx`

**Props:**
```typescript
interface DiaryStatsCardProps {
  totalFilms: number
  thisYear: number
  thisMonth: number
  rewatches: number
  firstWatches: number
  avgPerMonth: number
}
```

**Layout:**
- Card shell: `bg-surface rounded-xl p-4`
- "Diary stats" heading
- Each stat on its own row: label (left, muted) + value (right, bold white)
  ```tsx
  <div className="flex justify-between py-1.5 border-b border-text/10 last:border-0">
    <span className="font-roboto text-sm text-text-muted">{label}</span>
    <span className="font-roboto text-sm font-semibold text-text">{value}</span>
  </div>
  ```

**Responsiveness:**
- Sidebar only (`hidden lg:block`) — on mobile, stats are not shown in diary tab

---

### `DiaryPagination`

**File:** `src/components/profile/DiaryPagination.tsx`

**Props:**
```typescript
interface DiaryPaginationProps {
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
}
```

**Layout:**
- Full-width row: Prev button (left) + Next button (right)
- Prev: ghost button `border border-text/15 text-text rounded-lg px-5 py-2`
- Next: filled button `bg-purple text-white rounded-lg px-5 py-2`
- Disabled state: `opacity-40 cursor-not-allowed`

---

## General responsiveness rules

| Breakpoint | Behaviour |
|---|---|
| `< md` (mobile) | Sidebar hidden, single column, horizontal scroll for poster rows, smaller avatars/text |
| `md` (tablet) | Sidebar still hidden, slightly wider padding, 2-col grids become possible |
| `lg` (desktop) | Sidebar appears, 2-col layout activates, all stats visible |
| `xl` (wide) | Padding increases (`xl:px-60`), sidebar widens to `w-80` |

- **Never use inline styles** — Tailwind arbitrary values only (`text-[#ede9fc]`, `w-[146px]`)
- **Fonts:** Outfit for headings/labels, Roboto for body/metadata
- **Colors:** follow the design system in `CLAUDE.md` — use the exact hex values
- **Images:** always `next/image` with `fill` + `object-cover`, never `<img>`
- **Links:** always `next/link`, never `<a>` for internal routes
- **Icons:** Lucide React only

---

## Data fetching notes

- All profile data comes from the backend API via the Axios instance at `src/services/api.ts`
- Profile pages are **public** (guests can view) — no auth required for GET requests
- Use server components for the initial page load (pass `params.username` as a prop)
- Interactive parts (follow button, diary edit/delete) must be `'use client'` components
- Diary tab should support pagination — `?page=1` query param

```typescript
// Example fetch inside a server component
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`, {
  next: { revalidate: 60 }
})
```
