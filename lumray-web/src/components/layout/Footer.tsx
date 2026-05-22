import Image from "next/image"
import Link from "next/link"
import { FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6"


const discover = ['Films', 'By genre', 'By era', 'Top rated', 'New releases']
const community = ['Posts', 'Chat rooms', 'Lists', 'Members', 'Activity']
const account = ['Sign up', 'Log in', 'Profile', 'Diary', 'Settings']

export default function Footer() {
    return (
        <footer className="bg-[#12101f] px-6 md:px-60 pt-12 pb-8">

            {/* top row */}
            <div className="flex flex-col md:flex-row gap-10 md:gap-56 mb-8">

                {/* brand */}
                <div className="flex flex-col gap-5 max-w-full md:max-w-[260px]">
                    <div className="flex items-center gap-3">
                        <Image src="/images/lumray-icon.svg" alt="Lumray" width={65} height={36} />
                        <span className="font-outfit font-semibold text-white text-5xl">lumray</span>
                    </div>
                    <p className="text-[#B3B3B3] text-lg leading-relaxed">
                        Your cinematic universe. Log, rate, and discover films with people who care as much as you do.
                    </p>
                    <div className="flex items-center gap-3">
                        {[FaInstagram, FaXTwitter, FaYoutube].map((Icon, i) => (
                            <button key={i} className="w-10 h-10 rounded-full border border-[#534AB7]/80 flex items-center justify-center text-[#AFA9EC] hover:text-white hover:border-[#ede9fc]/50 transition-colors">
                                <Icon size={20} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* links */}
                <div className="grid grid-cols-3 md:flex md:flex-1 md:justify-between gap-8 md:gap-0">
                    {[{ title: 'Discover', links: discover }, { title: 'Community', links: community }, { title: 'Account', links: account }].map((col) => (
                        <div key={col.title} className="flex flex-col gap-3 md:gap-4">
                            <p className="font-outfit font-bold text-white text-base md:text-xl">{col.title}</p>
                            {col.links.map((link) => (
                                <Link key={link} href="/" className="text-[#B3B3B3] text-sm md:text-lg hover:text-white transition-colors">
                                    {link}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

            </div>

            {/* divider */}
            <div className="border-t border-[#ede9fc]/10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                <p className="text-[#7a7882] text-sm">© 2025 Lumray. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    {['Privacy', 'Terms', 'Contact'].map((item) => (
                        <Link key={item} href="/" className="text-[#7a7882] text-sm hover:text-white transition-colors">
                            {item}
                        </Link>
                    ))}
                </div>
            </div>

        </footer>
    )
}
