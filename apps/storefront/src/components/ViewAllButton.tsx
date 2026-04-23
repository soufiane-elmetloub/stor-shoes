'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ViewAllButton({ href }: { href: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        border: '1.5px solid #000000',
        padding: '0.45rem 1.4rem',
        borderRadius: '9999px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: hovered ? '#ffffff' : '#000000',
        background: hovered ? '#000000' : 'transparent',
        textDecoration: 'none',
        letterSpacing: '0.03em',
        transition: 'background 0.25s ease, color 0.25s ease',
      }}
    >
      View All →
    </Link>
  );
}
