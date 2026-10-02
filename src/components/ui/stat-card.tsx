import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  total?: string | number;
  unit?: string;
  percentage?: number;
  icon: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'sky';
}

export function StatCard({
  label,
  value,
  total,
  unit = '',
  percentage,
  icon,
  subtitle,
  badge,
  color = 'indigo',
}: StatCardProps) {
  const colorMap = {
    indigo: {
      bar: 'bg-indigo-500',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    emerald: {
      bar: 'bg-emerald-500',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    amber: {
      bar: 'bg-amber-500',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    sky: {
      bar: 'bg-sky-500',
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
  };

  const selectedColor = colorMap[color];

  return (
    <div className="relative p-5 rounded-xl bg-[#11131C] border border-[#232638] hover:border-[#2F344D] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider font-mono">
          {label}
        </span>
        <div className={`p-2 rounded-lg border ${selectedColor.iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
          {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
        </span>
        {total !== undefined && (
          <span className="text-xs font-mono text-gray-500">
            / {total} {unit}
          </span>
        )}
        {badge && <div className="ml-auto">{badge}</div>}
      </div>

      {percentage !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
            <span>Quota utilization</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1B1D2B] rounded-full overflow-hidden">
            <div
              className={`h-full ${selectedColor.bar} transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && (
        <p className="mt-2.5 text-xs text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
