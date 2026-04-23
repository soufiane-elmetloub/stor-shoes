'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const INTER = "'Inter', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export default function ErrorFallback({ 
  error, 
  reset, 
  title = "Oups ! Une erreur est survenue",
  description = "Nous n&apos;avons pas pu charger cette page. Veuillez réessayer ou retourner à l&apos;accueil."
}: ErrorFallbackProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div 
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          background: 'white',
          borderRadius: '1.5rem',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid #fecaca',
          boxShadow: '0 20px 60px rgba(220, 38, 38, 0.1)',
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem',
          }}
        >
          ⚠️
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: PLAYFAIR,
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#991b1b',
            margin: '0 0 1rem 0',
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          style={{
            fontFamily: INTER,
            fontSize: '1rem',
            color: '#7f1d1d',
            lineHeight: 1.6,
            margin: '0 0 1.5rem 0',
          }}
        >
          {description}
        </p>

        {/* Error Details (collapsible) */}
        <details
          style={{
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}
        >
          <summary
            style={{
              fontFamily: INTER,
              fontSize: '0.85rem',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 500,
              marginBottom: '0.5rem',
            }}
          >
            Détails techniques
          </summary>
          <pre
            style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              background: '#fef2f2',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              maxHeight: '150px',
              color: '#991b1b',
              margin: '0.5rem 0 0 0',
              textAlign: 'left',
            }}
          >
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </details>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={reset}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.875rem 2rem',
              borderRadius: '9999px',
              fontFamily: INTER,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b91c1c';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🔄 Réessayer
          </button>

          <Link
            href="/"
            style={{
              background: 'transparent',
              color: '#dc2626',
              border: '2px solid #dc2626',
              padding: '0.875rem 2rem',
              borderRadius: '9999px',
              fontFamily: INTER,
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>

        {/* Contact Support */}
        <p
          style={{
            fontFamily: INTER,
            fontSize: '0.8rem',
            color: '#9ca3af',
            marginTop: '1.5rem',
            marginBottom: '0',
          }}
        >
          Le problème persiste ?{' '}
          <a
            href="/contact"
            style={{
              color: '#dc2626',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
}
