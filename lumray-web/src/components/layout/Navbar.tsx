import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
    return (
        <nav className='sticky top-0 z-50 bg-bg-dark mb-6'>

            {/* Desktop — single row */}
            <div className='hidden md:flex items-center justify-between px-12 xl:px-60 h-[84px]'>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/images/lumray-icon.svg" alt="Lumray" width={42} height={42} />
                    <span className="font-outfit text-2xl font-bold text-white">lumray</span>
                </Link>
                <div className='flex items-center gap-6 xl:gap-10'>
                    <Link href="/home" className='text-text font-medium text-base xl:text-lg hover:text-purple-light'>Home</Link>
                    <Link href="/films" className="text-text font-medium text-base xl:text-lg hover:text-purple-light">Films</Link>
                    <Link href="/community" className="text-text font-medium text-base xl:text-lg hover:text-purple-light">Community</Link>
                    <Link href="/lists" className="text-text font-medium text-base xl:text-lg hover:text-purple-light">Lists</Link>
                    <Link href="/login" className="text-text font-medium text-base xl:text-lg hover:text-purple-light">Log In</Link>
                    <Link href="/signup" className="bg-purple text-white font-medium text-base px-4.5 py-2.5 rounded-full hover:bg-purple-deep transition-colors whitespace-nowrap">Get Started</Link>
                </div>
            </div>

            {/* Mobile — two rows */}
            <div className='md:hidden'>
                {/* Row 1 — logo + auth */}
                <div className='flex items-center justify-between px-6 h-[60px]'>
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/images/lumray-icon.svg" alt="Lumray" width={32} height={32} />
                        <span className="font-outfit text-xl font-bold text-white">lumray</span>
                    </Link>
                    <div className='flex items-center gap-3'>
                        <Link href="/login" className="text-text font-medium text-sm hover:text-purple-light">Log In</Link>
                        <Link href="/signup" className="bg-purple text-white font-medium text-sm px-4 py-2 rounded-full hover:bg-purple-deep transition-colors whitespace-nowrap">Get Started</Link>
                    </div>
                </div>
                {/* Row 2 — nav links centered */}
                <div className='border-t border-text/10 flex items-center justify-center gap-8 h-11 px-6'>
                    <Link href="/home" className='text-text font-medium text-sm hover:text-purple-light'>Home</Link>
                    <Link href="/films" className="text-text font-medium text-sm hover:text-purple-light">Films</Link>
                    <Link href="/community" className="text-text font-medium text-sm hover:text-purple-light">Community</Link>
                    <Link href="/lists" className="text-text font-medium text-sm hover:text-purple-light">Lists</Link>
                </div>
            </div>

        </nav>
    )
}
