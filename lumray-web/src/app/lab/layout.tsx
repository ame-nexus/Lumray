import QueryProvider from "@/components/lab/QueryProvider"

export default function LabLayout({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <div className="flex min-h-screen">
                <aside className="w-48 bg-[#1a1b21] p-4 flex flex-col gap-2">
                    <p className="text-[#b9a4fc] font-bold mb-4">Lab</p>
                    <a href="/lab" className="text-[#ede9fc] hover:text-[#b9a4fc]">Home</a>
                    <a href="/lab/movies" className="text-[#ede9fc] hover:text-[#b9a4fc]">Movies</a>
                    <a href="/lab/watchlist" className="text-[#ede9fc] hover:text-[#b9a4fc]">Watchlist</a>
                    <a href="/lab/search" className="text-[#ede9fc] hover:text-[#b9a4fc]">Search</a>
                </aside>
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </QueryProvider>
    )
}
