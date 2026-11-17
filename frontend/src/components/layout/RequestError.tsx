import { Alert, AlertTitle, AlertDescription, Button } from '@/components/ui';

export const RequestError = ({
  title,
  error,
  retry,
}: {
  title: string;
  error: Error;
  retry: () => void;
}) => (
  <Alert variant="destructive">
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>
      {error.message}
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
    </AlertDescription>
  </Alert>
);
