/**
 * 상태 배지 컴포넌트 (분석 페이지용)
 *
 * shared/components/StatusChip을 기반으로 분석 페이지의
 * '정상/이상치' 두 가지 상태를 간결하게 표시합니다.
 *
 * @example
 *   <StatusBadge status="normal" />   // → 정상
 *   <StatusBadge status="anomaly" />  // → 이상치
 */
import React from 'react';
import StatusChip from '../../../shared/components/StatusChip';

interface StatusBadgeProps {
  status: 'normal' | 'anomaly';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <StatusChip status={status} variant="filled" />
);

export default StatusBadge;
