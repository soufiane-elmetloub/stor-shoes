import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Phone, MapPin, UserRound, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl, ordersApi } from '../services/api';

const statusLabels: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  CONFIRMED: 'تم التأكيد',
  PROCESSING: 'قيد التجهيز',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي',
  RETURNED: 'مرتجع',
};

const statusBadge: Record<string, string> = {
  PENDING: 'badge-pending',
  CONFIRMED: 'badge-confirmed',
  PROCESSING: 'badge-processing',
  SHIPPED: 'badge-shipped',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled',
  RETURNED: 'badge-cancelled',
};

const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatCurrency = (value: number) => `${Number(value || 0).toLocaleString('fr-MA')} MAD`;

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        const { data } = await ordersApi.getById(id);
        setOrder(data);
      } catch {
        toast.error('تعذر تحميل تفاصيل الطلب');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const customerName = useMemo(() => {
    if (!order) return '-';
    const first = order.customerFirstName || order.customer?.firstName || '';
    const last = order.customerLastName || order.customer?.lastName || '';
    return `${first} ${last}`.trim() || '-';
  }, [order]);

  const signatureDate = useMemo(() => {
    if (!order) return '-';
    return formatDateTime(order.updatedAt || order.createdAt);
  }, [order]);

  const signatureText = useMemo(() => {
    if (!order) return 'Customer Signature';
    const first = order.customerFirstName || order.customer?.firstName || '';
    const last = order.customerLastName || order.customer?.lastName || '';
    return `${first} ${last}`.trim() || 'Customer Signature';
  }, [order]);

  const updateStatus = async (newStatus: string) => {
    if (!order?.id) return;
    try {
      setStatusSaving(true);
      await ordersApi.updateStatus(order.id, newStatus);
      setOrder((prev: any) => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
      toast.success(`تم تحديث الحالة إلى: ${statusLabels[newStatus]}`);
    } catch {
      toast.error('تعذر تحديث الحالة');
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  if (!order) {
    return (
      <div className="empty-state">
        <h3 style={{ marginBottom: '0.75rem' }}>الطلب غير موجود</h3>
        <Link to="/orders" className="btn btn-outline">الرجوع إلى الطلبات</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2>📄 تفاصيل الطلب {order.orderNumber}</h2>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${statusBadge[order.status]}`}>{statusLabels[order.status]}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              تاريخ الإنشاء: {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>
        <Link to="/orders" className="btn btn-outline">
          <ArrowLeft size={16} />
          رجوع للطلبات
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div className="chart-card" style={{ direction: 'rtl' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserRound size={18} />
            بيانات العميل والشحن
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>الاسم الكامل</div>
              <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>{customerName}</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={14} />
                الهاتف
              </div>
              <div dir="ltr" style={{ marginTop: '0.25rem', fontWeight: 600 }}>{order.customerPhone || order.customer?.phone || '-'}</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} />
                المدينة
              </div>
              <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>{order.customerCity || order.shippingCity || '-'}</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>العنوان</div>
              <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>{order.customerAddress || order.shippingAddress || '-'}</div>
            </div>
          </div>
        </div>

        <div className="chart-card" style={{ direction: 'rtl' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardCheck size={18} />
            حالة الطلب
          </h3>
          <select
            className="form-input"
            value={order.status}
            disabled={statusSaving}
            onChange={(e) => updateStatus(e.target.value)}
            style={{ direction: 'rtl', marginBottom: '0.75rem' }}
          >
            {allStatuses.map((status) => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CalendarDays size={14} />
            آخر تحديث: {formatDateTime(order.updatedAt || order.createdAt)}
          </div>
          {order.notes && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.6rem', fontSize: '0.8rem' }}>
              <div style={{ color: '#64748b', marginBottom: '0.25rem' }}>ملاحظات:</div>
              <div>{order.notes}</div>
            </div>
          )}
        </div>
      </div>

      <div className="chart-card" style={{ direction: 'rtl', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🧾 تفاصيل المنتجات المطلوبة</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {order.items?.map((item: any, index: number) => {
            const img = item.product?.images?.[0]?.url;
            const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
            return (
              <div
                key={item.id || index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto',
                  gap: '0.9rem',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.8rem',
                  padding: '0.75rem',
                }}
              >
                {img ? (
                  <img
                    src={getImageUrl(img)}
                    alt={item.product?.name || 'منتج'}
                    style={{ width: '70px', height: '70px', borderRadius: '0.7rem', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                ) : (
                  <div style={{ width: '70px', height: '70px', borderRadius: '0.7rem', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                    بدون صورة
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>{item.product?.name || 'منتج'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    المقاس: {item.variant?.size || '-'} {item.variant?.color ? `| اللون: ${item.variant.color}` : ''}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                    سعر الوحدة: {formatCurrency(Number(item.price || 0))}
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>الكمية: x{item.quantity}</div>
                  <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{formatCurrency(lineTotal)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '1rem', display: 'grid', gap: '0.45rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span>المجموع الفرعي</span>
            <span>{formatCurrency(Number(order.subtotal || 0))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span>الشحن</span>
            <span>{formatCurrency(Number(order.shippingCost || 0))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            <span>الإجمالي النهائي</span>
            <span>{formatCurrency(Number(order.total || 0))}</span>
          </div>
        </div>
      </div>

      <div className="chart-card" style={{ direction: 'rtl' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>✍️ التوقيع والتاريخ</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ border: '1px dashed #cbd5e1', borderRadius: '0.8rem', padding: '1rem', background: '#f8fafc' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>توقيع العميل</div>
            <div style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive', fontSize: '1.8rem', color: '#0f172a', minHeight: '2.2rem' }}>
              {signatureText}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>تم اعتماد الطلب باسم العميل المسجل.</div>
          </div>
          <div style={{ border: '1px dashed #cbd5e1', borderRadius: '0.8rem', padding: '1rem', background: '#f8fafc' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>تاريخ الاعتماد</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{signatureDate}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              المصدر: {order.source === 'INSTAGRAM' ? 'Instagram' : order.source === 'MANUAL' ? 'يدوي' : 'الموقع'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
