'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart, CartItem } from '@/lib/cart';
import { trackConversion } from '@/components/AnalyticsTracker';
import { getImageUrl } from '@/lib/api';

const INTER = "'Inter', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const DELIVERY_OPTIONS = [
  { id: 'fes', label: 'FÈS | فاس', price: 25 },
  { id: 'ext', label: 'Extérieure Fès | خارج فاس', price: 40 },
];

function CommandeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { items: cartItems } = useCart();

  const productId   = params.get('productId') || '';
  const variantId   = params.get('variantId') || '';
  const productName = params.get('name') || '';
  const productImage = params.get('image') || '';
  const size        = params.get('size') || '';
  const color       = params.get('color') || '';
  const price       = Number(params.get('price') || 0);
  const quantity    = Number(params.get('quantity') || 1);

  // Cart items excluding the current product
  const otherCartItems = cartItems.filter(i => i.variantId !== variantId);

  // Set of variantIds selected from cart to include in order
  const [selectedCart, setSelectedCart] = useState<Set<string>>(() => {
    // If entering directly from Cart (no productId specified in quick checkout),
    // we default to selecting ALL items in the cart.
    if (!productId && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('storshoes_cart');
        if (stored) {
          const parsed = JSON.parse(stored);
          return new Set<string>(parsed.map((i: { variantId: string }) => i.variantId));
        }
      } catch {}
    }
    return new Set<string>();
  });
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  const hideItem = (vid: string) => setHiddenItems(prev => new Set(prev).add(vid));

  const isCartCheckout = !productId;

  // Visible items: if cart checkout, use all cartItems, otherwise use otherCartItems.
  const baseItemsList = isCartCheckout ? cartItems : otherCartItems;
  const visibleCartItems = baseItemsList.filter(i => !hiddenItems.has(i.variantId));

  const toggleCart = (vid: string) => {
    setSelectedCart(prev => {
      const next = new Set(prev);
      next.has(vid) ? next.delete(vid) : next.add(vid);
      return next;
    });
  };

  const [form, setForm] = useState({ fullName: '', phone: '', city: '', address: '' });
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryOption = DELIVERY_OPTIONS.find(o => o.id === delivery)!;

  // Main product subtotal
  const mainSubtotal = isCartCheckout 
    ? 0
    : price * quantity;
    
  // Selected cart items subtotal
  const cartSubtotal = baseItemsList
        .filter(i => selectedCart.has(i.variantId))
        .reduce((s, i) => s + i.price * i.quantity, 0);
        
  const subtotal = mainSubtotal + cartSubtotal;
  const total = subtotal + deliveryOption.price;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Champ requis';
    if (!form.phone.trim() || !/^0[0-9]{9}$/.test(form.phone.trim())) e.phone = 'Numéro invalide (ex: 0612345678)';
    if (!form.city.trim()) e.city = 'Champ requis';
    if (!form.address.trim()) e.address = 'Champ requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            firstName: form.fullName.split(' ')[0],
            lastName: form.fullName.split(' ').slice(1).join(' ') || '-',
            phone: form.phone,
            city: form.city,
            address: form.address,
          },
          shippingCity: form.city,
          shippingAddress: form.address,
          shippingCost: deliveryOption.price,
          notes: `Mode de livraison: ${deliveryOption.label}`,
          source: 'WEBSITE',
          items: isCartCheckout
            ? cartItems.filter(i => selectedCart.has(i.variantId)).map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }))
            : [
                { productId, variantId, quantity },
                ...otherCartItems
                  .filter(i => selectedCart.has(i.variantId))
                  .map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
              ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erreur serveur');
      }

      const order = await response.json();
      console.log('Commande créée:', order.orderNumber);
      
      // Track conversion for analytics
      await trackConversion(order.id, total);
      
      setSubmitted(true);
    } catch (err) {
      console.error('Erreur commande:', err);
      alert('Erreur lors de la commande. Vérifiez que le serveur API est démarré (port 3001).');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ 
      minHeight: 'calc(100vh - 64px)', 
      backgroundColor: '#ffffff',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '1.5rem', 
      fontFamily: INTER,
      padding: '2rem'
    }}>
      <div style={{ fontSize: 64, marginTop: '2rem' }}>✅</div>
      <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.8rem', fontWeight: 700, color: '#000', margin: 0, textAlign: 'center' }}>Commande confirmée !</h2>
      <p style={{ color: '#555', fontSize: '0.95rem', margin: 0, padding: '0 2rem', textAlign: 'center', lineHeight: 1.6 }}>Notre équipe vous contactera sous 24h pour confirmer la livraison.</p>
      <Link href="/products" style={{ marginTop: '0.5rem', padding: '0.8rem 2rem', border: '1.5px solid #000', borderRadius: '0.5rem', color: '#000', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s ease' }}>
        Continuer les achats
      </Link>
    </div>
  );

  const fieldStyle = (err?: string): React.CSSProperties => ({
    width: '100%', padding: '0.65rem 0.9rem', border: `1.5px solid ${err ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '0.5rem', fontSize: '0.85rem', fontFamily: INTER, color: '#000',
    outline: 'none', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.2s ease',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 600, color: '#000', textTransform: 'uppercase',
    letterSpacing: '0.07em', fontFamily: INTER, marginBottom: '0.3rem', display: 'block',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', fontFamily: INTER }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: PLAYFAIR, fontSize: '1.8rem', fontWeight: 700, color: '#000', margin: 0, lineHeight: 1.2 }}>
          Commande avec paiement à la livraison
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#777', marginTop: '0.4rem', fontWeight: 400 }}>
          Payez à la réception — livraison rapide au Maroc 🇲🇦
        </p>
      </div>

      <style>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2.5rem;
          align-items: start;
        }
        .order-summary-container {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          position: sticky;
          top: 2rem;
        }
        .desktop-submit-btn {
          display: block;
        }
        .mobile-submit-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            display: flex;
            flex-direction: column-reverse; /* Put summary on top of form on mobile */
          }
          .order-summary-container {
            position: relative;
            top: auto;
          }
          .form-grid-row {
            grid-template-columns: 1fr !important;
          }
          .desktop-submit-btn {
            display: none !important;
          }
          .mobile-submit-btn-wrapper {
            display: flex !important;
            justify-content: flex-start;
            width: 100%;
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>
      <div className="checkout-grid">

        {/* ── LEFT: Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Delivery address */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.1rem', fontWeight: 700, color: '#000', margin: '0 0 1.2rem 0' }}>
              Insérez votre adresse de livraison
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Row 1: Full Name + Phone */}
              <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Nom complet | الاسم الكامل <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text" placeholder="Nom complet | الاسم الكامل"
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    style={fieldStyle(errors.fullName)}
                    onFocus={e => { e.target.style.borderColor = '#000'; }}
                    onBlur={e => { e.target.style.borderColor = errors.fullName ? '#ef4444' : '#d1d5db'; }}
                  />
                  {errors.fullName && <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.fullName}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Téléphone | الهاتف <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="tel" placeholder="Téléphone | الهاتف" inputMode="numeric" pattern="[0-9]*"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    style={fieldStyle(errors.phone)}
                    onFocus={e => { e.target.style.borderColor = '#000'; }}
                    onBlur={e => { e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db'; }}
                  />
                  {errors.phone && <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.phone}</span>}
                </div>
              </div>

              {/* Row 2: City + Address */}
              <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Ville | المدينة <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text" placeholder="Ville | المدينة"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    style={fieldStyle(errors.city)}
                    onFocus={e => { e.target.style.borderColor = '#000'; }}
                    onBlur={e => { e.target.style.borderColor = errors.city ? '#ef4444' : '#d1d5db'; }}
                  />
                  {errors.city && <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.city}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Adresse | العنوان <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text" placeholder="Adresse | العنوان"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    style={fieldStyle(errors.address)}
                    onFocus={e => { e.target.style.borderColor = '#000'; }}
                    onBlur={e => { e.target.style.borderColor = errors.address ? '#ef4444' : '#d1d5db'; }}
                  />
                  {errors.address && <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.2rem', display: 'block' }}>{errors.address}</span>}
                </div>
              </div>

            </div>
          </div>

          {/* Delivery Mode */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.1rem', fontWeight: 700, color: '#000', margin: '0 0 1rem 0' }}>
              Mode de livraison
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {DELIVERY_OPTIONS.map(opt => (
                <label key={opt.id} onClick={() => setDelivery(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.8rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
                    border: `1.5px solid ${delivery === opt.id ? '#000' : '#e5e7eb'}`,
                    background: delivery === opt.id ? '#f9f9f9' : '#fff',
                    transition: 'all 0.2s ease',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${delivery === opt.id ? '#000' : '#d1d5db'}`,
                      background: delivery === opt.id ? '#000' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {delivery === opt.id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#000', fontFamily: INTER, fontWeight: delivery === opt.id ? 600 : 400 }}>{opt.label}</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#000', fontFamily: INTER, flexShrink: 0 }}>{opt.price.toFixed(2)} dh</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Mobile Only */}
          <div className="mobile-submit-btn-wrapper" style={{ display: 'none' }}>
            <button onClick={handleSubmit} disabled={submitting}
              className="mobile-submit-btn"
              style={{
                width: '100%', maxWidth: '300px', margin: '0 auto 0 calc(50% - 130px)', padding: '1rem 2rem',
                borderRadius: '99px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting ? '#555' : '#000', color: '#fff',
                fontFamily: INTER, fontWeight: 700, fontSize: '0.9rem',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.2), 0 4px 10px -2px rgba(0, 0, 0, 0.1)',
                display: 'block',
              }}
              onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'; } }}
              onMouseLeave={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(0, 0, 0, 0.2), 0 4px 10px -2px rgba(0, 0, 0, 0.1)'; } }}>
              {submitting ? 'Confirmation...' : 'Confirmer la commande'}
            </button>
          </div>

        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="order-summary-container">
          <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.1rem', fontWeight: 700, color: '#000', margin: '0 0 1.2rem 0' }}>
            Récapitulatif
          </h2>

          {/* Main Product row (only for Quick Checkout) */}
          {!isCartCheckout && (
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                {productImage && (
                  <div style={{ width: 70, height: 70, borderRadius: '0.5rem', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                    <img src={getImageUrl(productImage)} alt={productName} width={70} height={70} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <p style={{ fontFamily: PLAYFAIR, fontSize: '1rem', fontWeight: 700, color: '#000', margin: 0, lineHeight: 1.3 }}>{productName}</p>
                  {size && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Taille</span>
                      <span style={{ fontSize: '0.78rem', color: '#000', fontFamily: INTER, fontWeight: 600 }}>{size}</span>
                    </div>
                  )}
                  {color && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Couleur</span>
                      <span style={{ fontSize: '0.78rem', color: '#000', fontFamily: INTER, fontWeight: 600 }}>{color}</span>
                    </div>
                  )}
                  {quantity > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantité</span>
                      <span style={{ fontSize: '0.78rem', color: '#000', fontFamily: INTER, fontWeight: 600 }}>{quantity}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', paddingTop: '0.4rem', borderTop: '1px dashed #e5e7eb' }}>
                    <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#000', fontFamily: INTER }}>{price.toLocaleString('en-US')} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Cart items list (Checkable) ── */}
          {visibleCartItems.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: INTER, margin: '0 0 0.6rem 0' }}>
                {isCartCheckout ? "Articles sélectionnés" : "Ajouter des articles de votre panier"}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {visibleCartItems.map((item) => {
                  const isChecked = selectedCart.has(item.variantId);
                  return (
                    <div key={item.variantId}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                        padding: '1rem', borderRadius: '0.5rem',
                        border: `1.5px solid ${isChecked ? '#000' : '#e5e7eb'}`,
                        background: isChecked ? '#fafafa' : '#fff',
                        transition: 'all 0.2s ease', cursor: 'pointer',
                      }}
                      onClick={() => toggleCart(item.variantId)}>

                      {/* Custom checkbox */}
                      <div style={{
                        width: 20, height: 20, borderRadius: '0.3rem', flexShrink: 0, marginTop: '2rem',
                        border: `2px solid ${isChecked ? '#000' : '#d1d5db'}`,
                        background: isChecked ? '#000' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}>
                        {isChecked && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                      </div>

                      {/* Image */}
                      {item.image && (
                        <div style={{ width: 70, height: 70, borderRadius: '0.5rem', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                          <img src={getImageUrl(item.image)} alt={item.name} width={70} height={70} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      {/* Info & Vertical Layout */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <p style={{ fontFamily: PLAYFAIR, fontSize: '1rem', fontWeight: 700, color: '#000', margin: 0, lineHeight: 1.3 }}>{item.name}</p>
                        {item.size && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Taille</span>
                            <span style={{ fontSize: '0.78rem', color: '#000', fontFamily: INTER, fontWeight: 600 }}>{item.size}</span>
                          </div>
                        )}
                        {item.color && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Couleur</span>
                            <span style={{ fontSize: '0.78rem', color: '#000', fontFamily: INTER, fontWeight: 600 }}>{item.color}</span>
                          </div>
                        )}
                        {item.quantity > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantité</span>
                            <span style={{ fontSize: '0.78rem', color: '#000', fontFamily: INTER, fontWeight: 600 }}>{item.quantity}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', paddingTop: '0.4rem', borderTop: '1px dashed #e5e7eb' }}>
                          <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: INTER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#000', fontFamily: INTER }}>{(item.price * item.quantity).toLocaleString('en-US')} MAD</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#555', fontFamily: INTER }}>Sous-total</span>
              <span style={{ fontSize: '0.82rem', color: '#000', fontFamily: INTER, fontWeight: 500 }}>{subtotal.toLocaleString('en-US')} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#555', fontFamily: INTER }}>Livraison</span>
              <span style={{ fontSize: '0.82rem', color: '#000', fontFamily: INTER, fontWeight: 500 }}>{deliveryOption.price.toFixed(2)} dh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #000', paddingTop: '0.65rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#000', fontFamily: INTER }}>Total</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#000', fontFamily: INTER }}>{total.toLocaleString('en-US')} MAD</span>
            </div>
          </div>

          {/* Submit Desktop Only */}
          <button onClick={handleSubmit} disabled={submitting}
            className="desktop-submit-btn"
            style={{
              width: '100%', marginTop: '1.2rem', padding: '0.75rem',
              borderRadius: '0.5rem', border: '1.5px solid #000', cursor: submitting ? 'not-allowed' : 'pointer',
              background: submitting ? '#555' : '#000', color: '#fff',
              fontFamily: INTER, fontWeight: 700, fontSize: '0.82rem',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000'; } }}
            onMouseLeave={e => { if (!submitting) { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; } }}>
            {submitting ? 'Confirmation...' : 'Confirmer la commande'}
          </button>


        </div>
      </div>
    </div>
  );
}

export default function CommandePage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif", color: '#888' }}>Chargement...</div>}>
      <CommandeContent />
    </Suspense>
  );
}
