import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionDisabled?: boolean;
  disabledReason?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  actionDisabled = false,
  disabledReason,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#232638] bg-[#11131C]/50 my-4">
      <div className="p-3.5 mb-4 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
      <p className="mt-1.5 text-xs text-gray-400 max-w-sm leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <div className="mt-5 flex flex-col items-center gap-1.5">
          <Button
            size="sm"
            onClick={onAction}
            icon={actionIcon}
            disabled={actionDisabled}
            title={disabledReason}
          >
            {actionLabel}
          </Button>
          {actionDisabled && disabledReason && (
            <span className="text-[11px] text-amber-400/80 font-mono">
              {disabledReason}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
