import { Skeleton } from '@/components/ui';

export const PageLoading = ({ label }: { label: string }) => (
  <main
    className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8"
    aria-label={label}
    aria-busy="true"
  >
    <span className="sr-only">{label}</span>
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-40 w-full" />
  </main>
);
