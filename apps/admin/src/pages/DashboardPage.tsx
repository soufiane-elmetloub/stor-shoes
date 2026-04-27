import { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import { Package, ShoppingCart, DollarSign, Users, Clock, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  todayOrders: number;
  todayRevenue: number;
  recentOrders: any[];
  salesChart: { date: string; revenue: number; orders: number }[];
}



export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await reportsApi.getOverview();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const statCards = [
    { label: 'إجمالي الإيرادات', value: `${stats?.totalRevenue?.toLocaleString() || 0} MAD`, icon: DollarSign, color: '#10b981', bg: '#d1fae5' },
    { label: 'إجمالي الطلبات', value: stats?.totalOrders || 0, icon: ShoppingCart, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'المنتجات', value: stats?.totalProducts || 0, icon: Package, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'العملاء', value: stats?.totalCustomers || 0, icon: Users, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'طلبات اليوم', value: stats?.todayOrders || 0, icon: Calendar, color: '#06b6d4', bg: '#cffafe' },
    { label: 'إيرادات اليوم', value: `${stats?.todayRevenue?.toLocaleString() || 0} MAD`, icon: TrendingUp, color: '#10b981', bg: '#d1fae5' },
    { label: 'طلبات معلقة', value: stats?.pendingOrders || 0, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'مخزون منخفض', value: stats?.lowStockProducts || 0, icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
  ];

  return (
    <div>
      <div className="page-header" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#000' }}>لوحة التحكم</h2>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>مرحباً بك في لوحة إدارة StorShoes</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div className="stat-label" style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#475569', margin: 0 }}>{card.label}</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={20} color={card.color} />
              </div>
            </div>
            <div className="stat-value" style={{ fontFamily: "'Inter', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="chart-card" style={{ marginBottom: '1.5rem', fontFamily: "'Inter', sans-serif" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#000' }}>📊 المبيعات (آخر 30 يوم)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats?.salesChart || []}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', direction: 'rtl' }}
              formatter={(value: any) => [`${Number(value).toLocaleString()} MAD`, 'الإيرادات']}
              labelFormatter={(label) => `التاريخ: ${label}`}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>


    </div>
  );
}
