import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { TicketController } from '@/hooks/use-ticket-workspace';
import { ArrowUpRight, BookOpen } from 'lucide-react';
export const EvidencePanel = ({ state }: { state: TicketController }) => {
  const { setSource, run } = state;
  return (
    <>
      <aside className="flex flex-col gap-4" aria-label="Source evidence">
        <h2 className="flex items-center gap-2 font-semibold">
          <BookOpen className="size-4" />
          Help articles
        </h2>
        {run?.brief?.citations.length ? (
          run.brief.citations.map((citation, index) => (
            <Card key={citation.id}>
              <CardHeader>
                <CardTitle>{citation.title}</CardTitle>
                <CardDescription>
                  Revision {citation.revision} · {citation.section}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  “{citation.quote}”
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Open citation ${index + 1}`}
                  onClick={() => setSource(citation)}
                >
                  View source {index + 1}
                  <ArrowUpRight data-icon="inline-end" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {run?.status === 'ready'
              ? 'No supporting article was found. A reviewer must request the missing policy.'
              : 'The articles used in your reply will appear here with their current revisions.'}
          </p>
        )}
        <Separator />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Source quotes are checked against the retrieved articles. You are
          responsible for reviewing the final reply, including your edits.
        </p>
      </aside>
    </>
  );
};
