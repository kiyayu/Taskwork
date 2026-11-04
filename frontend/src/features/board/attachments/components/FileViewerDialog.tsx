//src/features/board/attachments/components/FileViewerDialog.tsx
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n'
import type { Attachment } from '../types'
import { fileKind, isSafeUrl } from '../utils/fileKind'

type Props = { file: Attachment | null; onClose: () => void }

export function FileViewerDialog({ file, onClose }: Props) {
  const { t } = useTranslation('board')
  const kind = file ? fileKind(file.url, file.name) : 'other'
  const show = !!file && isSafeUrl(file.url) && kind !== 'other'

  return (
    <Dialog open={show} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[95vw] max-w-5xl sm:max-w-5xl max-h-[92vh] p-4 overflow-y-auto">
        {file && show && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
              <DialogTitle className="text-sm font-semibold text-foreground break-all">{file.name}</DialogTitle>
              <Button asChild variant="outline" size="sm">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />{t('viewer.newTab')}
                </a>
              </Button>
            </div>

            {kind === 'image' ? (
              <img src={file.url} alt={file.name} className="mx-auto max-h-[75vh] max-w-full object-contain" />
            ) : (
              <>
                <iframe src={file.url} title={file.name} className="w-full h-[75vh] border border-border rounded-lg bg-card" />
                <p className="text-xs text-muted-foreground">{t('viewer.blankHint')}</p>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}