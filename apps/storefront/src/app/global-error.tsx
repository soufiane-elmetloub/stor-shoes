'use client';

import ErrorFallback from '@/components/ErrorFallback';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorFallback
          error={error}
          reset={reset}
          title="Erreur critique"
          description="Une erreur sérieuse s&apos;est produite. Nous nous excusons pour ce désagrément."
        />
      </body>
    </html>
  );
}
