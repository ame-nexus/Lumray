import ProfileFilmsContent from '@/components/profile/ProfileFilmsContent'
import { DUMMY_PROFILE_FILMS } from '@/lib/profileDummy'

export default function ProfileFilmsPage() {
  return <ProfileFilmsContent films={DUMMY_PROFILE_FILMS} totalCount={1356} />
}
