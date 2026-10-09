import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
export const LoadMore = ({
  hasMore,
  pending,
  onLoad,
  disabled = false,
}: {
  hasMore: boolean;
  pending: boolean;
  onLoad: () => void;
  disabled?: boolean;
}) => {
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasMore || pending || disabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoad();
      },
      { rootMargin: '80px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, pending, onLoad, disabled]);
  if (!hasMore) return null;
  return (
    <div ref={sentinel} className="flex justify-center p-3">
      <Button variant="outline" onClick={onLoad} disabled={pending || disabled}>
        {pending && (
          <LoaderCircle data-icon="inline-start" className="animate-spin" />
        )}
        {pending ? 'Loading more…' : 'Load more'}
      </Button>
    </div>
  );
};
