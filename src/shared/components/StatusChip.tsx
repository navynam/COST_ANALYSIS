/**
 * 📊 상태 칩 컴포넌트
 * 
 * @description 상태(정상/경고/오류/이상치)에 따라 색상이 변하는 칩 컴포넌트
 * @author PM 단무지
 * @since 2026-03-30
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { ItemStatus } from '../types/common';
import { STATUS_COLORS } from '../constants/colors';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  /** 상태 타입 */
  status: ItemStatus;
  /** 표시할 텍스트 (기본: 상태명) */
  text?: string;
}

/**
 * 상태별 기본 텍스트
 */
const STATUS_TEXT: Record<ItemStatus, string> = {
  normal: '정상',
  warning: '경고', 
  error: '오류',
  anomaly: '이상치'
};

/**
 * 상태 칩 컴포넌트
 */
export const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  text,
  size = 'small',
  variant = 'outlined',
  ...props 
}) => {
  const colors = STATUS_COLORS[status];
  const displayText = text || STATUS_TEXT[status];
  
  return (
    <Chip
      label={displayText}
      size={size}
      variant={variant}
      sx={{
        bgcolor: variant === 'filled' ? colors.bg : 'transparent',
        borderColor: colors.border,
        color: colors.text,
        fontWeight: 600,
        fontSize: size === 'small' ? 10 : 12,
        ...props.sx
      }}
      {...props}
    />
  );
};

export default StatusChip;