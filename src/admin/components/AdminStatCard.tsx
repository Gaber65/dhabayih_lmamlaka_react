import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorScheme?: 'primary' | 'blue' | 'amber' | 'emerald' | 'purple';
  onClick?: () => void;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'primary',
  onClick,
}) => {
  const colorMap = {
    primary: {
      bg: 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400',
      border: 'hover:border-brand-500/50',
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-500/50',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-500/50',
    },
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-500/50',
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-500/50',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.primary;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + scheme.border : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${scheme.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 dark:text-slate-400 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`font-bold inline-flex items-center gap-0.5 ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
