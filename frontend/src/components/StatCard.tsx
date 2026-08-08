import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: string | number;
  delta: number;
  deltaSuffix?: string;
  icon?: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, delta, deltaSuffix = '', icon: Icon }) => {
  const { t } = useTranslation();
  const parsedDelta = Number(delta);
  const validDelta = isNaN(parsedDelta) || parsedDelta === null ? 0 : parsedDelta;
  const isPositive = validDelta >= 0;
  const displayValue = (String(value).includes('NaN') || String(value).includes('null') || String(value).includes('undefined')) ? '0' : value;

  return (
    <div className="rounded-2xl p-5 flex flex-col transition-shadow hover:shadow-md"
      style={{
        background: '#ffffff',
        border: '1px solid var(--slate-100)',
        boxShadow: '0 1px 4px rgba(2, 132, 199, 0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--slate-400)' }}>
          {label}
        </div>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--brand-50)', color: 'var(--brand-500)' }}>
            <Icon size={15} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
        {displayValue}
      </div>
      <div className={`text-xs mt-2 font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{Math.abs(validDelta)}{deltaSuffix} {t('dashboard.thisWeek', 'this week')}</span>
      </div>
    </div>
  );
};
