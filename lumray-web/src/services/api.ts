import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
})

api.interceptors.request.use((config) => {
    if(typeof window !== 'undefined'){
        const token = useAuthStore.getState().token
        if(token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url: string = error.config?.url ?? ''
        const isAuthRoute = url.includes('/api/auth/')
        if (error.response?.status === 401 && !isAuthRoute){
            useAuthStore.getState().logout()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api;