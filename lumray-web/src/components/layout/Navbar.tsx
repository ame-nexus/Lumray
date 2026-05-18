import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
    return (
        <nav className='sticky top-0 z-50 bg-bg-dark h-[84px] flex items-center justify-between px-6 mb-6 lg:px-[92px]'>

            {/* Left - Logo */}
            <Link href="/" className="flex items-center gap-2">
                <Image src="/images/lumray-icon.svg" alt="Lumray" width={42} height={42} />
                <span className="font-outfit text-2xl font-bold text-white">lumray</span>
            </Link>

            {/* Right - Links + Auth */}
            <div className='flex items-center gap-10'>
                <Link href="/home" className='text-text font-medium text-lg hover:text-purple-light'>Home</Link>
                <Link href="/films" className="text-text font-medium text-lg hover:text-purple-light">Films</Link>
                <Link href="/community" className="text-text font-medium text-lg hover:text-purple-light">Community</Link>
                <Link href="/lists" className="text-text font-medium text-lg hover:text-purple-light">Lists</Link>
                <Link href="/login" className="text-text font-medium text-lg hover:text-purple-light">Log In</Link>
                <Link href="/signup" className="bg-purple text-white font-medium text-base px-4.5 py-2.5 rounded-full hover:bg-purple-deep transition-colors">Get Started</Link>
            </div>

        </nav>
    )
}