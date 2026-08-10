import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FollowerGrowthChart, EngagementChart } from './Charts';
import { Users, Eye, ArrowUp, Calendar } from 'lucide-react';

interface DashboardReportProps {
  summary: any;
  growth: any[];
  engagement: any[];
}

export const DashboardReport = forwardRef<HTMLDivElement, DashboardReportProps>(({ summary, growth, engagement }, ref) => {
  const { t, i18n } = useTranslation();
  
  const today = new Date().toLocaleDateString(i18n.language.startsWith('mr') ? 'mr-IN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      ref={ref} 
      className="bg-white p-10 mx-auto text-slate-900"
      style={{
        width: '794px', // A4 width at 96 DPI
        minHeight: '1123px', // A4 height at 96 DPI
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#1877f2' }}>
            {t('dashboard.report.monthlyPerformance', 'Monthly Performance Report')}
          </h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Social Media Analytics</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <Calendar size={18} className="text-slate-400" />
          <p className="text-xs font-medium text-slate-500">
            {t('dashboard.report.generatedOn', 'Generated on')} {today}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-400">
        {t('dashboard.report.overview', 'Overview Statistics')}
      </h2>
      
      {summary && (
        <div className="grid grid-cols-3 gap-6 mb-10">
          {/* Followers */}
          <div className="bg-[#f0f2f5] p-5 rounded-2xl border border-[#ced0d4]">
            <div className="flex items-center gap-2 mb-3 text-[#1877f2]">
              <Users size={20} />
              <span className="font-bold text-sm">{t('dashboard.stats.totalFollowers', 'Total Followers')}</span>
            </div>
            <div className="text-3xl font-black mb-1">{(summary.totalFollowers || 0).toLocaleString(i18n.language.startsWith('mr') ? 'mr-IN' : 'en-US')}</div>
            <div className="text-xs font-bold text-[#2abba7] flex items-center gap-1">
              <ArrowUp size={12} /> {summary.followerGrowth || 0}% {t('dashboard.stats.thisMonth', 'This Month')}
            </div>
          </div>

          {/* Reach */}
          <div className="bg-[#f0f2f5] p-5 rounded-2xl border border-[#ced0d4]">
            <div className="flex items-center gap-2 mb-3 text-[#f02849]">
              <Eye size={20} />
              <span className="font-bold text-sm">{t('dashboard.stats.totalReach', 'Total Reach')}</span>
            </div>
            <div className="text-3xl font-black mb-1">{(summary.totalReach || 0).toLocaleString(i18n.language.startsWith('mr') ? 'mr-IN' : 'en-US')}</div>
            <div className="text-xs font-bold text-[#2abba7] flex items-center gap-1">
              <ArrowUp size={12} /> {summary.reachGrowth || 0}% {t('dashboard.stats.thisMonth', 'This Month')}
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-[#f0f2f5] p-5 rounded-2xl border border-[#ced0d4]">
            <div className="flex items-center gap-2 mb-3 text-[#00c3f3]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span className="font-bold text-sm">{t('dashboard.stats.avgEngagement', 'Avg. Engagement')}</span>
            </div>
            <div className="text-3xl font-black mb-1">{summary.avgEngagement || 0}%</div>
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
               {t('dashboard.stats.thisMonth', 'This Month')}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-400">
            {t('dashboard.report.growth', 'Audience Growth')}
          </h2>
          <div className="border border-slate-200 rounded-2xl overflow-hidden p-2">
            {growth.length > 0 && <FollowerGrowthChart data={growth} />}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-400">
            {t('dashboard.report.engagement', 'Engagement Trends')}
          </h2>
          <div className="border border-slate-200 rounded-2xl overflow-hidden p-2">
            {engagement.length > 0 && <EngagementChart data={engagement} />}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-16 text-center text-xs text-slate-400 font-medium pb-10">
        Generated by Antigravity Social Manager
      </div>
    </div>
  );
});

DashboardReport.displayName = 'DashboardReport';
