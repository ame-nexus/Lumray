import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
    api_key:     process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
    buffer: Buffer,
    folder: 'avatars' | 'covers' | 'messages',
    publicId?: string,
): Promise<string> {
    const transformation = folder === 'avatars'
        ? [{ width: 400, height: 400, crop: 'fill' as const, gravity: 'face' as const }]
        : folder === 'covers'
        ? [{ width: 1280, height: 400, crop: 'fill' as const }]
        : []

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder:         `lumray/${folder}`,
                public_id:      publicId,
                overwrite:      true,
                transformation,
                format:         folder === 'messages' ? undefined : 'webp',
                resource_type:  'auto',
            },
            (error, result) => {
                if (error || !result) return reject(error ?? new Error('Upload failed'))
                resolve(result.secure_url)
            },
        )
        stream.end(buffer)
    })
}
