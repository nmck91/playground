/**
 * Contract Badge Component
 * Displays contract status with color coding
 */

'use client';

import { Badge, BadgeProps } from './Badge';
import { ContractStatus } from '@playground/football-director-engine';

export interface ContractBadgeProps {
  status: ContractStatus;
  weeksRemaining: number;
}

export function ContractBadge({ status, weeksRemaining }: ContractBadgeProps) {
  const config: Record<ContractStatus, BadgeProps['variant']> = {
    'active': 'success',
    'expiring-soon': 'warning',
    'expiring': 'danger',
    'expired': 'danger',
  };

  const weeks = weeksRemaining;
  const years = Math.floor(weeks / 52);

  const text = status === 'expired'
    ? 'Expired'
    : years > 0
      ? `${years}y ${weeks % 52}w`
      : `${weeks}w`;

  return <Badge variant={config[status]} size="sm">{text}</Badge>;
}
