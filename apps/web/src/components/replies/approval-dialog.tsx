import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Draft } from '@support-desk/contracts';
import { Check, LoaderCircle } from 'lucide-react';
export const ApprovalDialog = ({
  draft,
  online,
  dirty,
  text,
  escalate,
  confirm,
  onOpenChange,
  onApprove,
  pending,
}: {
  draft: Draft;
  online: boolean;
  dirty: boolean;
  text: string;
  escalate: boolean;
  confirm: boolean;
  onOpenChange: (value: boolean) => void;
  onApprove: () => void;
  pending: boolean;
}) => (
  <Dialog open={confirm} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button disabled={dirty || !online || !text.trim()}>
        <Check data-icon="inline-start" />
        Review & approve
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Approve this reply?</DialogTitle>
        <DialogDescription>
          The exact saved version {draft.version} will be recorded
          {escalate ? ' with an internal escalation task' : ''}. This demo does
          not send email.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-56 overflow-auto rounded-md border p-3 text-sm leading-relaxed">
        {draft.text}
      </div>
      {draft.edited && <Badge variant="outline">Includes your edits</Badge>}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Keep reviewing
        </Button>
        <Button onClick={onApprove} disabled={pending || !online}>
          {pending && (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          )}
          Confirm approval
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
