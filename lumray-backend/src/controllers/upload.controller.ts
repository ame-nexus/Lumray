import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { uploadImage } from '../services/cloudinary.service'

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ data: null, error: 'Bad request', message: 'No file provided' })
        const url = await uploadImage(req.file.buffer, 'avatars', `avatar_${req.user!.id}`)
        return res.json({ data: { url }, error: null, message: 'Uploaded' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Upload failed', message: String(error) })
    }
}

export const uploadCover = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ data: null, error: 'Bad request', message: 'No file provided' })
        const url = await uploadImage(req.file.buffer, 'covers', `cover_${req.user!.id}`)
        return res.json({ data: { url }, error: null, message: 'Uploaded' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Upload failed', message: String(error) })
    }
}
