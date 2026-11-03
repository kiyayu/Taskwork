//src/features/members/pages/AcceptInvitePage.tsx
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { paths } from '@/config/paths'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { useAcceptInvite } from '../hooks/useMembers'
import { isInviteToken } from '../utils/inviteLink'

export default function AcceptInvitePage() {
  const { t } = useTranslation('members')
  const navigate = useNavigate()
  const { token } = useParams()
  const accept = useAcceptInvite()

  // a malformed token never reaches the server
  if (!isInviteToken(token)) {
    return (
      <PageContainer width="narrow">
        <PageHeader title={t('accept.title')} />
        <p className="text-sm text-destructive">{t('accept.invalidLink')}</p>
        <Button asChild variant="outline"><Link to={paths.app.projects}>{t('accept.back')}</Link></Button>
      </PageContainer>
    )
  }

  return (
    <PageContainer width="narrow">
      <PageHeader title={t('accept.title')} description={t('accept.description')} />

      {accept.error != null && (
        <p role="alert" className="px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
          {getErrorMessage(accept.error)}
        </p>
      )}

      {/* joining is an explicit click: link previews and StrictMode must not use up the invite */}
      <div className="flex flex-wrap gap-2">
        <Button disabled={accept.isPending}
          onClick={() =>
            accept.mutate(token, {
              onSuccess: ({ projectId }) => {
                toast.success(t('accept.joined'))
                navigate(paths.app.projectBoard(projectId), { replace: true })
              },
            })
          }>
          {accept.isPending ? t('accept.joining') : t('accept.join')}
        </Button>
        <Button asChild variant="outline"><Link to={paths.app.projects}>{t('accept.back')}</Link></Button>
      </div>
    </PageContainer>
  )
}