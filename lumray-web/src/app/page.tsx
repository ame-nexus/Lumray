import ConversationSection from "@/components/landing/ConversationSection";
import GenreSection from "@/components/landing/GenreSection";
import HeroSection from "@/components/landing/HeroSection";
export default function Home() {
    return (
        <main>
            <HeroSection />
            <GenreSection />
            <ConversationSection />
        </main>
    );
}
