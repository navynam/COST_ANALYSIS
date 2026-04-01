/**
 * 📈 신뢰도 바 컴포넌트
 * 
 * @description AI 파싱 신뢰도를 시각적으로 표시하는 프로그레스 바
 * @author PM 단무지  
 * @since 2026-03-30
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { getConfidenceColor } from '../utils/format';

interface ConfidenceBarProps {
  /** 신뢰도 값 (0-100) */
  value: number;
  /** 바 너비 (기본: 60px) */
  width?: number;
  /** 바 높이 (기본: 6px) */
  height?: number;
  /** 텍스트 표시 여부 (기본: true) */
  showText?: boolean;
  /** 작은 크기 모드 */
  mini?: boolean;
}

/**
 * 신뢰도 바 컴포넌트
 */
export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ 
  value, 
  width = 60, 
  height = 6,
  showText = true,
  mini = false
}) => {
  const color = getConfidenceColor(value);
  const barWidth = mini ? 40 : width;
  const barHeight = mini ? 3 : height;
  const fontSize = mini ? 10 : 11;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {/* 프로그레스 바 */}
      <Box sx={{ 
        width: barWidth, 
        height: barHeight, 
        bgcolor: '#e5e5e7', 
        borderRadius: barHeight / 2, 
        overflow: 'hidden' 
      }}>
        <Box sx={{ 
          width: `${Math.min(100, Math.max(0, value))}%`, 
          height: '100%', 
          bgcolor: color, 
          borderRadius: barHeight / 2,
          transition: 'width 0.3s ease'
        }} />
      </Box>
      
      {/* 퍼센트 텍스트 */}
      {showText && (
        <Typography sx={{ 
          fontSize, 
          fontWeight: 600, 
          color: value >= 85 ? '#86868b' : color,
          minWidth: mini ? 'auto' : 30
        }}>
          {value}%
        </Typography>
      )}
    </Box>
  );
};

export default ConfidenceBar;