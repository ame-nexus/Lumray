import { Router } from "express";
import { getByGenre, getTopRated } from "../controllers/movies.controller";

const router = Router()

router.get('/top-rated', getTopRated)
router.get('/by-genre/:genreId', getByGenre)

export default router