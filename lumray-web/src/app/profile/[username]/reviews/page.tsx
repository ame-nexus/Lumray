import ProfileTwoColumn from '@/components/profile/ProfileTwoColumn'

export default function ProfileReviewsPage() {
  return (
    <ProfileTwoColumn
      main={
        <div className="rounded-xl border border-text/10 bg-surface p-8 text-center">
          <h2 className="font-outfit text-lg font-semibold text-text">Reviews</h2>
          <p className="mt-2 font-roboto text-sm text-text-muted">
            Full reviews list coming soon.
          </p>
        </div>
      }
    />
  )
}
