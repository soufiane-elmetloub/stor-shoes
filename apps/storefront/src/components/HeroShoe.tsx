'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';

export default function HeroShoe({ imageSrc }: { imageSrc?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    transform: 'rotate(-15deg) scale(1)',
    filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4))',
  });
  const [glow, setGlow] = useState({ x: 50, y: 50, intensity: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const rotateX = -y * 25;
    const rotateY = x * 25;
    const translateX = x * 30;
    const translateY = y * 25;

    setStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px) rotate(-15deg) scale(1.15)`,
      filter: `drop-shadow(${-x * 20}px ${-y * 20 + 30}px 40px rgba(59,130,246,0.35))`,
    });
    setGlow({ x: (x + 1) * 50, y: (y + 1) * 50, intensity: 0.4 });
  }, []);

  const handleMouseEnter = () => setIsHovering(true);

  const handleMouseLeave = () => {
    setIsHovering(false);
    setStyle({
      transform: 'rotate(-15deg) scale(1)',
      filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4))',
    });
    setGlow({ x: 50, y: 50, intensity: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {/* Glow background */}
      <div className="hero-shoe-glow" style={{
        borderRadius: '50%',
        background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(59,130,246,${0.15 + glow.intensity}), rgba(139,92,246,${0.1 + glow.intensity * 0.5}) 40%, transparent 70%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.08s ease',
        position: 'relative',
      }}>
        <Image
          src={imageSrc || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&auto=format"}
          alt="StorShoes Hero"
          width={500}
          height={500}
          priority
          className="hero-shoe-img"
          style={{
            ...style,
            transition: isHovering ? 'transform 0.08s ease-out, filter 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.5s ease',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>

      {/* Floating particles */}
      <div className="particle" style={{ top: '15%', left: '12%', width: 8, height: 8, background: '#60a5fa', animationDelay: '0s' }} />
      <div className="particle" style={{ bottom: '20%', right: '15%', width: 6, height: 6, background: '#a78bfa', animationDelay: '1s' }} />
      <div className="particle" style={{ top: '55%', left: '8%', width: 10, height: 10, background: '#3b82f6', animationDelay: '0.5s' }} />
      <div className="particle" style={{ top: '10%', right: '25%', width: 5, height: 5, background: '#818cf8', animationDelay: '1.5s' }} />

      <style>{`
        .hero-shoe-glow {
          width: 380px;
          height: 380px;
        }
        .hero-shoe-img {
          width: 88%;
          height: auto;
          object-fit: contain;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .hero-shoe-glow {
            width: 130px !important;
            height: 130px !important;
            margin-top: 0;
          }
          .hero-shoe-img {
            width: 150px !important;
            max-width: 100vw !important;
            position: relative;
            z-index: 10;
            margin-bottom: 0 !important;
          }
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.5;
          animation: float-particle 4s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-18px) scale(1.3); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
