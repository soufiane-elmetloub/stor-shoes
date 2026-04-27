'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import { getImageUrl } from '@/lib/api';

const INTER = "'Inter', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ padding: '5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: INTER }}>
        <Image src="/icons/shopping-cart.png" alt="cart" width={64} height={64} style={{ opacity: 0.25, marginBottom: '1.5rem' }} unoptimized />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#000', marginBottom: '0.6rem', fontFamily: PLAYFAIR }}>
          Votre panier est vide
        </h1>
        <p style={{ color: '#555555', marginBottom: '2rem', fontSize: '0.9rem', fontFamily: INTER }}>
          Parcourez nos produits et ajoutez ce qui vous plaît
        </p>
        <Link href="/products"
          style={{ display: 'inline-block', background: '#000', color: '#fff', padding: '0.65rem 2rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Voir les produits →
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container" style={{ fontFamily: INTER }}>
      <style>{`
        .cart-container {
          padding: 2rem 1.5rem;
          padding-bottom: 6rem;
        }
        .cart-header-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 0 1rem 0;
          border-bottom: 1px solid #e5e7eb;
          width: 100%;
          gap: 1.5rem;
        }
        .cart-item-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 1.5rem 0;
          border-bottom: 1px solid #f0f0f0;
          width: 100%;
          gap: 1.5rem;
        }
        .cart-total-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-top: 2.5rem;
          gap: 1.2rem;
        }
        .cart-total-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .checkout-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #000;
          color: #fff;
          padding: 1rem 2.5rem;
          border-radius: 99px;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: ${INTER};
          letter-spacing: 0.02em;
          transition: background 0.2s;
          margin-top: 0.5rem;
        }
        .cart-item-price-col {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
          min-width: 0;
        }
        .desktop-qty {
          display: flex;
        }
        .mobile-qty {
          display: none;
          margin-top: 0.6rem;
        }
        @media (max-width: 768px) {
          .desktop-qty {
            display: none !important;
          }
          .mobile-qty {
            display: flex !important;
          }
          .cart-header-grid {
            display: none;
          }
          .cart-item-grid {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
            position: relative;
          }
          .cart-item-qty {
            align-self: flex-start;
          }
          .cart-item-price-col {
            position: absolute;
            bottom: 1.5rem;
            right: 0;
          }
          .cart-total-container {
            align-items: stretch;
          }
          .cart-total-row {
            justify-content: space-between;
          }
          .checkout-btn {
            padding: 0.8rem 1.2rem;
            font-size: 0.8rem;
            justify-content: center;
            width: 100%;
          }
          .cart-total-row {
            gap: 0.75rem !important;
            flex-wrap: nowrap !important;
          }
          .cart-total-label {
            font-size: 0.85rem !important;
            white-space: nowrap !important;
          }
          .cart-total-price {
            font-size: 1.25rem !important;
            white-space: nowrap !important;
          }
        }
        @media (max-width: 380px) {
          .cart-total-label {
            font-size: 0.75rem !important;
          }
          .cart-total-price {
            font-size: 1.1rem !important;
          }
          .cart-total-row {
            gap: 0.5rem !important;
          }
        }
      `}</style>

      {/* ── Title & Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Image src="/icons/shopping-cart.png" alt="" width={24} height={24} unoptimized />
          <h1 style={{ fontFamily: PLAYFAIR, fontSize: '1.6rem', fontWeight: 700, color: '#000', margin: 0 }}>
            Panier <span style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 400, color: '#888' }}>({totalItems})</span>
          </h1>
        </div>
        <Link href="/products"
          style={{ fontSize: '0.78rem', color: '#888', fontFamily: INTER, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, transition: 'color 0.2s' }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#000'; }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#888'; }}>
          ← Continuer les achats
        </Link>
      </div>

      {/* ── Table Headers ── */}
      <div className="cart-header-grid">
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: INTER }}>Produit</span>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: INTER }}>Quantité</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 0 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: INTER }}>Total</span>
        </div>
      </div>

      {/* ── Items List ── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item) => (
          <div key={item.variantId} className="cart-item-grid">

            {/* ── LEFT: Image + Name + Size ── */}
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', minWidth: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: '0.5rem', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                <img src={getImageUrl(item.image)} alt={item.name} width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: '0.95rem', color: '#000', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </h2>
                {item.size && (
                  <p style={{ fontSize: '0.72rem', color: '#888', margin: '0.3rem 0 0', fontFamily: INTER }}>
                    Pointure: <strong style={{ color: '#000', fontWeight: 600 }}>{item.size}</strong>
                    {item.color && <span> · {item.color}</span>}
                  </p>
                )}
                <div className="mobile-qty" style={{ alignItems: 'center', border: '1px solid #000', borderRadius: '0.4rem', overflow: 'hidden', width: 'fit-content' }}>
                  <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    style={{ width: 28, height: 26, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#000', fontFamily: INTER, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>−</button>
                  <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#000', fontFamily: INTER, borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', lineHeight: '26px' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    style={{ width: 28, height: 26, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#000', fontFamily: INTER, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>+</button>
                </div>
              </div>
            </div>

            {/* ── CENTER: Quantité stepper ── */}
            <div className="cart-item-qty desktop-qty" style={{ flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #000', borderRadius: '0.4rem', overflow: 'hidden' }}>
                <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  style={{ width: 30, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#000', fontFamily: INTER, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>−</button>
                <span style={{ width: 30, textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#000', fontFamily: INTER, borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', lineHeight: '28px' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  style={{ width: 30, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#000', fontFamily: INTER, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>+</button>
              </div>
            </div>

            {/* ── RIGHT: Price + Delete ── */}
            <div className="cart-item-price-col">
              <span style={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                color: '#000', 
                fontFamily: INTER, 
                whiteSpace: 'nowrap',
              }}>
                {(item.price * item.quantity).toLocaleString('en-US')} MAD
              </span>
              <button onClick={() => removeItem(item.variantId)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', lineHeight: 1, opacity: 0.4, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; }}
                title="Supprimer">
                <img src="/icons/recycle-bin.png" alt="Supprimer" width={18} height={18} style={{ width: 18, height: 18 }} />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* ── Cart Total & Checkout Action ── */}
      <div className="cart-total-container">
        <div className="cart-total-row">
          <span className="cart-total-label" style={{ fontSize: '1.2rem', color: '#000', fontWeight: 600, fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>TOTAL ESTIMÉ</span>
          <span className="cart-total-price" style={{ fontFamily: INTER, fontSize: '2rem', fontWeight: 700, color: '#000', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            {totalPrice.toLocaleString('en-US')} MAD
          </span>
        </div>
        <Link href="/commande"
          className="checkout-btn"
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#333'; }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#000'; }}
        >
          <Image src="/icons/shopping-cart.png" alt="" width={18} height={18} style={{ filter: 'brightness(0) invert(1)' }} unoptimized />
          Achetez avec paiement à la livraison
        </Link>
      </div>

    </div>
  );
}
