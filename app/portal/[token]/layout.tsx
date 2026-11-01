import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Academic Portal — Classio',
  description: 'Confidential student attendance, quiz scores, and tuition ledger for parents on Classio.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
