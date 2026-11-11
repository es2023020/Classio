import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Classio Root — Master Super-Admin Command Center',
  description: 'Military-grade secure single-person super admin control fortress for Classio.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {children}
    </div>
  )
}
