import SignPage from '@/components/auth/Sign'

// Renders the shared SignPage with the login tab active by default.
// URL: /login
export default function LoginPage() {
    return <SignPage defaultTab="login" />
}
