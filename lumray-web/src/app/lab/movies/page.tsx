import FilmCard from "@/components/lab/FilmCard";
import { Movie } from "@/components/lab/FilmCard";

export const dynamic = 'force-dynamic'

async function getTrending() {
    const res = await fetch('http://localhost:5000/api/movies/top-rated', {
        cache: 'no-store'
    })
    const data = await res.json()
    return data.data
}

export default async function MoviesPage() {
    const movies = await getTrending()

    return (
        <div>
            <h1 className="text-[#ede9fc] text-2xl font-bold mb-6">Trending Films</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {movies.map((movie: Movie) => (
                    <FilmCard key={movie.id} movie={movie}/>
                ))}
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Lab — Movies',
}