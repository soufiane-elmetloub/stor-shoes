'use client';

import ErrorFallback from '@/components/ErrorFallback';

export default function ShopErrorBoundary({
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
      title="Problème de chargement"
      description="Une erreur s&apos;est produite lors du chargement de cette section. Vos articles dans le panier sont toujours sauvegardés."
    />
  );
}
