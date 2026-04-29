import { useState, useEffect } from 'react';
import {
  Eye, MousePointer, ShoppingCart, TrendingUp,
  Link2, ArrowRightLeft, Package,
  Calendar, Download, Target, Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsApi, getImageUrl } from '../services/api';

// Real data from API
interface VisitStats {
  totalVisits: number;
  visitsChange: number;
  uniqueVisitors: number;
  uniqueChange: number;
  todayVisits: number;
  todayChange: number;
  conversionRate: number;
  conversionRateChange: number;
  totalConversions: number;
  conversionsChange: number;
}

interface UTMData {
  source: string;
  medium: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

interface ProductView {
  productId: string;
  productName: string;
  views: number;
  purchases: number;
  conversionRate: number;
  image?: string;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  // Real data states from API
  const [stats, setStats] = useState<VisitStats>({
    totalVisits: 0,
    visitsChange: 0,
    uniqueVisitors: 0,
    uniqueChange: 0,
    todayVisits: 0,
    todayChange: 0,
    conversionRate: 0,
    conversionRateChange: 0,
    totalConversions: 0,
    conversionsChange: 0,
  });

  const [utmSources, setUtmSources] = useState<UTMData[]>([]);
  const [topViewedProducts, setTopViewedProducts] = useState<ProductView[]>([]);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      
      const [statsRes, utmRes, productsRes] = await Promise.all([
        analyticsApi.getStats(days),
        analyticsApi.getUtmSources(days),
        analyticsApi.getTopProducts(10),
      ]);

