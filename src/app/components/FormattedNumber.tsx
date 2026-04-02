import React from 'react';
import { formatNumber, formatFullNumber } from '../utils/format';

interface FormattedNumberProps {
  value: number | string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const FormattedNumber: React.FC<FormattedNumberProps> = ({ 
  value, 
  className = "", 
  prefix = "", 
  suffix = "" 
}) => {
  const formatted = formatNumber(value);
  const full = formatFullNumber(value);

  return (
    <span 
      className={`cursor-help ${className}`} 
      title={`${prefix}${full}${suffix}`}
      aria-label={`${prefix}${full}${suffix}`}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
};
