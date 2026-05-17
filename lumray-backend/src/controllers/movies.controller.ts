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

export const getPopular = async (req: Request, res: Response) => {
    try {
        const popular = await tmdbService.getPopular()
        return res.json({data: popular.results, error: null, message: 'ok'})
    } catch (error) {
        return res.status(500).json({data: null, error: 'Server error', message: String(error)})
    }
}