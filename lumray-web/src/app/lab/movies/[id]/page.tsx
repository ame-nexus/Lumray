'use client'
import { Search } from 'lucide-react'
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation'


export default function MoviePage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    function setFilter(genre: string){
        const params = new URLSearchParams(searchParams.toString())
        params.set('genre', genre)
        console.log(params.values)

        router.push(`${pathname}?${params.toString()}`)
}
    return (
        <div>
            <h1>Movie Id: {params.id}</h1>
            <button onClick={() => router.push('/films')}>go to films</button><br />
            <button onClick={() => router.push('/films/123')}>go to film 123</button><br />
            <button onClick={() => router.back()}>back</button><br />
            <button onClick={() => router.forward()}>forward</button><br />
            <button onClick={() => router.refresh()}>refresh</button><br />
            <button onClick={() => router.replace('/login')}>replace</button><br />
            <button onClick={() => setFilter('action')}>filter</button><br />
            <h1>{pathname}</h1>
        </div>
    )
}