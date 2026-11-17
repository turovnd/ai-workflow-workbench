import { Link } from 'react-router-dom';
import {
  Button,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui';
import { Path } from './paths';

export const RouteError = () => (
  <Empty className="min-h-svh">
    <EmptyHeader>
      <EmptyTitle>This page isn’t available</EmptyTitle>
      <EmptyDescription>
        Return to your inbox to continue reviewing requests.
      </EmptyDescription>
    </EmptyHeader>
    <Button asChild>
      <Link to={Path.Tickets}>Back to inbox</Link>
    </Button>
  </Empty>
);
