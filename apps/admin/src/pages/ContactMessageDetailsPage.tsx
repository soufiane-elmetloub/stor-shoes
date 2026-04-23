import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Mail, MessageCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
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

export default function ContactMessageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    const loadMessage = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await contactMessagesApi.getById(id);
        const messageData: ContactMessage | undefined = response.data?.data || response.data;

        if (!messageData?.id) {
          throw new Error('Invalid message payload');
        }

        setMessage(messageData);
        if (messageData.status === 'NEW') {
          await contactMessagesApi.updateStatus(id, 'READ');
          setMessage((prev) => (prev ? { ...prev, status: 'READ' } : prev));
        }
      } catch {
        toast.error('تعذر تحميل تفاصيل الرسالة');
      } finally {
        setLoading(false);
      }
    };

    loadMessage();
  }, [id]);

  const replyText = useMemo(() => {
    if (!message) return '';
    return `مرحباً ${message.name},
توصلنا برسالتك بخصوص: ${message.subject}

محتوى رسالتك:
${message.message}

نشكرك على تواصلك معنا، وسنساعدك في أقرب وقت.
فريق StorShoes`;
  }, [message]);

  const normalizePhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('212')) return digits;
    if (digits.startsWith('0')) return `212${digits.slice(1)}`;
    return digits;
  };

  const openWhatsAppReply = () => {
    if (!message) return;
    const phone = normalizePhoneForWhatsApp(message.phone);
    if (!phone) {
      toast.error('لا يوجد رقم هاتف صالح لهذا العميل');
      return;
    }
    const text = encodeURIComponent(replyText);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const openEmailReply = () => {
    if (!message?.email) {
      toast.error('لا يوجد بريد إلكتروني لهذا العميل');
      return;
    }
    const subject = encodeURIComponent(`رد بخصوص رسالتك: ${message.subject}`);
    const body = encodeURIComponent(replyText);
    window.open(`mailto:${message.email}?subject=${subject}&body=${body}`, '_blank');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!message) return (
    <div>
      <div className="page-header"><h2>📧 تفاصيل الرسالة</h2></div>
      <div className="data-table-wrapper" style={{ padding: '1.25rem' }}>
        <p style={{ color: '#64748b' }}>الرسالة غير موجودة أو تم حذفها.</p>
        <Link className="btn btn-outline" to="/contact">العودة إلى الرسائل</Link>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2>📧 تفاصيل الرسالة</h2>
        <button className="btn btn-outline" onClick={() => navigate('/contact')}>
          <ArrowRight size={16} />
          العودة للقائمة
        </button>
      </div>

      <div className="data-table-wrapper" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{message.subject}</h3>
          <span className={`badge ${statusBadge[message.status]}`}>{statusLabels[message.status]}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>الاسم</strong>
            <div>{message.name}</div>
          </div>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>البريد الإلكتروني</strong>
            <div dir="ltr">{message.email}</div>
          </div>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>الهاتف</strong>
            <div dir="ltr">{message.phone || '-'}</div>
          </div>
          <div>
            <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>التاريخ</strong>
            <div>{new Date(message.createdAt).toLocaleString('ar-MA')}</div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>محتوى الرسالة</strong>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {message.message}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ color: '#16a34a' }} onClick={openWhatsAppReply}>
            <MessageCircle size={16} />
            الرد عبر واتساب
          </button>
          <button className="btn btn-outline" style={{ color: '#2563eb' }} onClick={openEmailReply}>
            <Mail size={16} />
            الرد عبر الإيميل
          </button>
        </div>
      </div>
    </div>
  );
}
