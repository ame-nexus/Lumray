import { Suspense } from 'react'
import VerifyEmail from '@/components/auth/VerifyEmail'

// Suspense is required because VerifyEmail uses useSearchParams()
export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmail />
        </Suspense>
    )
}
