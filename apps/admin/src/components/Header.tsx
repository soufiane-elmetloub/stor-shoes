import { useEffect, useState, useRef } from 'react';
import { MessageSquare, ShoppingCart, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { reportsApi, contactMessagesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [newMessages, setNewMessages] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [overviewRes, statsRes] = await Promise.all([
        reportsApi.getOverview().catch(() => ({ data: { pendingOrders: 0 } })),
        contactMessagesApi.getStats().catch(() => ({ data: { data: { new: 0 } } }))
      ]);
      
      if (location.pathname !== '/orders') {
        setPendingOrders(overviewRes.data?.pendingOrders || 0);
      }
      
      if (location.pathname !== '/contact') {
        setNewMessages(statsRes.data?.data?.new || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Clear notification badges if currently on their respective pages
  useEffect(() => {
    if (location.pathname === '/orders') {
      setPendingOrders(0);
    }
    if (location.pathname === '/contact') {
      setNewMessages(0);
    }
  }, [location.pathname, pendingOrders, newMessages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        
        {/* Messages Notification */}
        <div 
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', transition: 'background-color 0.2s' }} 
          onClick={() => navigate('/contact')} 
          title="رسائل العملاء"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
        >
          <MessageSquare size={20} color="#475569" />
          {newMessages > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {newMessages > 9 ? '9+' : newMessages}
            </span>
          )}
        </div>

        {/* Orders Notification */}
        <div 
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', transition: 'background-color 0.2s' }} 
          onClick={() => navigate('/orders')} 
          title="الطلبات المعلقة"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
        >
          <ShoppingCart size={20} color="#475569" />
          {pendingOrders > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {pendingOrders > 9 ? '9+' : pendingOrders}
            </span>
          )}
        </div>

        {/* User Avatar Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #0f172a, #334155)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontSize: '1rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              transform: isDropdownOpen ? 'scale(1.05)' : 'scale(1)'
            }} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="حسابي"
          >
            {admin?.name?.[0]?.toUpperCase() || 'A'}
          </div>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: '240px',
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <p style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '0.9rem' }}>{admin?.name || 'مدير المتجر'}</p>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.25rem 0 0 0', wordBreak: 'break-all' }}>{admin?.email || 'admin@storshoes.com'}</p>
              </div>
              <div style={{ padding: '0.5rem' }}>
                <button 
                  onClick={() => { setIsDropdownOpen(false); navigate('/settings'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem',
                    border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '0.5rem',
                    color: '#334155', fontSize: '0.875rem', textAlign: 'right', transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={16} />
                  <span>الإعدادات</span>
                </button>
                <button 
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem',
                    border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '0.5rem',
                    color: '#ef4444', fontSize: '0.875rem', textAlign: 'right', transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
