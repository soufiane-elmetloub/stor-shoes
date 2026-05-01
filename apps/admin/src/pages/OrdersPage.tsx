import { useState, useEffect } from 'react';
import { ordersApi, getImageUrl } from '../services/api';
import { Search, Eye, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const statusLabels: Record<string, string> = {
  PENDING: 'قيد المراجعة', CONFIRMED: 'تم التأكيد', PROCESSING: 'قيد التجهيز',
  SHIPPED: 'تم الشحن', DELIVERED: 'تم التوصيل', CANCELLED: 'ملغي', RETURNED: 'مرتجع',
};
const statusBadge: Record<string, string> = {
  PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PROCESSING: 'badge-processing',
  SHIPPED: 'badge-shipped', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled', RETURNED: 'badge-cancelled',
};
const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { loadOrders(); }, [page, search, statusFilter]);

  const loadOrders = async () => {
    try {
      const { data } = await ordersApi.getAll({ page, limit: 15, search: search || undefined, status: statusFilter || undefined });
      setOrders(data.data);
      setTotalPages(data.totalPages);
    } catch { toast.error('فشل تحميل الطلبات'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success(`تم تحديث الحالة إلى: ${statusLabels[newStatus]}`);
      loadOrders();
    } catch { toast.error('فشل تحديث الحالة'); }
  };

  const handleWhatsApp = (order: any) => {
    const orderPhone = order.customerPhone || order.customer?.phone;
    const orderFirstName = order.customerFirstName || order.customer?.firstName;
    if (!orderPhone) return toast.error('لا يوجد رقم هاتف متاح للعميل');
    // Ensure phone starts with country code, simplified formatting
    let phone = String(orderPhone).replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '212' + phone.substring(1); // Auto Moroccan code
    else if (!phone.startsWith('212') && phone.length <= 10) phone = '212' + phone;

    const productName = order.items?.[0]?.product?.name || 'المنتجات المميزة';
    let msg = `مرحباً ${orderFirstName || 'عميلنا العزيز'}،\n\n`;
    msg += `نتواصل معك من متجر StorShoes 👟\n`;
    msg += `نحن بصدد تأكيد طلبك رقم (${order.orderNumber}) والذي يتضمن حذاء [ ${productName} ] بإجمالي ${Number(order.total).toLocaleString()} درهم.\n\n`;
    msg += `هل يمكنك تأكيد العنوان وأوقات الاستلام المناسبة لك؟\nشكراً لثقتك بنا!`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const addZero = (num: number) => num.toString().padStart(2, '0');
    return `${addZero(d.getDate())}/${addZero(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  return (
    <div>
      <div className="page-header">
        <h2>🛒 إدارة الطلبات</h2>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="form-input" style={{ paddingRight: '2.5rem' }} placeholder="بحث برقم الطلب أو الهاتف..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-input" style={{ width: 'auto', minWidth: '160px' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">كل الحالات</option>
          {allStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      <div className="premium-table-wrapper">
        <table className="data-table premium-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>المنتجات</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>المصدر</th>
              <th>التاريخ</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><div className="loading-spinner"><div className="spinner" /></div></td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>لا توجد طلبات</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.orderNumber}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{order.customerFirstName || order.customer?.firstName} {order.customerLastName || order.customer?.lastName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{order.customerPhone || order.customer?.phone}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    {order.items?.slice(0, 3).map((item: any, idx: number) => {
                      const imgUrl = item.variant?.imageUrls?.[0] || item.variant?.imageUrl || item.product?.images?.[0]?.url;
                      return (
                        <div key={idx} style={{ position: 'relative' }} title={`${item.product?.name} (x${item.quantity})`}>
                          {imgUrl ? (
                            <img 
                              src={getImageUrl(imgUrl)} 
                              alt="product" 
                              style={{ width: '40px', height: '40px', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                            />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>بدون</div>
                          )}
                          <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#000', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '1rem', fontWeight: 'bold', border: '1px solid white' }}>
                            {item.quantity}
                          </span>
                        </div>
                      );
                    })}
                    {order.items?.length > 3 && (
                      <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ fontWeight: 700 }}>{Number(order.total).toLocaleString()} MAD</td>
                <td><span className={`badge ${statusBadge[order.status]}`}>{statusLabels[order.status]}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{order.source === 'INSTAGRAM' ? '📸 Instagram' : order.source === 'MANUAL' ? '✍️ يدوي' : '🌐 الموقع'}</td>
                <td style={{ fontSize: '0.85rem', color: '#475569', direction: 'ltr', textAlign: 'right' }}>{formatDate(order.createdAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} onClick={() => navigate(`/orders/${order.id}`)} title="عرض التفاصيل"><Eye size={16} /></button>
                    <button className="btn" style={{ padding: '0.4rem 0.6rem', background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }} onClick={() => handleWhatsApp(order)} title="تواصل عبر الواتساب">
                      <MessageCircle size={16} />
                    </button>
                    <select
                      className="form-input"
                      style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      {allStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
