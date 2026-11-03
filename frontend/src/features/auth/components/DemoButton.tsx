//src/features/auth/components/DemoButton.tsx
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'
import { env } from '@/lib/env'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { useLogin } from '../hooks/useLogin'
import { getDemoCredentials } from '../utils/demo'

const credentials = getDemoCredentials(env)

export function DemoButton({ size }: { size?: 'default' | 'lg' }) {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const login = useLogin()

  if (!credentials) return null

  return (
    <Button
      size={size}
      variant="outline"
      disabled={login.isPending}
      onClick={() =>
        login.mutate(credentials, {
          onSuccess: () => navigate(paths.app.projects, { replace: true }),
          onError: (e) => toast.error(getErrorMessage(e)),
        })
      }
    >
      {login.isPending ? t('demo.signingIn') : t('demo.button')}
    </Button>
  )
}
