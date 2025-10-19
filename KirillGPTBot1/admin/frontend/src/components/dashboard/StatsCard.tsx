import React from 'react';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  loading?: boolean;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
  className,
}) => {
  return (
    <div className={cn('card', className)}>
      <div className="card-body">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <div className="mt-1">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {trend && !loading && (
          <div className="mt-4">
            <div className="flex items-center">
              <span
                className={cn(
                  'inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium',
                  trend.positive
                    ? 'bg-success-100 text-success-800'
                    : 'bg-danger-100 text-danger-800'
                )}
              >
                <svg
                  className={cn(
                    '-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5',
                    trend.positive ? 'text-success-500' : 'text-danger-500'
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d={
                      trend.positive
                        ? 'M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z'
                        : 'M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z'
                    }
                    clipRule="evenodd"
                  />
                </svg>
                <span>{Math.abs(trend.value)}%</span>
              </span>
              <span className="ml-2 text-sm text-gray-500">{trend.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};