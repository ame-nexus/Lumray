import SignPage from '@/components/auth/Sign'

// Renders the shared SignPage with the signup tab active by default.
// URL: /signup
export default function SignupPage() {
    return <SignPage defaultTab="signup" />
}