      setStats(statsRes.data);
      setUtmSources(utmRes.data);
      setTopViewedProducts(productsRes.data);
    } catch (error) {
      toast.error('فشل تحميل بيانات التحليلات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('جاري تصدير التقرير...');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>📊 تحليلات الزيارات</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            تتبع التحويلات، مصادر الزيارات، والمنتجات الأكثر مشاهدة
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Date Range Filter */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.25rem' }}>
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: dateRange === range ? '#fff' : 'transparent',
                  color: dateRange === range ? '#1e293b' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  boxShadow: dateRange === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {range === '7d' ? '7 أيام' : range === '30d' ? '30 يوم' : '90 يوم'}
              </button>
            ))}
          </div>
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={18} />
            تصدير
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard
          icon={Eye}
          label="إجمالي الزيارات"
          value={stats.totalVisits.toLocaleString()}
          change={`${stats.visitsChange > 0 ? '+' : ''}${stats.visitsChange}%`}
          positive={stats.visitsChange >= 0}
          color="#3b82f6"
        />
        <StatCard
          icon={MousePointer}
          label="زوار فريدون"
          value={stats.uniqueVisitors.toLocaleString()}
          change={`${stats.uniqueChange > 0 ? '+' : ''}${stats.uniqueChange}%`}
          positive={stats.uniqueChange >= 0}
          color="#8b5cf6"
        />
        <StatCard
          icon={ShoppingCart}
          label="التحويلات الكلية"
          value={stats.totalConversions.toLocaleString()}
          change={`${stats.conversionsChange > 0 ? '+' : ''}${stats.conversionsChange}%`}
          positive={stats.conversionsChange >= 0}
          color="#10b981"
        />
        <StatCard
          icon={Percent}
          label="معدل التحويل"
          value={`${stats.conversionRate}%`}
          change={`${stats.conversionRateChange > 0 ? '+' : ''}${stats.conversionRateChange}%`}
          positive={stats.conversionRateChange >= 0}
          color="#f59e0b"
        />
        <StatCard
          icon={Calendar}
          label="زيارات اليوم"
          value={stats.todayVisits.toLocaleString()}
          change={`${stats.todayChange > 0 ? '+' : ''}${stats.todayChange}%`}
          positive={stats.todayChange >= 0}
          color="#ef4444"
        />
      </div>

      {/* UTM Tracking Section - Instagram Focus */}
      <div className="data-table-wrapper" style={{ marginBottom: '1.5rem' }}>
        <div className="data-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', borderRadius: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </div>
            <div>
              <h3>📱 تتبع UTM - إنستغرام</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                كم شخصاً ضغط على رابط الإنستغرام؟ وكم منهم اشترى فعلياً؟
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Instagram Stats Highlight - Using Real Data */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {(() => {
              const instagramData = utmSources.filter(u => u.source?.includes('instagram'));
              const totalClicks = instagramData.reduce((sum, u) => sum + (u.clicks || 0), 0);
              const totalConvs = instagramData.reduce((sum, u) => sum + (u.conversions || 0), 0);
              const avgRate = totalClicks > 0 ? ((totalConvs / totalClicks) * 100).toFixed(1) : '0';
              
              return (
                <>
                  <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '1rem', border: '1px solid #fcd34d' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Link2 size={18} color="#d97706" />
                      <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 500 }}>نقرات رابط Bio</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#92400e' }}>{totalClicks.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.25rem' }}>من إنستغرام بروفايل</div>
                  </div>

                  <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', borderRadius: '1rem', border: '1px solid #86efac' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <ShoppingCart size={18} color="#16a34a" />
                      <span style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 500 }}>مشتريات من الإنستغرام</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#166534' }}>{totalConvs.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>عميل اشتروا بعد النقر</div>
                  </div>

                  <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: '1rem', border: '1px solid #93c5fd' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Target size={18} color="#1d4ed8" />
                      <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 500 }}>معدل التحويل</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e40af' }}>{avgRate}%</div>
                    <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '0.25rem' }}>أعلى من المتوسط</div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* UTM Sources Table */}
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>📊 جميع مصادر التتبع</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>المصدر</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>المتوسط</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>النقرات</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>الشراء</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>التحويل</th>
                </tr>
              </thead>
              <tbody>
                {utmSources.map((utm, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: utm.source.includes('instagram') ? '#fce7f3' : utm.source.includes('facebook') ? '#dbeafe' : '#dcfce7',
                          color: utm.source.includes('instagram') ? '#be185d' : utm.source.includes('facebook') ? '#1d4ed8' : '#16a34a',
                        }}>
                          {utm.source === 'instagram_bio' ? 'إنستغرام Bio' :
                           utm.source === 'instagram_story' ? 'ستوري' :
                           utm.source === 'facebook' ? 'فيسبوك' :
                           utm.source === 'whatsapp' ? 'واتساب' : utm.source}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{utm.medium}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <ArrowRightLeft size={14} color="#64748b" />
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                      {utm.clicks.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#10b981' }}>
                      {utm.conversions.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: utm.conversionRate >= 4 ? '#dcfce7' : utm.conversionRate >= 2 ? '#fef3c7' : '#fee2e2',
                        color: utm.conversionRate >= 4 ? '#16a34a' : utm.conversionRate >= 2 ? '#d97706' : '#dc2626',
                      }}>
                        {utm.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Most Viewed Products */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
              <Package size={20} color="#d97706" />
            </div>
            <div>
              <h3>👟 المنتجات الأكثر مشاهدة</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                منتجات يتم النقر عليها كثيراً ولكن لا يتم شراؤها - فرص للتخفيض
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {topViewedProducts.map((product) => {
              const needsDiscount = product.conversionRate < 1;
              return (
                <div
                  key={product.productId}
                  style={{
                    padding: '1.25rem',
                    background: needsDiscount ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                    borderRadius: '1rem',
                    border: `1px solid ${needsDiscount ? '#fecaca' : '#f1f5f9'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '0.75rem',
                      background: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {product.image ? (
                        <img 
                          src={getImageUrl(product.image)} 
                          alt={product.productName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <Package size={24} color="#94a3b8" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.productName}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {product.productId}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(59,130,246,0.1)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: '0.25rem' }}>المشاهدات</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#3b82f6' }}>{product.views}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '0.25rem' }}>الشراء</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{product.purchases}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.25rem' }}>التحويل</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>{product.conversionRate}%</div>
                    </div>
                  </div>

                  {needsDiscount && (
                    <div style={{
                      padding: '0.75rem',
                      background: '#fef2f2',
                      borderRadius: '0.5rem',
                      border: '1px solid #fecaca',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <TrendingUp size={16} color="#dc2626" />
                      <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>
                        ⚠️ يحتاج تخفيض السعر أو تغيير الصور
                      </span>
                    </div>
                  )}

                  {!needsDiscount && product.conversionRate >= 2 && (
                    <div style={{
                      padding: '0.75rem',
                      background: '#dcfce7',
                      borderRadius: '0.5rem',
                      border: '1px solid #86efac',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <TrendingUp size={16} color="#16a34a" />
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}>
                        ✅ أداء ممتاز، يمكن زيادة المخزون
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  color: string;
}

function StatCard({ icon: Icon, label, value, change, positive, color }: StatCardProps) {
  return (
    <div style={{
      padding: '1.25rem',
      background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
      borderRadius: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid #f1f5f9',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{
          padding: '0.5rem',
          background: `${color}20`,
          borderRadius: '0.5rem',
        }}>
          <Icon size={20} color={color} />
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: positive ? '#16a34a' : '#dc2626',
          background: positive ? '#dcfce7' : '#fee2e2',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.375rem',
        }}>
          {change}
        </span>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
        {label}
      </div>
    </div>
  );
}
