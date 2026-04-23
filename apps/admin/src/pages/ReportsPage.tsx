import { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getImageUrl } from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16', '#a855f7', '#14b8a6'];

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => { loadReport(); }, [period]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const dateFrom = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await reportsApi.getSales({ dateFrom });
      setReport(data);
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2>📊 التقارير والإحصائيات</h2>
        <select className="form-input" style={{ width: 'auto' }} value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7">آخر 7 أيام</option>
          <option value="30">آخر 30 يوم</option>
          <option value="90">آخر 3 أشهر</option>
          <option value="365">آخر سنة</option>
        </select>
      </div>

      {/* Summary Cards - Horizontal Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Total Revenue */}
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '1rem', padding: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            💰
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>إجمالي الإيرادات</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {report?.totalRevenue?.toLocaleString() || 0} <span style={{ fontSize: '1rem', fontWeight: 500 }}>MAD</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '1rem', padding: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            📦
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>عدد الطلبات</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {report?.totalOrders || 0}
            </div>
          </div>
        </div>

        {/* Average Order */}
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '1rem', padding: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.3)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            📈
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>متوسط قيمة الطلب</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {Math.round(report?.averageOrderValue || 0).toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500 }}>MAD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="chart-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>🏆 أكثر المنتجات مبيعاً</h3>
          {report?.topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.topProducts.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', direction: 'rtl' }}
                  formatter={(value: number) => [`${value.toLocaleString()} MAD`, 'الإيرادات']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>لا توجد بيانات</p>}
        </div>

        <div className="chart-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>📊 توزيع المبيعات</h3>
          {report?.topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={report.topProducts.slice(0, 6)} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name.substring(0, 12)}.. ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {report.topProducts.slice(0, 6).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} MAD`, 'الإيرادات']} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>لا توجد بيانات</p>}
        </div>
      </div>

      {/* Top Products Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>📋 تفاصيل أعلى المنتجات مبيعاً</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>المنتج</th><th>الكمية المباعة</th><th>الإيرادات</th></tr>
          </thead>
          <tbody>
            {report?.topProducts?.map((p: any, i: number) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {p.imageUrl ? (
                      <img
                        src={getImageUrl(p.imageUrl)}
                        alt={p.name}
                        style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 8,
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: '0.7rem',
                        }}
                      >
                        لا صورة
                      </div>
                    )}
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </td>
                <td>{p.quantity}</td>
                <td style={{ fontWeight: 600, color: '#10b981' }}>{p.revenue.toLocaleString()} MAD</td>
              </tr>
            )) || <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>لا توجد بيانات</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
