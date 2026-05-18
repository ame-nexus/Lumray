import { Request, Response } from "express";
import { tmdbService } from "../services/tmdb.service";

export const getTopRated = async (req: Request, res: Response) => {
    try {
        const topRated = await tmdbService.getTopRated()
        const filtered = topRated.results.filter((movie:{vote_count: number})=> movie.vote_count >= 5000)
        return res.json({data: filtered, error: null, message: 'ok'})
    } catch (error) {
        return res.status(500).json({data: null, error: 'Server error', message: String(error)})
    }
}

export const getByGenre = async (req: Request, res: Response) => {
    try {
        const genreId = parseInt(req.params.genreId as string)
        const movie = await tmdbService.getByGenre(genreId)
        return res.json({data: movie.results, error: null, message: 'ok'})
    } catch (error) {
        return res.status(500).json({data: null, error: 'Server error', message: String(error)})
    }
}