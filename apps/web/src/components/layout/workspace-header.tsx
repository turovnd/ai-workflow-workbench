import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import type { Session } from '@support-desk/contracts';
import { BookOpen, LifeBuoy, LogOut, PanelLeft } from 'lucide-react';
export const WorkspaceHeader = ({
  session,
  onToggle,
  mode,
  onLogout,
  loggingOut,
}: {
  session: Session;
  showInbox: boolean;
  onToggle: () => void;
  mode?: string;
  onLogout: () => void;
  loggingOut: boolean;
}) => (
  <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
    <div className="flex items-center gap-3">
      <Button
        className="md:hidden"
        variant="ghost"
        size="icon"
        aria-label="Toggle inbox"
        onClick={onToggle}
      >
        <PanelLeft />
      </Button>
      <LifeBuoy className="size-5 text-primary" />
      <span className="font-semibold">Support Desk</span>
      <Badge variant="secondary">
        {session.demo ? 'Isolated demo' : 'Personal workspace'}
      </Badge>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-muted-foreground">
        {mode === 'openrouter' ? 'AI-assisted replies' : 'Keyless demo replies'}
      </span>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <BookOpen data-icon="inline-start" />
            How it works
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              From a customer question to a reviewed reply
            </DialogTitle>
            <DialogDescription>
              Every customer and help article in this workspace is synthetic.
            </DialogDescription>
          </DialogHeader>
          <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm">
            <li>
              Select a ticket and prepare a reply from current help articles.
            </li>
            <li>
              Inspect the quoted sources, edit the response and save your edits.
            </li>
            <li>
              Confirm the exact reply, optionally with an internal escalation.
            </li>
          </ol>
          <Alert>
            <AlertTitle>You make the final decision</AlertTitle>
            <AlertDescription>
              Replies are saved in this workspace. No email is sent.{' '}
              {session.demo
                ? 'Demo data expires after 24 hours.'
                : 'Your account retains its workspace between sessions.'}
            </AlertDescription>
          </Alert>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        disabled={loggingOut}
      >
        <LogOut data-icon="inline-start" />
        Sign out
      </Button>
    </div>
  </header>
);
