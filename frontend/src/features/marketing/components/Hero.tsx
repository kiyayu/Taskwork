//src/features/marketing/components/Hero.tsx
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'
import { useTranslation } from '@/lib/i18n'
import { DemoButton } from '@/features/auth'

export function Hero() {
  const { t } = useTranslation('marketing')
  return (
    <section className="py-12 space-y-6 text-center md:py-20">
      <h1 className="max-w-3xl mx-auto text-3xl font-semibold text-foreground md:text-5xl">{t('hero.title')}</h1>
      <p className="max-w-2xl mx-auto text-base text-muted-foreground">{t('hero.description')}</p>
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Button asChild size="lg">
          <Link to={paths.register}>{t('hero.primary')}</Link>
        </Button>
        <DemoButton size="lg" />
        <Button asChild size="lg" variant="ghost">
          <Link to={paths.login}>{t('hero.secondary')}</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t('hero.demoHint')}</p>
    </section>
  )
}