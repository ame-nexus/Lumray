import DiaryTabContent from '@/components/profile/DiaryTabContent'
import { DUMMY_DIARY_ENTRIES, DUMMY_DIARY_STATS } from '@/lib/profileDummy'

export default function ProfileDiaryPage() {
  return <DiaryTabContent entries={DUMMY_DIARY_ENTRIES} stats={DUMMY_DIARY_STATS} />
}
