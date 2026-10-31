import type { Metadata } from 'next'
import { PartnershipsView } from '@/components/landing/partnerships-view'

export const metadata: Metadata = {
  title: 'Partnerships & Investors | Classio Platform',
  description:
    'Partner with Classio — Egypt\'s premier tutor management & student success ecosystem. Investment opportunities, educational center partnerships, FinTech integrations, and publishing collaborations.',
  openGraph: {
    title: 'Partnerships & Investors | Classio Platform',
    description:
      'Join the Classio ecosystem — partnering with Egyptian tutors and educational centers across Egypt.',
    type: 'website',
  },
}

export default function PartnershipsPage() {
  return <PartnershipsView />
}
