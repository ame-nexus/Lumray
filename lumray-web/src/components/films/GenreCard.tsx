import Image from 'next/image'

export interface GenreCardProps {
  name: string
  gradientFrom: string
  gradientTo: string
  posters: string[]
}

export default function GenreCard({ name, gradientFrom, gradientTo, posters }: GenreCardProps) {
  const thumbs = posters.slice(0, 3)

  return (
    <article className="group relative h-35 w-full cursor-pointer overflow-hidden rounded-xl transition-[filter] duration-300 hover:brightness-110 md:h-40">
      <div className="absolute inset-0 flex">
        {thumbs.map((src, i) => (
          <div key={i} className="relative h-full w-1/3 overflow-hidden">
            <Image
              src={src}
              alt=""
              fill
              sizes="133px"
              className="object-cover object-center scale-110"
              aria-hidden
            />
          </div>
        ))}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        }}
      />

      <h3 className="absolute bottom-3 left-3 font-outfit text-xl font-bold text-white drop-shadow-md leading-none md:text-2xl">
        {name}
      </h3>
    </article>
  )
}

export const GENRE_CARD_DUMMY: GenreCardProps[] = [
  {
    name: 'Drama',
    gradientFrom: 'rgba(26,16,53,0.85)',
    gradientTo: 'rgba(113,78,228,0.9)',
    posters: [
      'https://image.tmdb.org/t/p/w300/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      'https://image.tmdb.org/t/p/w300/sF1U4EUQS8YHUYjNl3pMGWMQumv.jpg',
      'https://image.tmdb.org/t/p/w300/arw2vcBveWOVZ6oa6TEq6NAsWzf.jpg',
    ],
  },
  {
    name: 'Horror',
    gradientFrom: 'rgba(13,0,0,0.85)',
    gradientTo: 'rgba(127,29,29,0.9)',
    posters: [
      'https://image.tmdb.org/t/p/w300/u3bZgnGQ9T01sWNjtva9LXs9KVe.jpg',
      'https://image.tmdb.org/t/p/w300/1XDDXPXGiI8id7MrUxKXkaWloP.jpg',
      'https://image.tmdb.org/t/p/w300/9GK7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    ],
  },
  {
    name: 'Sci-Fi',
    gradientFrom: 'rgba(5,13,26,0.85)',
    gradientTo: 'rgba(15,61,110,0.9)',
    posters: [
      'https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      'https://image.tmdb.org/t/p/w300/rSPw7tgCH9c6Nq1Zwe2lVvQ3YNz.jpg',
      'https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    ],
  },
  {
    name: 'Animation',
    gradientFrom: 'rgba(13,26,10,0.85)',
    gradientTo: 'rgba(45,107,26,0.9)',
    posters: [
      'https://image.tmdb.org/t/p/w300/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg',
      'https://image.tmdb.org/t/p/w300/inVdhWg99sFW7oCfcqNraEsKZv8.jpg',
      'https://image.tmdb.org/t/p/w300/8Vt6mWEReuy4OfC9ljwC3Jzp9XX.jpg',
    ],
  },
  {
    name: 'Thriller',
    gradientFrom: 'rgba(26,10,5,0.85)',
    gradientTo: 'rgba(122,46,8,0.9)',
    posters: [
      'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      'https://image.tmdb.org/t/p/w300/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      'https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    ],
  },
  {
    name: 'Romance',
    gradientFrom: 'rgba(26,13,26,0.85)',
    gradientTo: 'rgba(122,32,128,0.9)',
    posters: [
      'https://image.tmdb.org/t/p/w300/arw2vcBveWOVZ6oa6TEq6NAsWzf.jpg',
      'https://image.tmdb.org/t/p/w300/sF1U4EUQS8YHUYjNl3pMGWMQumv.jpg',
      'https://image.tmdb.org/t/p/w300/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg',
    ],
  },
  {
    name: 'Crime',
    gradientFrom: 'rgba(10,10,10,0.85)',
    gradientTo: 'rgba(50,50,60,0.9)',
    posters: [
      'https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      'https://image.tmdb.org/t/p/w300/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    ],
  },
  {
    name: 'Comedy',
    gradientFrom: 'rgba(26,20,5,0.85)',
    gradientTo: 'rgba(133,100,10,0.9)',
    posters: [
      'https://image.tmdb.org/t/p/w300/arw2vcBveWOVZ6oa6TEq6NAsWzf.jpg',
      'https://image.tmdb.org/t/p/w300/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg',
      'https://image.tmdb.org/t/p/w300/inVdhWg99sFW7oCfcqNraEsKZv8.jpg',
    ],
  },
]
