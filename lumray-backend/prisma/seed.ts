import dotenv from 'dotenv'
dotenv.config()

import { prisma }       from '../src/lib/prisma'
import { tmdbService }  from '../src/services/tmdb.service'
import argon2           from 'argon2'

// ── Types ──────────────────────────────────────────────────────────────────

interface TmdbDiscover {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  original_language: string
  genre_ids: number[]
  popularity: number
  vote_average: number
  vote_count: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length))
}

function weightedRating(bias: number): number {
  const offsets = [-1, -0.5, 0, 0, 0.5, 0.5, 1]
  const raw = bias + offsets[Math.floor(Math.random() * offsets.length)]
  return Math.min(5, Math.max(0.5, Math.round(raw * 2) / 2)
  )
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// ── Step 1 — ensure movies exist ───────────────────────────────────────────

async function ensureMovies(): Promise<string[]> {
  const count = await prisma.movie.count()
  console.log(`\nMovies already in DB: ${count}`)

  if (count < 50) {
    console.log('Running mini-sync (genres + 6 pages of discover)...')

    // Sync genres
    const genreData = await tmdbService.getGenres()
    const genres = genreData.genres as { id: number; name: string }[]
    await Promise.all(genres.map(g =>
      prisma.genre.upsert({
        where: { tmdbId: g.id },
        create: { tmdbId: g.id, name: g.name },
        update: { name: g.name },
      })
    ))
    const savedGenres = await prisma.genre.findMany({ select: { id: true, tmdbId: true } })
    const genreMap = new Map(savedGenres.map(g => [g.tmdbId, g.id]))
    console.log(`  Synced ${genreMap.size} genres`)

    // Fetch 6 pages of well-known movies
    for (let page = 1; page <= 6; page++) {
      const data = await tmdbService.discover(page)
      const movies = (data.results ?? []) as TmdbDiscover[]
      for (const m of movies) {
        const saved = await prisma.movie.upsert({
          where:  { tmdbId: m.id },
          create: {
            tmdbId:      m.id,
            title:       m.title,
            overview:    m.overview ?? '',
            posterPath:  m.poster_path,
            backdropPath: m.backdrop_path,
            releaseDate: m.release_date,
            language:    m.original_language,
            popularity:  m.popularity  ?? 0,
            voteAverage: m.vote_average ?? 0,
            voteCount:   m.vote_count   ?? 0,
          },
          update: {},
          select: { id: true, tmdbId: true },
        })
        const rows = (m.genre_ids ?? [])
          .filter(gid => genreMap.has(gid))
          .map(gid => ({ movieId: saved.id, genreId: genreMap.get(gid)! }))
        if (rows.length) {
          await prisma.movieGenre.createMany({ data: rows, skipDuplicates: true })
        }
      }
      console.log(`  Page ${page}/6 synced`)
      await new Promise(r => setTimeout(r, 400))
    }
  }

  const movies = await prisma.movie.findMany({
    take:    150,
    select:  { id: true },
    where:   { posterPath: { not: null } },
    orderBy: { voteCount: 'desc' },
  })
  console.log(`Using ${movies.length} movies for seeding`)
  return movies.map(m => m.id)
}

// ── Step 2 — seed users ────────────────────────────────────────────────────

const SEED_USERS = [
  {
    username: 'reelwatcher',
    email:    'reelwatcher@lumray.app',
    name:     'Sarah Chen',
    bio:      'Watching films since I was 8. Currently working through the Criterion Collection. Coffee + cinema = life.',
    movieCount:  18,
    reviewCount:  3,
    listCount:    2,
    postCount:    4,
    ratingBias:  3.5,
  },
  {
    username: 'auteur_ines',
    email:    'auteur.ines@lumray.app',
    name:     'Ines Moreau',
    bio:      'French cinema lover. Tarkovsky > everyone else. Film studies grad living in Paris. I watch Bergman for fun.',
    movieCount:  22,
    reviewCount:  4,
    listCount:    2,
    postCount:    5,
    ratingBias:  4.0,
  },
  {
    username: 'blockbuster_kai',
    email:    'blockbuster.kai@lumray.app',
    name:     'Kai Jordan',
    bio:      "Just here for the popcorn and spectacle. MCU completionist. Don't @ me about the Snyder Cut.",
    movieCount:  30,
    reviewCount:  2,
    listCount:    3,
    postCount:    5,
    ratingBias:  3.8,
  },
  {
    username: 'horrorhead_marcus',
    email:    'horrorhead@lumray.app',
    name:     'Marcus Webb',
    bio:      'Every night is a horror night. Slasher purist, slow-burn appreciator. Please recommend me something that will actually scare me.',
    movieCount:  20,
    reviewCount:  3,
    listCount:    2,
    postCount:    4,
    ratingBias:  3.5,
  },
  {
    username: 'cinecritique',
    email:    'cinecritique@lumray.app',
    name:     'Elena Reyes',
    bio:      'Writing about film since 2015. Guest contributor at two local film festivals. My ratings are harsh because I care.',
    movieCount:  25,
    reviewCount:  5,
    listCount:    3,
    postCount:    6,
    ratingBias:  3.2,
  },
  {
    username: 'filmfreak_dy',
    email:    'filmfreak.dy@lumray.app',
    name:     'Dylan Park',
    bio:      'Film school dropout turned obsessive. 400+ films a year. Favourite directors: Fincher, Villeneuve, Weerasethakul.',
    movieCount:  35,
    reviewCount:  4,
    listCount:    2,
    postCount:    5,
    ratingBias:  4.0,
  },
]

// ── Step 3 — seed content ──────────────────────────────────────────────────

const REVIEWS = [
  "An absolute masterpiece. The director balances breathtaking visuals with a deeply human story that left me speechless. Every frame feels deliberate and the performances are career-best work across the board. I haven't stopped thinking about the ending.",
  "There's something genuinely special happening here. The screenplay is tight, the pacing relentless, and the central performance anchors everything with quiet authority. This is the kind of film that reminds you why you fell in love with cinema.",
  "Not without its flaws — the second act drags slightly and one subplot feels undercooked — but when this film is firing on all cylinders, it's extraordinary. The cinematography alone justifies the watch. Will be revisiting.",
  "Overhyped. I went in with enormous expectations and while it's technically impressive, the emotional core feels hollow. The leads have chemistry but the script gives them little to work with. Worth watching once, not the classic people claim.",
  "Cinema at its most confident. There's a bravura quality to the filmmaking that's almost intoxicating — every sequence engineered for maximum impact, yet nothing feels cheap. A genuine crowd-pleaser that also has things to say. Rare.",
  "The kind of film that rewards patient viewers. The first hour is deliberately paced, almost frustratingly so, but by the third act you realise every quiet moment was load-bearing. Devastating in the best way.",
  "Watched this twice in the same week, something I almost never do. The performances are extraordinary — there are scenes here that rank among the best I've ever watched. The score is equally remarkable. My favourite film of the past five years.",
  "Solid but predictable. You can see every beat coming from a mile away, which robs the emotional moments of some of their power. The craft is undeniable and there's genuine heart here to make it worthwhile. Good, not great.",
  "A bold, uncompromising vision that won't work for everyone — and I suspect that's precisely the point. It's messy, ambitious, sometimes infuriating, and completely alive in a way that most studio films aren't. Flawed and swinging beats polished and safe.",
  "Technically extraordinary but emotionally distant. The production design and cinematography are among the finest I've encountered, yet the film never felt truly interested in its characters as people. A spectacle to admire.",
  "This shouldn't work as well as it does. On paper the premise sounds ridiculous, but in execution it becomes something quietly profound. The tonal balance is nearly perfect and the final twenty minutes are stunning. A genuine surprise.",
  "I've been chasing films like this my whole life — the kind that feel genuinely alive, where every performance crackles and every scene earns its place. One of the great films. Full stop.",
  "The cinematographer does something extraordinary with light here. Every scene looks like a painting. The story is relatively simple but the visual language elevates it into something transcendent. Worth watching for the craft alone.",
  "Emotionally exhausting in the best possible way. By the final act I was completely wrung out — not from manipulation but from genuine investment. Films like this are the reason I watch as many as I do.",
  "A slow burn that earns every moment of its runtime. The restraint on display here is remarkable — so much is communicated through silence and glance rather than dialogue. One of the most assured directorial efforts of recent years.",
]

const POSTS = [
  "Just finished my first watch of this one and I don't know how to explain the feeling it left me with. Some films just hit different depending on where you are in life.",
  "Hot take: the director's earlier low-budget work is more interesting than their acclaimed studio films. The constraints forced creativity that all the money in the world can't replicate.",
  "Rewatched this for the third time last night. Found something completely new in it. This is what great cinema does — it changes as you change.",
  "The ending made me sob on a train. The person next to me was very concerned. 10/10 would embarrass myself again.",
  "Genuinely cannot understand the negative reception to this film. One of the most technically accomplished things I've seen in years and people are complaining about the runtime.",
  "Film discourse has completely rotted my brain. I spent two hours this week arguing about genre classifications. This is not the life I imagined.",
  "The practical effects in 80s and 90s films are still unmatched. Knowing a real stunt happened makes everything so much more visceral.",
  "Currently working through my watchlist before the year ends. Down to 47 films. Send help.",
  "My rating system: 5 stars = changed my life, 4 = brilliant, 3 = good, 2 = fine, 1 = wasted my evening. I almost never give 1 stars.",
  "The best film scores are the ones you don't notice until you've been humming them for three days straight.",
  "Watched something tonight that genuinely made me feel hopeful about cinema. Won't name it yet — need to sit with it — but wow.",
  "Just realised I've been recommending the same five films to everyone I know for two years. Maybe it's time to expand the list.",
  "The cinematography in this is extraordinary. Every scene feels considered, every cut purposeful. It's the kind of visual language that takes years to develop.",
  "Watching films alone vs with someone who loves cinema as much as you do are genuinely different experiences. Both valid. Both necessary.",
  "Three films back-to-back last night. Four hours of sleep. Would absolutely do it again.",
  "A24 rejection letter → indie darling pipeline is real and I'm not complaining. Some of the best films of the decade came from that.",
  "What's the most underrated film you've watched this year? Genuinely asking — I need new recommendations.",
  "The first fifteen minutes of this film are some of the best filmmaking I've seen. The rest is just as good but those fifteen minutes make you sit up differently.",
  "There's a specific kind of loneliness that only certain films can make you feel seen about. Grateful for those films.",
  "If you're not watching the films of the country you visit, you're only seeing the surface of it.",
]

const LIST_PRESETS = [
  { name: 'Films That Changed Me',      description: 'The ones that genuinely rewired how I see the world.' },
  { name: 'Perfect Sunday Watches',     description: 'Slow, beautiful, and not too demanding. Save these for the couch.' },
  { name: 'Gateway Films',              description: "Start here if you're new to serious cinema." },
  { name: 'Underrated Masterpieces',    description: 'Films that deserve ten times more attention than they get.' },
  { name: 'All-Time Favourites',        description: 'The films I would take to a desert island.' },
  { name: 'Watch List 2025',            description: 'Films I need to get through this year. Growing faster than I can watch.' },
  { name: 'Best Cinematography',        description: 'For when you want to be visually destroyed.' },
  { name: 'Comfort Rewatches',          description: 'Films I return to whenever I need them.' },
  { name: 'Slow Cinema',               description: 'Films that take their time. You should too.' },
  { name: 'Late Night Picks',           description: 'When everyone else is asleep and you have the screen to yourself.' },
  { name: 'Essential Horror',           description: 'The films that made the genre what it is.' },
  { name: 'Directors to Follow',        description: 'Filmmakers whose entire catalogue I want to watch.' },
]

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Lumray Seed ===\n')

  // 1. Ensure movies exist
  const movieIds = await ensureMovies()
  if (movieIds.length < 10) {
    throw new Error('Not enough movies in DB to seed. Check TMDb API key.')
  }

  // 2. Hash password (same for all seed users — lumray123)
  console.log('\nHashing passwords...')
  const passwordHash = await argon2.hash('lumray123')

  // 3. Create users
  console.log('Creating users...')
  const createdUsers: { id: string; username: string; movieCount: number; reviewCount: number; listCount: number; postCount: number; ratingBias: number }[] = []

  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where:  { email: u.email },
      create: {
        email:         u.email,
        username:      u.username,
        name:          u.name,
        bio:           u.bio,
        passwordHash,
        emailVerified: true,
        points:        Math.floor(Math.random() * 400) + 50,
        level:         Math.floor(Math.random() * 4) + 1,
      },
      update: { name: u.name, bio: u.bio },
      select: { id: true, username: true },
    })
    createdUsers.push({ ...u, id: user.id, username: user.username })
    console.log(`  ✓ ${user.username} (${user.id})`)
  }

  // 4. Follows — create a realistic social graph
  console.log('\nCreating follows...')
  const followPairs = [
    [0, 1], [0, 2], [0, 4], [0, 5],
    [1, 0], [1, 4], [1, 5],
    [2, 0], [2, 3], [2, 5],
    [3, 0], [3, 1], [3, 5],
    [4, 0], [4, 1], [4, 2], [4, 5],
    [5, 0], [5, 1], [5, 4],
  ]
  for (const [fi, ti] of followPairs) {
    await prisma.follow.upsert({
      where:  { followerId_followingId: { followerId: createdUsers[fi].id, followingId: createdUsers[ti].id } },
      create: { followerId: createdUsers[fi].id, followingId: createdUsers[ti].id, createdAt: daysAgo(Math.floor(Math.random() * 60) + 5) },
      update: {},
    })
  }
  console.log(`  ✓ ${followPairs.length} follow relationships`)

  // 5. Diary entries, ratings, reviews
  console.log('\nCreating diary entries, ratings & reviews...')
  const allReviews: string[] = []

  for (const u of createdUsers) {
    const userMovies = pick(movieIds, u.movieCount)
    const reviewMovies = pick(userMovies, u.reviewCount)

    // Diary entries
    for (let i = 0; i < userMovies.length; i++) {
      const mid = userMovies[i]
      const rating = weightedRating(u.ratingBias)
      await prisma.diaryEntry.create({
        data: {
          userId:    u.id,
          movieId:   mid,
          watchedAt: daysAgo(Math.floor(Math.random() * 120) + 1),
          rating,
          isRewatch: Math.random() < 0.15,
          notes:     Math.random() < 0.3 ? 'Watched with friends. Great time.' : null,
        },
      })
      // Ratings (unique per user+movie)
      await prisma.rating.upsert({
        where:  { userId_movieId: { userId: u.id, movieId: mid } },
        create: { userId: u.id, movieId: mid, score: rating },
        update: { score: rating },
      })
    }

    // Reviews
    const reviewTexts = shuffle(REVIEWS)
    for (let i = 0; i < reviewMovies.length; i++) {
      const mid = reviewMovies[i]
      const rating = weightedRating(u.ratingBias)
      const review = await prisma.review.upsert({
        where:  { userId_movieId: { userId: u.id, movieId: mid } },
        create: {
          userId:  u.id,
          movieId: mid,
          content: reviewTexts[i % reviewTexts.length],
          rating,
          createdAt: daysAgo(Math.floor(Math.random() * 90) + 1),
        },
        update: {},
        select: { id: true },
      })
      allReviews.push(review.id)
    }

    console.log(`  ✓ ${u.username}: ${userMovies.length} diary, ${reviewMovies.length} reviews`)
  }

  // 6. Review likes (cross-user)
  console.log('\nCreating review likes...')
  let reviewLikeCount = 0
  for (const u of createdUsers) {
    const reviewsToLike = pick(allReviews, Math.floor(Math.random() * 6) + 3)
    for (const reviewId of reviewsToLike) {
      try {
        await prisma.reviewLike.upsert({
          where:  { userId_reviewId: { userId: u.id, reviewId } },
          create: { userId: u.id, reviewId },
          update: {},
        })
        reviewLikeCount++
      } catch { /* skip conflicts */ }
    }
  }
  console.log(`  ✓ ${reviewLikeCount} review likes`)

  // 7. Lists
  console.log('\nCreating lists...')
  for (const u of createdUsers) {
    const userMovies = pick(movieIds, 20)
    const listPresets = pick(LIST_PRESETS, u.listCount)

    for (let li = 0; li < listPresets.length; li++) {
      const preset = listPresets[li]
      const isPrivate = li === listPresets.length - 1 && Math.random() < 0.4

      const list = await prisma.list.create({
        data: {
          userId:      u.id,
          name:        preset.name,
          description: preset.description,
          isPublic:    !isPrivate,
          createdAt:   daysAgo(Math.floor(Math.random() * 60) + 5),
        },
        select: { id: true },
      })

      const listMovies = pick(userMovies, Math.floor(Math.random() * 5) + 5)
      for (let order = 0; order < listMovies.length; order++) {
        await prisma.listItem.upsert({
          where:  { listId_movieId: { listId: list.id, movieId: listMovies[order] } },
          create: { listId: list.id, movieId: listMovies[order], order },
          update: {},
        })
      }
    }
    console.log(`  ✓ ${u.username}: ${listPresets.length} lists`)
  }

  // 8. Posts
  console.log('\nCreating posts...')
  const allPosts: string[] = []
  const postTexts = shuffle(POSTS)
  let postTextIdx = 0

  for (const u of createdUsers) {
    const postMovies = pick(movieIds, u.postCount)

    for (let pi = 0; pi < u.postCount; pi++) {
      const withMovie = Math.random() < 0.45
      const post = await prisma.post.create({
        data: {
          userId:    u.id,
          movieId:   withMovie ? postMovies[pi % postMovies.length] : null,
          content:   postTexts[postTextIdx++ % postTexts.length],
          tags:      pick(['cinema', 'film', 'review', 'recommend', 'discussion', 'arthouse', 'horror', 'scifi', 'drama', 'thriller'], Math.floor(Math.random() * 3)),
          createdAt: daysAgo(Math.floor(Math.random() * 60) + 1),
        },
        select: { id: true },
      })
      allPosts.push(post.id)
    }
    console.log(`  ✓ ${u.username}: ${u.postCount} posts`)
  }

  // 9. Post likes (cross-user)
  console.log('\nCreating post likes...')
  let postLikeCount = 0
  for (const u of createdUsers) {
    const postsToLike = pick(allPosts, Math.floor(Math.random() * 8) + 4)
    for (const postId of postsToLike) {
      try {
        await prisma.postLike.upsert({
          where:  { userId_postId: { userId: u.id, postId } },
          create: { userId: u.id, postId },
          update: {},
        })
        postLikeCount++
      } catch { /* skip conflicts */ }
    }
  }
  console.log(`  ✓ ${postLikeCount} post likes`)

  // 10. Comments on posts
  console.log('\nCreating comments...')
  const COMMENT_TEXTS = [
    'Completely agree with this.',
    'Interesting take — I had a very different reaction.',
    'This is exactly how I felt. Glad someone put it into words.',
    'Which film are you talking about? Very curious now.',
    'I was not expecting to like this as much as I did.',
    'The ending really got me.',
    'Need to rewatch this with your perspective in mind.',
    'Adding this to my list immediately.',
    'The cinematography is the whole reason I stayed.',
    'Underrated film. More people need to watch it.',
    'I had a similar experience on the train home from work.',
    "Strongly disagree but I respect the take.",
  ]

  let commentCount = 0
  const commentablePosts = pick(allPosts, Math.min(allPosts.length, 12))
  for (const postId of commentablePosts) {
    const commenters = pick(createdUsers, Math.floor(Math.random() * 3) + 1)
    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          userId:    commenter.id,
          postId,
          content:   COMMENT_TEXTS[Math.floor(Math.random() * COMMENT_TEXTS.length)],
          createdAt: daysAgo(Math.floor(Math.random() * 30) + 1),
        },
      })
      commentCount++
    }
  }
  console.log(`  ✓ ${commentCount} comments`)

  // 11. Watchlist items
  console.log('\nCreating watchlists...')
  let watchlistCount = 0
  for (const u of createdUsers) {
    const wlMovies = pick(movieIds, Math.floor(Math.random() * 10) + 5)
    for (const movieId of wlMovies) {
      try {
        await prisma.watchlist.upsert({
          where:  { userId_movieId: { userId: u.id, movieId } },
          create: { userId: u.id, movieId },
          update: {},
        })
        watchlistCount++
      } catch { /* skip */ }
    }
  }
  console.log(`  ✓ ${watchlistCount} watchlist entries`)

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n=== Seed complete ===')
  console.log(`Users:    ${createdUsers.length}  (password: lumray123)`)
  console.log(`Follows:  ${followPairs.length}`)
  console.log(`Reviews:  ${allReviews.length}`)
  console.log(`Posts:    ${allPosts.length}`)
  console.log('\nSeed accounts:')
  for (const u of SEED_USERS) {
    console.log(`  ${u.username.padEnd(20)} ${u.email}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
