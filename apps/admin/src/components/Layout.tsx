import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, API_STATUS_EVENT, systemApi } from '../services/api';
import Header from './Header';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  FolderOpen, BarChart3, TrendingUp, Mail, Palette, LogOut,
  LineChart, ArchiveRestore, Menu
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/products', label: 'المنتجات', icon: Package },
  { path: '/orders', label: 'الطلبات', icon: ShoppingCart },
  { path: '/inventory', label: 'المخزون', icon: Warehouse },
  { path: '/archive', label: 'الأرشيف', icon: ArchiveRestore },
  { path: '/categories', label: 'التصنيفات', icon: FolderOpen },
  { path: '/sales', label: 'المبيعات', icon: TrendingUp },
  { path: '/reports', label: 'التقارير', icon: BarChart3 },
  { path: '/contact', label: 'رسائل العملاء', icon: Mail },
  { path: '/analytics', label: 'الزيارات والتحليلات', icon: LineChart },
  { path: '/settings', label: 'إدارة الواجهة', icon: Palette },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [apiOnline, setApiOnline] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebar-collapsed', String(newVal));
      return newVal;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        await systemApi.health();
        if (mounted) setApiOnline(true);
      } catch {
        if (mounted) setApiOnline(false);
      }
    };

    const onStatusEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ online: boolean }>;
      if (typeof customEvent.detail?.online === 'boolean') {
        setApiOnline(customEvent.detail.online);
      }
    };

    checkHealth();
    const intervalId = window.setInterval(checkHealth, 15000);
    window.addEventListener(API_STATUS_EVENT, onStatusEvent as EventListener);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener(API_STATUS_EVENT, onStatusEvent as EventListener);
    };
  }, []);

  return (
    <div className={isCollapsed ? 'sidebar-collapsed' : ''} style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: isCollapsed ? '80px' : '260px', transition: 'width 0.3s ease', overflowX: 'hidden' }}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '1.5rem 0' : '0 1.5rem 1.5rem' }}>
          {!isCollapsed && (
            <div>
              <h1>👟 StorShoes</h1>
              <p>لوحة الإدارة</p>
            </div>
          )}
          <button onClick={toggleCollapse} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="توسيع / طي">
            <Menu size={24} color={isCollapsed ? '#ffffff' : '#94a3b8'} />
          </button>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem', padding: isCollapsed ? '0 0.5rem' : '0 0.75rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem' }}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} style={{ minWidth: '20px' }} />
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Admin Info */}
        <div style={{ padding: isCollapsed ? '1rem 0' : '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #333333, #000000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }} title={isCollapsed ? admin?.name : undefined}>
              {admin?.name?.[0] || 'A'}
            </div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.825rem', color: 'white', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{admin?.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{admin?.email}</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem' }}
            title={isCollapsed ? 'تسجيل الخروج' : undefined}
          >
            <LogOut size={18} style={{ minWidth: '18px' }} />
            {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ transition: 'margin-left 0.3s ease' }}>
        <Header />
        <div className="main-content-inner">
          {!apiOnline && (
            <div
              style={{
                marginBottom: '1rem',
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              الخادم غير متصل حالياً ({API_BASE_URL}). شغّل خدمة الـ API ثم أعد المحاولة.
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
