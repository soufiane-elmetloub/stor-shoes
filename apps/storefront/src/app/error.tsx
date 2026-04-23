'use client';

import ErrorFallback from '@/components/ErrorFallback';

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Oups ! Une erreur est survenue"
      description="Nous n&apos;avons pas pu charger cette page. Veuillez réessayer ou retourner à l&apos;accueil."
    />
  );
}
