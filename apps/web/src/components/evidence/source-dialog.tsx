import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Citation } from '@support-desk/contracts';
import { useRef } from 'react';
export const SourceDialog = ({
  source,
  onClose,
}: {
  source: Citation | null;
  onClose: () => void;
}) => {
  const trigger = useRef<HTMLElement | null>(null);
  return (
    <Dialog
      open={!!source}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-xl"
        onOpenAutoFocus={() => {
          trigger.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{source?.title}</DialogTitle>
          <DialogDescription>
            Revision {source?.revision} · {source?.section}
          </DialogDescription>
        </DialogHeader>
        <Badge variant="secondary">Current synthetic article</Badge>
        <blockquote className="border-l-2 pl-4 text-sm leading-relaxed">
          {source?.quote}
        </blockquote>
        <Separator />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {source?.text}
        </p>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
};
