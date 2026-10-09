import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { client } from '@/lib/api/client';
import type { Draft } from '@support-desk/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, LoaderCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { ApprovalDialog } from './approval-dialog';
export const ReplyEditor = ({
  runId,
  ticketId,
  draft,
  online,
}: {
  runId: string;
  ticketId: string;
  draft: Draft;
  online: boolean;
}) => {
  const [text, setText] = useState(draft.text);
  const [escalate, setEscalate] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const queryClient = useQueryClient();
  const dirty = text !== draft.text;
  const save = useMutation({
    mutationFn: () => client.edit(runId, text, draft.version),
    onSuccess: (value) => queryClient.setQueryData(['draft', runId], value),
  });
  const approve = useMutation({
    mutationFn: () =>
      client.approve(
        runId,
        `reply:${runId}:${draft.version}:${escalate}`,
        draft.version,
        escalate,
      ),
    onSuccess: async () => {
      setConfirm(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['draft', runId] }),
        queryClient.invalidateQueries({ queryKey: ['history', ticketId] }),
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
      ]);
    },
  });
  const reload = useMutation({
    mutationFn: () => client.draft(runId),
    onSuccess: (value) => {
      queryClient.setQueryData(['draft', runId], value);
      setText(value.text);
      save.reset();
      approve.reset();
    },
  });
  const approved = draft.approved || approve.isSuccess;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={dirty || draft.edited ? 'outline' : 'secondary'}>
          {dirty
            ? 'Unsaved edits'
            : draft.edited
              ? 'Edited by you'
              : 'Generated draft'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Version {draft.version}
        </span>
        {(dirty || draft.edited) && (
          <span className="text-xs text-muted-foreground">
            Review your edits against the sources.
          </span>
        )}
      </div>
      {approved ? (
        <Alert>
          <CheckCheck />
          <AlertTitle>Reply approved and saved</AlertTitle>
          <AlertDescription>
            Recorded in this ticket’s history. No email was sent.
          </AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reply-text">Reply to the customer</FieldLabel>
          <Textarea
            id="reply-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={6000}
            className="min-h-60"
            readOnly={approved}
          />
          <FieldDescription>
            {approved
              ? 'Approved version preserved in ticket history.'
              : `${text.length}/6000 characters. Save edits before confirming the exact response.`}
          </FieldDescription>
        </Field>
      </FieldGroup>
      {(save.error || approve.error) && (
        <Alert variant="destructive">
          <AlertTitle>The reply was not saved</AlertTitle>
          <AlertDescription>
            {(save.error ?? approve.error)?.message}
            <Button
              variant="outline"
              size="sm"
              onClick={() => reload.mutate()}
              disabled={reload.isPending}
            >
              Reload saved draft
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {!approved && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => save.mutate()}
              disabled={!dirty || !text.trim() || !online || save.isPending}
            >
              {save.isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <Save data-icon="inline-start" />
              )}
              Save edits
            </Button>
            <ToggleGroup
              type="single"
              value={escalate ? 'escalate' : 'reply'}
              onValueChange={(value) => {
                if (value) setEscalate(value === 'escalate');
              }}
              variant="outline"
              aria-label="Approval outcome"
            >
              <ToggleGroupItem value="reply">Save reply</ToggleGroupItem>
              <ToggleGroupItem value="escalate">
                Reply + escalation
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <ApprovalDialog
            draft={draft}
            online={online}
            dirty={dirty}
            text={text}
            escalate={escalate}
            confirm={confirm}
            onOpenChange={setConfirm}
            onApprove={() => approve.mutate()}
            pending={approve.isPending}
          />
        </>
      )}
    </div>
  );
};
