import { Router } from "express";
import { getPopular, getTopRated } from "../controllers/movies.controller";

const router = Router()

router.get('/top-rated', getTopRated)
router.get('/popular', getPopular)

export default router