'use client';

import { useState, useCallback } from 'react';
import { storeApi, getErrorMessage } from '@/lib/api';
import { ValidationError, NetworkError } from '@/lib/api-errors';

const INTER = "'Inter', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

// Moroccan phone validation regex
const MOROCCAN_PHONE_REGEX = /^(0[5-7]\d{8}|0[8-9]\d{8})$/;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({ name: false, email: false, phone: false, message: false });
  const [status, setStatus] = useState<'' | 'submitting' | 'success' | 'error'>('');

  // Validation functions
  const validateField = useCallback((name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Le nom complet est requis';
        if (value.trim().length < 3) return 'Le nom doit contenir au moins 3 caractères';
        if (!/^[\p{L}\s'-]+$/u.test(value)) return 'Le nom ne doit contenir que des lettres';
        return undefined;
      
      case 'phone':
        if (!value.trim()) return 'Le numéro de téléphone est requis';
        const cleanPhone = value.replace(/\s/g, '');
        if (!MOROCCAN_PHONE_REGEX.test(cleanPhone)) {
          return 'Numéro invalide (ex: 0612345678 ou 0523456789)';
        }
        return undefined;
      
      case 'email':
        if (value && !EMAIL_REGEX.test(value)) {
          return 'Adresse email invalide';
        }
        return undefined;
      
      case 'message':
        if (!value.trim()) return 'Le message est requis';
        if (value.trim().length < 10) return 'Le message doit contenir au moins 10 caractères';
        if (value.trim().length > 1000) return 'Le message ne doit pas dépasser 1000 caractères';
        return undefined;
      
      default:
        return undefined;
    }
  }, []);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(form) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });
    return isValid;
  }, [form, validateField]);

  // Handle field change
  const handleChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for touched fields
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Handle field blur
  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Submit to backend API
      const response = await fetch(`${API_URL}/contact-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || 'no-email@example.com',
          phone: form.phone.replace(/\s/g, ''),
          subject: 'رسالة من صفحة الاتصال',
          message: form.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          // Handle validation errors from server
          const serverErrors: FormErrors = {};
          Object.entries(data.errors).forEach(([field, messages]) => {
            if (field in form && Array.isArray(messages)) {
              serverErrors[field as keyof FormData] = messages[0];
            }
          });
          setErrors(prev => ({ ...prev, ...serverErrors }));
          throw new Error('Veuillez corriger les erreurs ci-dessous.');
        }
        throw new Error(data.message || 'Failed to send message');
      }

      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
      setTouched({ name: false, email: false, phone: false, message: false });
      setErrors({});
      console.log('✅ Message envoyé:', data.data.id);
    } catch (error) {
      setStatus('error');

      if (error instanceof ValidationError) {
        // Handle validation errors from server
        const serverErrors: FormErrors = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (field in form) {
            serverErrors[field as keyof FormData] = messages[0];
          }
        });
        setErrors(prev => ({ ...prev, ...serverErrors }));
        setErrorMessage('Veuillez corriger les erreurs ci-dessous.');
      } else if (error instanceof NetworkError) {
        setErrorMessage('Erreur de connexion. Veuillez vérifier votre connexion internet.');
      } else {
        setErrorMessage(getErrorMessage(error instanceof Error ? error : new Error(String(error)), 'en'));
      }
    }
  };

  const resetForm = () => {
    setStatus('');
    setForm({ name: '', email: '', phone: '', message: '' });
    setTouched({ name: false, email: false, phone: false, message: false });
    setErrors({});
  };

  const getInputStyle = (fieldName: keyof FormData): React.CSSProperties => ({
    width: '100%',
    padding: '1.1rem 1.5rem',
    border: `1.5px solid ${errors[fieldName] && touched[fieldName] ? '#ef4444' : '#e0e0e0'}`,
    borderRadius: '99px',
    background: '#fff',
    outline: 'none',
    fontFamily: INTER,
    fontSize: '0.95rem',
    color: '#000',
    transition: 'all 0.3s ease',
  });

  const getTextareaStyle = (): React.CSSProperties => ({
    width: '100%',
    padding: '1.5rem',
    border: `1.5px solid ${errors.message && touched.message ? '#ef4444' : '#e0e0e0'}`,
    borderRadius: '1.5rem',
    background: '#fff',
    outline: 'none',
    fontFamily: INTER,
    fontSize: '0.95rem',
    color: '#000',
    resize: 'none',
    transition: 'all 0.3s ease',
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: INTER, 
    fontSize: '0.72rem', 
    fontWeight: 700, 
    textTransform: 'uppercase', 
    letterSpacing: '0.08em', 
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const errorStyle: React.CSSProperties = {
    fontFamily: INTER,
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  };

  const charCountStyle: React.CSSProperties = {
    fontFamily: INTER,
    fontSize: '0.7rem',
    color: form.message.length > 900 ? '#f59e0b' : '#aaa',
    marginTop: '0.3rem',
    textAlign: 'right',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: INTER, color: '#000' }}>
      {/* ── HERO ── */}
      <div style={{ 
        background: 'linear-gradient(135deg, #000000 0%, #2a2a2a 60%, #e0e0e0 100%)', 
        color: '#fff', 
        padding: '6rem 1.5rem', 
        textAlign: 'center',
        borderBottom: '1px solid #f0f0f0' 
      }}>
        <h1 style={{ fontFamily: PLAYFAIR, fontSize: '3.2rem', fontWeight: 600, margin: '0 0 1rem 0', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Contactez-nous | اتصل بنا
        </h1>
        <p style={{ fontFamily: INTER, fontSize: '1.05rem', color: '#eaeaea', margin: 0, maxWidth: 550, marginInline: 'auto', lineHeight: 1.6, textShadow: '0 1px 5px rgba(0,0,0,0.8)' }}>
          Nous sommes à votre disposition pour répondre à toutes vos questions. N&#39;hésitez pas à nous écrire.
        </p>
      </div>

      {/* ── CONTENT GRID ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          
          {/* ── LEFT: Info ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.6rem', fontWeight: 600, marginBottom: '1.5rem', color: '#000' }}>
                Informations | معلومات
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '1rem' }}>
                
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <img src="/icons/letter.png" alt="Email" width={26} height={26} style={{ width: 26, height: 26, opacity: 0.9, marginTop: '0.2rem' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontFamily: INTER }}>Email | البريد الإلكتروني</span>
                    <a href="mailto:contact@storshoes.ma" style={{ color: '#000', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, fontFamily: INTER, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#555'} onMouseLeave={e => e.currentTarget.style.color = '#000'}>contact@storshoes.ma</a>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <img src="/icons/info.png" alt="Téléphone" width={26} height={26} style={{ width: 26, height: 26, opacity: 0.9, marginTop: '0.2rem' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontFamily: INTER }}>Téléphone | هاتف</span>
                    <a href="tel:+212600000000" style={{ color: '#000', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500, fontFamily: INTER, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#555'} onMouseLeave={e => e.currentTarget.style.color = '#000'}>+212 600 00 00 00</a>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <img src="/icons/boutique.png" alt="Boutique" width={26} height={26} style={{ width: 26, height: 26, opacity: 0.9, marginTop: '0.2rem' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontFamily: INTER }}>Boutique | المتجر</span>
                    <span style={{ color: '#000', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.5, fontFamily: INTER }}>
                      Bd. Mohammed V<br/>Casablanca, Maroc
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <img src="/icons/clock.png" alt="Horaires" width={26} height={26} style={{ width: 26, height: 26, opacity: 0.9, marginTop: '0.2rem' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontFamily: INTER }}>Horaires | ساعات العمل</span>
                    <span style={{ color: '#000', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.5, fontFamily: INTER }}>
                      Lundi - Samedi : 9h00 - 20h00
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── RIGHT: Form ── */}
          <div>
            <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.6rem', fontWeight: 600, marginBottom: '2rem', color: '#000' }}>
              Envoyez un message
            </h2>
            
            {status === 'success' ? (
              <div style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)', color: '#fff', padding: '2.5rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2rem',
                  boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)'
                }}>
                  ✓
                </div>
                <h3 style={{ fontFamily: PLAYFAIR, fontSize: '1.4rem', margin: '0 0 0.75rem 0', fontWeight: 600 }}>Message envoyé avec succès !</h3>
                <p style={{ fontSize: '0.95rem', color: '#aaa', margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>Notre équipe vous répondra dans les plus brefs délais.</p>
                <button 
                  onClick={resetForm}
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '0.75rem 2rem',
                    borderRadius: '99px',
                    cursor: 'pointer',
                    fontFamily: INTER,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : status === 'error' ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ fontFamily: PLAYFAIR, fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>Une erreur s&apos;est produite</h3>
                <p style={{ fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                  {errorMessage || 'Veuillez réessayer ou nous contacter directement par téléphone.'}
                </p>
                <button
                  onClick={() => setStatus('')}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '99px',
                    cursor: 'pointer',
                    fontFamily: INTER,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={labelStyle}>
                      Nom complet | الاسم الكامل 
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Youssef El Amrani"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      onBlur={e => {
                        handleBlur('name');
                        if (!errors.name) {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                      style={getInputStyle('name')}
                      onFocus={e => {
                        if (!errors.name || !touched.name) {
                          e.target.style.borderColor = '#000';
                          e.target.style.boxShadow = '0 0 0 1px #000';
                        }
                      }}
                      aria-invalid={Boolean(errors.name && touched.name)}
                      aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
                    />
                    {errors.name && touched.name && (
                      <span id="name-error" style={errorStyle} role="alert">
                        <span>⚠</span> {errors.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={labelStyle}>
                      Téléphone | هاتف 
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 0612345678"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      onBlur={e => {
                        handleBlur('phone');
                        if (!errors.phone) {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                      style={getInputStyle('phone')}
                      onFocus={e => {
                        if (!errors.phone || !touched.phone) {
                          e.target.style.borderColor = '#000';
                          e.target.style.boxShadow = '0 0 0 1px #000';
                        }
                      }}
                      aria-invalid={Boolean(errors.phone && touched.phone)}
                      aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
                    />
                    {errors.phone && touched.phone && (
                      <span id="phone-error" style={errorStyle} role="alert">
                        <span>⚠</span> {errors.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={labelStyle}>
                    Email | البريد الإلكتروني 
                    <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>(Optionnel)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="contact@exemple.ma"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={e => {
                      handleBlur('email');
                      if (!errors.email) {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                    style={getInputStyle('email')}
                    onFocus={e => {
                      if (!errors.email || !touched.email) {
                        e.target.style.borderColor = '#000';
                        e.target.style.boxShadow = '0 0 0 1px #000';
                      }
                    }}
                    aria-invalid={Boolean(errors.email && touched.email)}
                    aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                  />
                  {errors.email && touched.email && (
                    <span id="email-error" style={errorStyle} role="alert">
                      <span>⚠</span> {errors.email}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={labelStyle}>
                    Message | رسالتك 
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    placeholder="Comment pouvons-nous vous aider ? | كيف يمكننا مساعدتك؟"
                    rows={5}
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    onBlur={e => {
                      handleBlur('message');
                      if (!errors.message) {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                    style={getTextareaStyle()}
                    onFocus={e => {
                      if (!errors.message || !touched.message) {
                        e.target.style.borderColor = '#000';
                        e.target.style.boxShadow = '0 0 0 1px #000';
                      }
                    }}
                    aria-invalid={Boolean(errors.message && touched.message)}
                    aria-describedby={errors.message && touched.message ? 'message-error' : 'message-help'}
                    maxLength={1000}
                  ></textarea>
                  {errors.message && touched.message ? (
                    <span id="message-error" style={errorStyle} role="alert">
                      <span>⚠</span> {errors.message}
                    </span>
                  ) : (
                    <span id="message-help" style={charCountStyle}>
                      {form.message.length}/1000 caractères
                    </span>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  style={{
                    background: status === 'submitting' ? '#555' : '#000',
                    color: '#fff',
                    padding: '1.2rem',
                    border: 'none',
                    borderRadius: '99px',
                    fontFamily: INTER,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: status === 'submitting' ? 'wait' : 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'all 0.3s ease',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: status === 'submitting' ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (status !== 'submitting') { e.currentTarget.style.background = '#333'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                  onMouseLeave={e => { if (status !== 'submitting') { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  {status === 'submitting' ? (
                    <>
                      <span style={{ 
                        width: '18px', 
                        height: '18px', 
                        border: '2px solid rgba(255,255,255,0.3)', 
                        borderTopColor: '#fff', 
                        borderRadius: '50%', 
                        animation: 'spin 0.8s linear infinite' 
                      }} />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le message 
                      <span style={{ fontSize: '1.1rem' }}>→</span>
                    </>
                  )}
                </button>

                {/* Add animation keyframes */}
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
