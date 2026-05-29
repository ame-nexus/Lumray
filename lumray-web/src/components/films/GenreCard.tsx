import Image from 'next/image'

export interface GenreCardProps {
  name: string
  gradientColor: string
  posters: string[]
}

export default function GenreCard({ name, gradientColor, posters }: GenreCardProps) {
  const thumbs = posters.slice(0, 3)

  return (
    <article
      className="group relative h-[180px] w-full max-w-[300px] cursor-pointer overflow-hidden rounded-xl transition-[filter] duration-300 hover:brightness-110"
    >
      <div className="absolute inset-0 flex">
        {thumbs.map((src, i) => (
          <div key={i} className="relative h-full w-1/3 overflow-hidden">
            <Image
              src={src}
              alt=""
              fill
              sizes="100px"
              className="object-cover object-center scale-110"
              aria-hidden
            />
          </div>
        ))}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${gradientColor} 0%, ${gradientColor}99 35%, ${gradientColor}55 60%, transparent 100%)`,
        }}
      />

      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />

      <h3 className="absolute bottom-4 left-4 font-outfit text-2xl font-bold text-white drop-shadow-md">
        {name}
      </h3>
    </article>
  )
}

export const GENRE_CARD_DUMMY: GenreCardProps[] = [
  {
    name: 'Drama',
    gradientColor: '#6B21A8',
    posters: [
      'https://image.tmdb.org/t/p/w300/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      'https://image.tmdb.org/t/p/w300/sF1U4EUQS8YHUYjNl3pMGWMQumv.jpg',
      'https://image.tmdb.org/t/p/w300/arw2vcBveWOVZ6oa6TEq6NAsWzf.jpg',
    ],
  },
  {
    name: 'Horror',
    gradientColor: '#991B1B',
    posters: [
      'https://image.tmdb.org/t/p/w300/u3bZgnGQ9T01sWNjtva9LXs9KVe.jpg',
      'https://image.tmdb.org/t/p/w300/1XDDXPXGiI8id7MrUxKXkaWloP.jpg',
      'https://image.tmdb.org/t/p/w300/9GK7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    ],
  },
  {
    name: 'Sci-Fi',
    gradientColor: '#1D4ED8',
    posters: [
      'https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      'https://image.tmdb.org/t/p/w300/rSPw7tgCH9c6Nq1Zwe2lVvQ3YNz.jpg',
      'https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    ],
  },
  {
    name: 'Animation',
    gradientColor: '#15803D',
    posters: [
      'https://image.tmdb.org/t/p/w300/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg',
      'https://image.tmdb.org/t/p/w300/inVdhWg99sFW7oCfcqNraEsKZv8.jpg',
      'https://image.tmdb.org/t/p/w300/8Vt6mWEReuy4OfC9ljwC3Jzp9XX.jpg',
    ],
  },
]
