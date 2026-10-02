import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function NexoraLogo({ size = 'md', showTagline = false }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Precision Geometric Monogram */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 via-indigo-600/30 to-violet-600/40 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4/5 h-4/5 text-indigo-400"
        >
          {/* Interlocking geometric polygon representing organized multi-tenant structure */}
          <path d="M4 4h4l8 16h4" />
          <path d="M4 20h4L16 4h4" />
          <circle cx="12" cy="12" r="2" fill="#818CF8" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold tracking-wider text-white font-mono ${textSizes[size]}`}>
            NEXORA
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
            B2B
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-gray-400 tracking-tight -mt-0.5">
            Business operations, organized.
          </span>
        )}
      </div>
    </div>
  );
}
