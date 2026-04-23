import { useState, useEffect, useCallback } from 'react';
import { Mail, Eye, Trash2, CheckCircle, Search, RefreshCw, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { contactMessagesApi } from '../services/api';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  NEW: 'جديد',
  READ: 'مقروء',
  REPLIED: 'تم الرد',
  ARCHIVED: 'مؤرشف',
};

const statusBadge: Record<string, string> = {
  NEW: 'badge-pending',
  READ: 'badge-confirmed',
  REPLIED: 'badge-delivered',
  ARCHIVED: 'badge-cancelled',
};

export default function ContactMessagesPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ new: 0, read: 0, replied: 0, total: 0 });

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const [messagesRes, statsRes] = await Promise.all([
        contactMessagesApi.getAll({ search: search || undefined, status: statusFilter || undefined }),
        contactMessagesApi.getStats(),
      ]);
      setMessages(messagesRes.data.data || []);
      setStats(statsRes.data.data || { new: 0, read: 0, replied: 0, total: 0 });
    } catch {
      toast.error('فشل تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleStatusChange = async (id: string, newStatus: ContactMessage['status']) => {
    try {
      await contactMessagesApi.updateStatus(id, newStatus);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      toast.success(`تم تحديث الحالة إلى: ${statusLabels[newStatus]}`);
    } catch {
      toast.error('فشل تحديث الحالة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      await contactMessagesApi.delete(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('تم حذف الرسالة');
    } catch {
      toast.error('فشل حذف الرسالة');
    }
  };

  const normalizePhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('212')) return digits;
    if (digits.startsWith('0')) return `212${digits.slice(1)}`;
    return digits;
  };

  const buildReplyText = (message: ContactMessage) => {
    return `مرحباً ${message.name},
توصلنا برسالتك بخصوص: ${message.subject}

محتوى رسالتك:
${message.message}

نشكرك على تواصلك معنا، وسنساعدك في أقرب وقت.
فريق StorShoes`;
  };

  const openWhatsAppReply = (message: ContactMessage) => {
    const phone = normalizePhoneForWhatsApp(message.phone);
    if (!phone) {
      toast.error('لا يوجد رقم هاتف صالح لهذا العميل');
      return;
    }
    const text = encodeURIComponent(buildReplyText(message));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const openEmailReply = (message: ContactMessage) => {
    if (!message.email) {
      toast.error('لا يوجد بريد إلكتروني لهذا العميل');
      return;
    }
    const subject = encodeURIComponent(`رد بخصوص رسالتك: ${message.subject}`);
    const body = encodeURIComponent(buildReplyText(message));
    window.open(`mailto:${message.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const filteredMessages = messages;

  return (
    <div>
      <div className="page-header">
        <h2>📧 رسائل العملاء</h2>
        <button className="btn btn-outline" onClick={loadMessages}>
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <Mail size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.new}</div>
            <div className="stat-label">رسائل جديدة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.read}</div>
            <div className="stat-label">مقروءة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
            <Send size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.replied}</div>
            <div className="stat-label">تم الرد عليها</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#8b5cf6' }}>
            <Mail size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">إجمالي الرسائل</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            className="form-input"
            style={{ paddingRight: '2.5rem' }}
            placeholder="بحث بالاسم، البريد، الهاتف أو الموضوع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: '160px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="تصفية حالة الرسائل"
          title="تصفية حالة الرسائل"
        >
          <option value="">كل الحالات</option>
          <option value="NEW">جديد</option>
          <option value="READ">مقروء</option>
          <option value="REPLIED">تم الرد</option>
          <option value="ARCHIVED">مؤرشف</option>
        </select>
      </div>

      {/* Messages Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>المرسل</th>
              <th>الموضوع</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><div className="loading-spinner"><div className="spinner" /></div></td></tr>
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  لا توجد رسائل
                </td>
              </tr>
            ) : filteredMessages.map((message) => (
              <tr key={message.id} style={{ background: message.status === 'NEW' ? '#fef3c7' : undefined }}>
                <td>
                  <div style={{ fontWeight: 500 }}>{message.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{message.email}</div>
                  {message.phone && (
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }} dir="ltr">{message.phone}</div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 500, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {message.subject}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {message.message.substring(0, 50)}...
                  </div>
                </td>
                <td>
                  <select
                    className={`badge ${statusBadge[message.status]}`}
                    style={{ border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
                    value={message.status}
                    onChange={(e) => handleStatusChange(message.id, e.target.value as ContactMessage['status'])}
                    aria-label="تغيير حالة الرسالة"
                    title="تغيير الحالة"
                  >
                    <option value="NEW">جديد</option>
                    <option value="READ">مقروء</option>
                    <option value="REPLIED">تم الرد</option>
                    <option value="ARCHIVED">مؤرشف</option>
                  </select>
                </td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {new Date(message.createdAt).toLocaleDateString('ar-MA')}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.6rem' }}
                      onClick={() => navigate(`/contact/${message.id}`)}
                      aria-label="عرض تفاصيل الرسالة"
                      title="عرض التفاصيل"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.6rem', color: '#16a34a' }}
                      onClick={() => openWhatsAppReply(message)}
                      aria-label="الرد عبر واتساب"
                      title="الرد عبر واتساب"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.6rem', color: '#2563eb' }}
                      onClick={() => openEmailReply(message)}
                      aria-label="الرد عبر الإيميل"
                      title="الرد عبر الإيميل"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.6rem', color: '#ef4444' }}
                      onClick={() => handleDelete(message.id)}
                      aria-label="حذف الرسالة"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
