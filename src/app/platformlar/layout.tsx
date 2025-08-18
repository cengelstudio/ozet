import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Platformlar',
  description: 'Türkiye ve dünyadan güvenilir haber platformları. En güncel haber kaynakları ve platformlar.',
}

export default function PlatformlarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
