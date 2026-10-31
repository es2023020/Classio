import { StudentProfileView } from '@/components/views/student-profile-view'

export const metadata = {
  title: 'Student Profile — Classio',
  description: 'Dedicated student control center and academic success profile on Classio.',
}

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <StudentProfileView studentId={id} />
}
