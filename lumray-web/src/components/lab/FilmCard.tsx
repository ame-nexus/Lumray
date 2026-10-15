import WatchListButton from "./WatchListButton";

export interface Movie {
    id: number,
    title: string,
    poster_path: string | null,
    vote_average: number
}

export default function FilmCard({ movie }: { movie: Movie }) {
    return (
        <div className="bg-[#383a47] rounded-xl border border-[#ede9fc]/10 p-3 flex flex-col gap-2">
            {movie.poster_path ? (
                <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg w-full object-cover"
                />
            ) : (
                <div className="w-full h-48 bg-[#2c2d38] rounded-lg flex items-center justify-center">
                    <span className="text-[#7a7882]">No poster</span>
                </div>
            )}
            <p className="text-[#ede9fc] font-semibold text-sm">{movie.title}</p>
            <p className="text-[#b9a4fc] text-xs">⭐ {movie.vote_average.toFixed(1)}</p>
            <WatchListButton
                movieId={String(movie.id)}
                title={movie.title}
                posterPath={movie.poster_path}
            />
        </div>
    )
}