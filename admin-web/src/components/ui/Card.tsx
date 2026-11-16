import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#F0E5E8] p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0E5E8]">
          <div>
            {title && <h3 className="text-base font-bold text-[#252225]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#777277] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  helpText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  change,
  isPositive,
  helpText,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E5E8] p-5 shadow-sm hover:border-[#E98A9A]/50 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#777277]">{label}</span>
        <div className="w-10 h-10 rounded-xl bg-[#FCE7EC] flex items-center justify-center text-[#C95F72]">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-[#252225] tracking-tight">{value}</div>
        {(change || helpText) && (
          <div className="flex items-center gap-2 mt-1">
            {change && (
              <span
                className={`text-xs font-semibold ${
                  isPositive ? 'text-[#4FA982]' : 'text-[#D95C68]'
                }`}
              >
                {isPositive ? '↑' : '↓'} {change}
              </span>
            )}
            {helpText && <span className="text-xs text-[#777277]">{helpText}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
