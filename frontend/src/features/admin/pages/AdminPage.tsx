//src/features/admin/pages/AdminPage.tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { useTranslation } from '@/lib/i18n'
import { StatsGrid } from '../components/StatsGrid'
import { UsersTable } from '../components/UsersTable'

export default function AdminPage() {
  const { t } = useTranslation('admin')
  return (
    <PageContainer width="wide">
      <PageHeader title={t('title')} description={t('description')} />
      <StatsGrid />
      <UsersTable />
    </PageContainer>
  )
}
