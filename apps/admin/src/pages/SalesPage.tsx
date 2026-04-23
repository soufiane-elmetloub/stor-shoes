import { useState, useEffect, useCallback } from 'react';
import { reportsApi } from '../services/api';
import {
  TrendingUp, DollarSign, ShoppingCart,
  Calendar, Target, Package, CreditCard,
  ArrowUpRight, ArrowDownRight, Download
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];

interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

interface PaymentMethod {
  method: string;
  count: number;
  amount: number;
}

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  yesterdayRevenue: number;
  yesterdayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
  growthRate: number;
  topProducts: TopProduct[];
  salesByCategory: { name: string; revenue: number }[];
  dailySales: DailySale[];
  paymentMethods: PaymentMethod[];
}

const periodOptions = [
  { value: '7', label: 'آخر 7 أيام' },
  { value: '30', label: 'آخر 30 يوم' },
  { value: '90', label: 'آخر 3 أشهر' },
  { value: '365', label: 'آخر سنة' },
];

export default function SalesPage() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [salesTarget, setSalesTarget] = useState(100000);
  const [targetInput, setTargetInput] = useState('100000');

  const loadSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const dateFrom = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await reportsApi.getSales({ dateFrom });

      // Calculate additional metrics
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const todayData = data.dailySales?.find((d: DailySale) => d.date === today) || { revenue: 0, orders: 0 };
      const yesterdayData = data.dailySales?.find((d: DailySale) => d.date === yesterday) || { revenue: 0, orders: 0 };

      const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      interface AccData { revenue: number; orders: number }

      const weekData = data.dailySales?.filter((d: DailySale) => d.date >= weekStart.split('T')[0])
        .reduce((acc: AccData, curr: DailySale) => ({ revenue: acc.revenue + curr.revenue, orders: acc.orders + curr.orders }), { revenue: 0, orders: 0 });

      const monthData = data.dailySales?.filter((d: DailySale) => d.date >= monthStart.split('T')[0])
        .reduce((acc: AccData, curr: DailySale) => ({ revenue: acc.revenue + curr.revenue, orders: acc.orders + curr.orders }), { revenue: 0, orders: 0 });

      const growthRate = yesterdayData.revenue > 0
        ? ((todayData.revenue - yesterdayData.revenue) / yesterdayData.revenue) * 100
        : 0;

      setStats({
        ...data,
        todayRevenue: todayData.revenue,
        todayOrders: todayData.orders,
        yesterdayRevenue: yesterdayData.revenue,
        yesterdayOrders: yesterdayData.orders,
        weekRevenue: weekData?.revenue || 0,
        weekOrders: weekData?.orders || 0,
        monthRevenue: monthData?.revenue || 0,
        monthOrders: monthData?.orders || 0,
        growthRate,
      });
    } catch {
      toast.error('فشل تحميل بيانات المبيعات');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  const handleTargetUpdate = () => {
    const newTarget = parseInt(targetInput);
    if (newTarget > 0) {
      setSalesTarget(newTarget);
      toast.success('تم تحديث هدف المبيعات');
    }
  };

  const exportData = () => {
    const data = {
      period: periodOptions.find(p => p.value === period)?.label,
      stats: stats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('تم تصدير التقرير');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const targetProgress = Math.min((stats?.monthRevenue || 0) / salesTarget * 100, 100);

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>📈 إدارة المبيعات</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            متابعة وتحليل أداء المبيعات والإيرادات
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-input"
            style={{ width: 'auto' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="اختيار الفترة الزمنية"
          >
            {periodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button className="btn btn-outline" onClick={exportData}>
            <Download size={18} />
            تصدير
          </button>
        </div>
      </div>

      {/* KPI Cards - Elegant Design */}
      {/* Row 1: Main KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Today's Sales */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '1.25rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 30px -5px rgba(59, 130, 246, 0.35)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>مبيعات اليوم</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                {stats?.todayRevenue?.toLocaleString() || 0}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, marginRight: '0.25rem' }}>MAD</span>
              </div>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={26} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.8rem', background: stats?.growthRate >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', padding: '0.35rem 0.75rem', borderRadius: '2rem', width: 'fit-content' }}>
            {stats?.growthRate >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(stats?.growthRate || 0).toFixed(1)}% عن الأمس
          </div>
        </div>

        {/* Today's Orders */}
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '1.25rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.35)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>طلبات اليوم</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                {stats?.todayOrders || 0}
              </div>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={26} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '1rem' }}>
            متوسط: {stats?.todayOrders > 0 ? Math.round(stats?.todayRevenue / stats?.todayOrders) : 0} MAD
          </div>
        </div>

        {/* Weekly Sales */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '1.25rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 30px -5px rgba(245, 158, 11, 0.35)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>مبيعات الأسبوع</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                {stats?.weekRevenue?.toLocaleString() || 0}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, marginRight: '0.25rem' }}>MAD</span>
              </div>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={26} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '1rem' }}>
            {stats?.weekOrders || 0} طلب
          </div>
        </div>
      </div>

      {/* Row 2: Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Monthly Sales */}
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '1.25rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.35)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>مبيعات الشهر</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                {stats?.monthRevenue?.toLocaleString() || 0}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, marginRight: '0.25rem' }}>MAD</span>
              </div>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={26} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '1rem' }}>
            {stats?.monthOrders || 0} طلب
          </div>
        </div>

        {/* Average Order Value */}
        <div style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', borderRadius: '1.25rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 30px -5px rgba(6, 182, 212, 0.35)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>متوسط قيمة الطلب</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                {Math.round(stats?.averageOrderValue || 0).toLocaleString()}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, marginRight: '0.25rem' }}>MAD</span>
              </div>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={26} />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', borderRadius: '1.25rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 30px -5px rgba(244, 63, 94, 0.35)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>إجمالي الإيرادات</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                {stats?.totalRevenue?.toLocaleString() || 0}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, marginRight: '0.25rem' }}>MAD</span>
              </div>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={26} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '1rem' }}>
            {stats?.totalOrders || 0} طلب
          </div>
        </div>
      </div>

      {/* Sales Target & Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Sales Target Card */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="#3b82f6" />
            هدف المبيعات الشهري
          </h3>

          {/* Circular Progress */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `conic-gradient(#3b82f6 ${targetProgress * 3.6}deg, #e2e8f0 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                  {targetProgress.toFixed(0)}%
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>من الهدف</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>تم تحقيقه</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
              {stats?.monthRevenue?.toLocaleString() || 0} MAD
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>من {salesTarget.toLocaleString()} MAD</div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>
              تحديث الهدف:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                className="form-input"
                style={{ flex: 1, fontSize: '0.875rem' }}
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="100000"
              />
              <button className="btn btn-primary" style={{ padding: '0.5rem 0.75rem' }} onClick={handleTargetUpdate}>
                تحديث
              </button>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart */}
        <div className="chart-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            📊 اتجاه المبيعات
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.dailySales || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  const date = new Date(v);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', direction: 'rtl' }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `${value.toLocaleString()} MAD` : value,
                  name === 'revenue' ? 'الإيرادات' : 'الطلبات'
                ]}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                name="revenue"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorOrders)"
                name="orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Top Products & Payment Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Top Products */}
        <div className="chart-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            🏆 أكثر المنتجات مبيعاً
          </h3>
          {stats?.topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.topProducts.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={150} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', direction: 'rtl' }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} MAD`,
                    'الإيرادات'
                  ]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>لا توجد بيانات</p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="chart-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            💳 طرق الدفع
          </h3>
          {stats?.paymentMethods?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={stats.paymentMethods}
                    dataKey="amount"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    labelLine={false}
                  >
                    {stats.paymentMethods.map((_pm: PaymentMethod, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', direction: 'rtl' }}
                    formatter={(value: number) => [`${value.toLocaleString()} MAD`, 'المبلغ']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '1rem' }}>
                {stats.paymentMethods.map((method: PaymentMethod, i: number) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: i < stats.paymentMethods.length - 1 ? '1px solid #e2e8f0' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: COLORS[i % COLORS.length]
                      }} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {method.method === 'COD' ? 'الدفع عند الاستلام' : method.method}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {method.amount.toLocaleString()} MAD
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>لا توجد بيانات</p>
          )}
        </div>
      </div>
    </div>
  );
}
