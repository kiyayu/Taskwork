//src/features/board/pages/BoardPage.tsx
import { Navigate, useParams } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { paths } from '@/config/paths'
import { Board } from '../components/Board'

export default function BoardPage() {
  const { projectId } = useParams()
  if (!projectId) return <Navigate to={paths.app.projects} replace />

  return (
    <PageContainer width="wide">
      <Board projectId={projectId} />
    </PageContainer>
  )
}