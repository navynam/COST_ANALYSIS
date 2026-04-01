/**
 * 🎨 테마 스위처 컴포넌트
 * 
 * 현대모비스 테마와 Toss 테마 간 실시간 전환 기능
 * 사용자가 두 디자인을 비교할 수 있도록 도와주는 UI
 */

import React, { useState } from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Chip,
  Typography,
  Paper,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Business as BusinessIcon,
  Favorite as FavoriteIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme, ThemeType, getThemeInfo } from '../contexts/ThemeContext';

// 🎨 테마 스위처 Props
interface ThemeSwitcherProps {
  position?: 'fixed' | 'relative';
  showDescription?: boolean;
}

// 🎨 테마 스위처 컴포넌트
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  position = 'fixed',
  showDescription = true
}) => {
  const { currentTheme, setTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // 🎨 테마 변경 핸들러
  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTheme: ThemeType | null
  ) => {
    if (newTheme !== null) {
      setTheme(newTheme);
    }
  };

  // 🎨 현재 테마 정보
  const currentThemeInfo = getThemeInfo(currentTheme);
  const otherTheme: ThemeType = currentTheme === 'hyundai' ? 'toss' : 'hyundai';
  const otherThemeInfo = getThemeInfo(otherTheme);

  return (
    <Paper
      elevation={3}
      sx={{
        position: position,
        top: position === 'fixed' ? 20 : 'auto',
        right: position === 'fixed' ? 20 : 'auto',
        zIndex: position === 'fixed' ? 1300 : 'auto',
        p: 2,
        minWidth: 280,
        maxWidth: 400,
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* 🎨 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaletteIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            테마 비교
          </Typography>
        </Box>
        
        <IconButton 
          size="small" 
          onClick={() => setExpanded(!expanded)}
          sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
        >
          <ExpandIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 🎨 테마 토글 버튼 */}
      <ToggleButtonGroup
        value={currentTheme}
        exclusive
        onChange={handleThemeChange}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="hyundai" sx={{ py: 1.5 }}>
          <BusinessIcon sx={{ mr: 1, fontSize: 18 }} />
          현대모비스
        </ToggleButton>
        <ToggleButton value="toss" sx={{ py: 1.5 }}>
          <FavoriteIcon sx={{ mr: 1, fontSize: 18 }} />
          Toss 스타일
        </ToggleButton>
      </ToggleButtonGroup>

      {/* 🎨 현재 테마 정보 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          현재 적용된 테마
        </Typography>
        <Chip
          label={currentThemeInfo.name}
          color="primary"
          variant="filled"
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
          {currentThemeInfo.description}
        </Typography>
      </Box>

      {/* 🎨 상세 정보 (확장 가능) */}
      <Collapse in={expanded}>
        <Divider sx={{ mb: 2 }} />
        
        {/* 현재 테마 특징 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            현재 테마 특징
          </Typography>
          {currentThemeInfo.characteristics.map((characteristic, index) => (
            <Typography 
              key={index} 
              variant="caption" 
              display="block" 
              color="text.secondary"
              sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}
            >
              • {characteristic}
            </Typography>
          ))}
        </Box>

        {/* 다른 테마로 전환 권유 */}
        <Box sx={{ 
          p: 1.5, 
          bgcolor: 'rgba(0, 148, 255, 0.05)', 
          borderRadius: 2,
          border: '1px solid rgba(0, 148, 255, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <InfoIcon sx={{ fontSize: 16, color: 'info.main' }} />
            <Typography variant="caption" fontWeight={600}>
              {otherThemeInfo.name}도 체험해보세요!
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {otherThemeInfo.description}
          </Typography>
        </Box>
      </Collapse>

      {/* 🎨 개발자 정보 */}
      {showDescription && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            실시간으로 두 테마를 비교해보세요 ✨
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default ThemeSwitcher;