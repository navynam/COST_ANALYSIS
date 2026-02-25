/**
 * @fileoverview 상태 뱃지 컴포넌트
 * @description 견적서 상태(완료, 검증중, 이상치 등)를 Chip으로 표시
 */
import React from 'react';
import { Chip, ChipProps } from '@mui/material';

/** 상태별 색상 매핑 */
const STATUS_COLOR_MAP: Record<string, ChipProps['color']> = {
  '완료': 'success',
  '검증중': 'info',
  '이상치': 'error',
  '경고': 'warning',
  parsed: 'success',
  parsing: 'warning',
  failed: 'error',
  uploading: 'info',
  auto_mapped: 'success',
  needs_review: 'warning',
  manual: 'error',
};

interface StatusBadgeProps {
  /** 상태 문자열 */
  status: string;
  /** 표시할 라벨 (미지정시 status 사용) */
  label?: string;
  /** Chip 크기 */
  size?: 'small' | 'medium';
  /** Chip 아이콘 */
  icon?: React.ReactElement;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'small',
  icon,
}) => (
  <Chip
    label={label || status}
    color={STATUS_COLOR_MAP[status] || 'default'}
    size={size}
    icon={icon}
  />
);

export default StatusBadge;
