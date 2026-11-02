//src/features/board/attachments/components/Attachments.tsx
import { FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FileDropzone } from '@/components/ui/file-dropzone'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/errors'
import { formatBytes } from '@/lib/files'
import { useTranslation } from '@/lib/i18n'
import { useUpload } from '@/features/uploads'
import { useAttach, useAttachments, useRemoveAttachment } from '../hooks/useAttachments'

// Mirrors the backend rule for the "attachment" purpose. The server enforces the real limits.
const ATTACHMENT_RULE = {
  types: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
  maxBytes: 10 * 1024 * 1024,
}

type Props = { projectId: string; taskId: string; canEdit: boolean; isOwner: boolean; currentUserId: string }

export function Attachments({ projectId, taskId, canEdit, isOwner, currentUserId }: Props) {
  const { t } = useTranslation('board')
  const query = useAttachments(projectId, taskId)
  const upload = useUpload('attachment')
  const attach = useAttach(projectId, taskId)
  const remove = useRemoveAttachment(projectId, taskId)
  const busy = upload.isPending || attach.isPending

  if (query.isPending) return <Skeleton className="w-full h-16" />
  if (query.isError && !query.data) return <p className="text-sm text-destructive">{t('attachments.loadFailed')}</p>

  const files = query.data ?? []

  // sign -> upload straight to storage -> tell our API the key (never a URL)
  const onFile = (file: File) =>
    upload.mutate(file, {
      onSuccess: (fileKey) =>
        attach.mutate({ fileKey, name: file.name }, {
          onSuccess: () => toast.success(t('attachments.attached')),
          onError: (e) => toast.error(getErrorMessage(e)),
        }),
      onError: (e) => toast.error(getErrorMessage(e, t('attachments.uploadFailed'))),
    })

  return (
    <div className="space-y-4">
      {files.length === 0 && <p className="text-sm text-muted-foreground">{t('attachments.empty')}</p>}

      <ul className="space-y-2">
        {files.map((f) => {
          const canDelete = f.uploaderId === currentUserId || isOwner
          const safe = f.url.startsWith('https://') // never render a javascript: or data: URL as a link
          return (
            <li key={f.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="flex-1 min-w-0">
                {safe ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm font-medium text-primary truncate hover:underline">{f.name}</a>
                ) : (
                  <span className="block text-sm font-medium text-foreground truncate">{f.name}</span>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatBytes(f.bytes)} · {t('attachments.by', { name: f.uploaderName })}
                </p>
              </div>
              {canDelete && (
                <Button variant="ghost" size="icon" className="size-8" aria-label={t('attachments.delete')} icon={<Trash2 />}
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate(f.id, {
                      onSuccess: () => toast.success(t('attachments.deleted')),
                      onError: (e) => toast.error(getErrorMessage(e)),
                    })
                  } />
              )}
            </li>
          )
        })}
      </ul>

      {canEdit && (
        <div className="space-y-2">
          <FileDropzone rule={ATTACHMENT_RULE} onFile={onFile} disabled={busy}
            label={busy ? t('attachments.uploading') : t('attachments.drop')} />
          {upload.isPending && (
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar"
              aria-valuenow={upload.progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full transition-all bg-primary" style={{ width: `${upload.progress}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}