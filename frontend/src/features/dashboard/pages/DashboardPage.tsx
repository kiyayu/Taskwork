//src/features/dashboard/pages/DashboardPage.tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { Overview } from '../components/Overview'

export default function DashboardPage() {
  return (
    <PageContainer width="wide">
      <Overview />
    </PageContainer>
  )
}