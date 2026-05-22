import ConversationSection from "@/components/landing/ConversationSection";
import GenreSection from "@/components/landing/GenreSection";
import HeroSection from "@/components/landing/HeroSection";
import Sign from "@/components/landing/Sign";

export default function Home() {
    return (
        <main>
            <HeroSection />
            <GenreSection />
            <ConversationSection />
        </main>
    );
}
