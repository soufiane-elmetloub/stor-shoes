'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { getImageUrl } from '@/lib/api';

export default function Header() {
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (!searchOpen) {
      setSuggestions([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5&isActive=true`)
        .then(res => res.json())
        .then(data => {
            if (data?.data) {
                setSuggestions(data.data);
            }
        })
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <style>{`
        .nav-link {
          font-size: 0.9rem; font-weight: 500; color: #ffffff;
          text-decoration: none; position: relative; padding-bottom: 3px;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0%; height: 2px; background: #ffffff;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }
        .icon-btn {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; padding: 4px;
          opacity: 0.85; transition: opacity 0.2s;
        }
        .icon-btn:hover { opacity: 1; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .search-capsule-form {
          animation: fadeSlideIn 0.2s ease forwards;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 9999px;
          padding: 0.4rem 1rem;
          width: 100%;
          max-width: 480px;
        }
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .desktop-nav {
          display: flex;
        }
        .mobile-menu-btn {
          display: none;
        }
        .mobile-drawer {
          position: fixed;
          top: 64px;
          left: 0;
          bottom: 0;
          width: 280px;
          background: #111111;
          z-index: 40;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .mobile-drawer.open {
          transform: translateX(0);
        }
        .mobile-overlay {
          position: fixed;
          inset: 0;
          top: 64px;
          background: rgba(0,0,0,0.5);
          z-index: 30;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            opacity: 0.85;
            transition: opacity 0.2s;
          }
          .mobile-menu-btn:hover { opacity: 1; }
        }
      `}</style>

      <div className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <Link href="/" className="nav-link" style={{ fontSize: '1.2rem' }} onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link href="/products" className="nav-link" style={{ fontSize: '1.2rem' }} onClick={() => setMobileMenuOpen(false)}>Products</Link>
        <Link href="/contact" className="nav-link" style={{ fontSize: '1.2rem' }} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
      </div>

      <header role="banner" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#000000',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center',
          height: 64, position: 'relative',
        }}>

          {/* Mobile Menu Button - Left */}
          <div style={{ 
            flex: 1, display: 'flex', alignItems: 'center',
            opacity: searchOpen ? 0 : 1, visibility: searchOpen ? 'hidden' : 'visible',
            transition: 'opacity 0.2s, visibility 0.2s', pointerEvents: searchOpen ? 'none' : 'auto' 
          }}>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
              <Image src="/icons/menu.png" alt="Menu" width={24} height={24} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </button>

            {/* Desktop Nav - Left */}
            <nav className="desktop-nav" aria-label="Main navigation" style={{
              alignItems: 'center', gap: '2rem',
              visibility: searchOpen ? 'hidden' : 'visible',
              opacity: searchOpen ? 0 : 1,
              transition: 'opacity 0.15s',
              pointerEvents: searchOpen ? 'none' : 'auto',
            }}>
              <Link href="/" className="nav-link" aria-current="page">Home</Link>
              <Link href="/products" className="nav-link">Products</Link>
              <Link href="/contact" className="nav-link">Contact</Link>
            </nav>
          </div>

          {/* Logo - Centered (always absolute center) */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center',
            visibility: searchOpen ? 'hidden' : 'visible',
            opacity: searchOpen ? 0 : 1,
            transition: 'opacity 0.15s',
            zIndex: 10 /* lower than right icons so it doesn't block clicks */
          }}>
            <Link href="/" aria-label="StorShoes Home" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logoe2.jpeg" alt="StorShoes" width={90} height={45} style={{ objectFit: 'contain' }} priority />
            </Link>
          </div>

          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            pointerEvents: searchOpen ? 'auto' : 'none',
            display: 'flex', flexDirection: 'column', zIndex: 100, 
            width: 'calc(100vw - 2rem)', maxWidth: '480px'
          }}>
            {searchOpen && (
              <div style={{ position: 'relative', width: '100%' }}>
                <form className="search-capsule-form" onSubmit={handleSearch} role="search" aria-label="Site search" style={{ width: '100%' }}>
                  <Image src="/icons/loupe.png" alt="" width={26} height={26} aria-hidden="true" style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.5, flexShrink: 0 }} />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search shoes, brands..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Search products"
                    aria-describedby="search-help"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: '#fff', fontSize: '0.9rem', caretColor: '#fff', minWidth: 0,
                    }}
                  />
                  <span id="search-help" className="visually-hidden">Press Enter to search</span>
                  <button type="button" className="icon-btn" style={{ padding: 2 }}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    aria-label="Close search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </form>

                {searchQuery.trim().length >= 2 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
                    background: '#fff', borderRadius: '1rem', padding: '0.5rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem',
                    maxHeight: '400px', overflowY: 'auto',
                    animation: 'fadeSlideIn 0.2s ease'
                  }}>
                    {isSearching ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>جارِ البحث...</div>
                    ) : suggestions.length > 0 ? (
                      <>
                        {suggestions.map(p => (
                          <Link href={`/products/${p.slug}`} key={p.id} onClick={() => {setSearchOpen(false); setSearchQuery('')}}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', textDecoration: 'none', color: '#000', borderRadius: '0.5rem', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                            {p.images?.[0]?.url ? (
                              <img src={getImageUrl(p.images[0].url)} alt="" width={44} height={44} style={{ width: 44, height: 44, borderRadius: '0.35rem', objectFit: 'cover', background: '#f1f5f9' }} />
                            ) : (
                              <div style={{ width: 44, height: 44, borderRadius: '0.35rem', background: '#f1f5f9' }} aria-hidden="true" />
                            )}
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{Number(p.salePrice || p.price).toLocaleString('en-US')} MAD</div>
                            </div>
                          </Link>
                        ))}
                        <button onClick={handleSearch} style={{ width: '100%', border: 'none', background: '#f8fafc', padding: '0.75rem', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', borderRadius: '0.5rem', marginTop: '0.25rem' }}>
                          عرض كل النتائج
                        </button>
                      </>
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>لا توجد نتائج مطابقة</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons - Right */}
          <div role="region" aria-label="User actions" style={{ 
            flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
            opacity: searchOpen ? 0 : 1, visibility: searchOpen ? 'hidden' : 'visible',
            transition: 'opacity 0.2s, visibility 0.2s', pointerEvents: searchOpen ? 'none' : 'auto',
            position: 'relative', zIndex: 20
          }} className="gap-3 md:gap-5">
            {/* Search button - hide when search is open */}
            {!searchOpen && (
              <button className="icon-btn" onClick={() => setSearchOpen(prev => !prev)} aria-label="Open search" aria-expanded={searchOpen ? 'true' : 'false'}>
                <Image src="/icons/loupe.png" alt="" width={24} height={24} aria-hidden="true" style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </button>
            )}
            {/* Wishlist */}
            <Link href="/wishlist" aria-label={`Wishlist (${wishlistItems} items)`} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistItems > 0 && (
                <span aria-live="polite" aria-atomic="true" style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#ec4899', color: 'white', width: 18, height: 18,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700,
                }}>{wishlistItems}</span>
              )}
            </Link>
            {/* Cart */}
            <Link href="/cart" aria-label={`Shopping cart (${totalItems} items)`} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Image src="/icons/shopping-bag.png" alt="" width={24} height={24} aria-hidden="true" style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              {totalItems > 0 && (
                <span aria-live="polite" aria-atomic="true" style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#ef4444', color: 'white', width: 18, height: 18,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700,
                }}>{totalItems}</span>
              )}
            </Link>
          </div>

        </div>
      </header>
    </>
  );
}
