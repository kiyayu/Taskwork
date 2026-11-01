//src/features/projects/components/ProjectCard.tsx
import { Link } from 'react-router-dom'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import type { Project } from '../types/project.types'
import { paths } from '@/config/paths'

type Props = {
  project: Project
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, onRename, onDelete }: Props) {
  const { t } = useTranslation('projects')
  const isOwner = project.role === 'owner'

  return (
    <li className="relative p-4 space-y-3 bg-card border border-border rounded-xl shadow-sm transition-colors hover:bg-muted/40">
      {/* the whole card is a link to the board; the menu sits above it */}
      <Link to={`${paths.app.projectBoard(project.id)}`} className="block space-y-3 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        <h2 className="text-base font-semibold text-foreground truncate">{project.name}</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 text-primary bg-primary/10 rounded-lg">{t(`role.${project.role}`)}</span>
          <span>{t('createdOn', { date: formatDateTime(project.createdAt) })}</span>
        </div>
      </Link>

      {isOwner && (
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="size-8" aria-label={t('actions.menu')} icon={<MoreVertical />} />}
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onRename(project)}>
                <Pencil />
                <span>{t('actions.rename')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(project)}>
                <Trash2 />
                <span>{t('actions.delete')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </li>
  )
}