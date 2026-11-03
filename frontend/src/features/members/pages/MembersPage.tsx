//src/features/members/pages/MembersPage.tsx
import { Navigate, useParams } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { paths } from '@/config/paths'
import { MembersPanel } from '../components/MembersPanel'

export default function MembersPage() {
  const { projectId } = useParams()
  if (!projectId) return <Navigate to={paths.app.projects} replace />

  return (
    <PageContainer width="narrow">
      <MembersPanel projectId={projectId} />
    </PageContainer>
  )
}