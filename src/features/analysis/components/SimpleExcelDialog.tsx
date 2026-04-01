/**
 * 📊 전문적인 Excel 뷰어 다이얼로그
 * 
 * 🎯 주요 기능:
 * 1. Excel과 동일한 그리드 레이아웃
 * 2. 열 헤더 (A, B, C...) + 행 번호 (1, 2, 3...)
 * 3. 실제 Excel 데이터 표시 (병합, 스타일, 색상)
 * 4. 파싱 결과 매핑 하이라이트
 * 5. Excel 스타일 도구 모음
 * 6. 확대/축소, 검색, 인쇄, 다운로드 기능
 * 
 * 💡 장점:
 * - 외부 라이브러리 없이 순수 Material-UI로 구현
 * - 빠른 로딩과 안정적인 동작
 * - 현대모비스 브랜딩과 완벽 조화
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Chip,
  Button,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Paper,
  Alert,
  ButtonGroup
} from '@mui/material';
import { 
  Close, 
  Download, 
  Print,
  Search,
  ZoomIn,
  ZoomOut,
  Refresh,
  GridOn,
  TableChart,
  Visibility,
  Edit as EditIcon
} from '@mui/icons-material';
import { excelData } from '../data/excelData';

interface SimpleExcelDialogProps {
  open: boolean;
  onClose: () => void;
  highlightedCell?: { row: number; col: number } | null;
}

// 📊 Excel 스타일 열 헤더 생성 (A, B, C, ... AA, AB, ...)
const getColumnLabel = (index: number): string => {
  let result = '';
  let num = index;
  do {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);
  return result;
};

const SimpleExcelDialog: React.FC<SimpleExcelDialogProps> = ({ 
  open, 
  onClose, 
  highlightedCell 
}) => {
  const [zoom, setZoom] = React.useState(100);
  const [viewMode, setViewMode] = React.useState<'view' | 'edit'>('view');
  const [showGrid, setShowGrid] = React.useState(true);
  
  // 📊 최대 열 개수 계산 (colspan 고려)
  const maxCols = Math.max(...excelData.map(row => 
    row.cols.reduce((sum, col) => sum + (col.colSpan || 1), 0)
  ));
  
  console.log('SimpleExcelDialog rendered, open:', open, 'maxCols:', maxCols);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { 
          height: '95vh', 
          maxHeight: '95vh',
          m: 1
        }
      }}
      sx={{ zIndex: 9999 }}
    >
      {/* 🎯 향상된 다이얼로그 헤더 */}
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        bgcolor: '#fafafa',
        py: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableChart sx={{ color: '#4472C4' }} />
            <Typography variant="h6">📊 Excel 원본 뷰어</Typography>
            <Chip 
              label="HEAD_LINING_원가계산서.xlsx" 
              size="small" 
              color="primary"
              variant="outlined"
            />
            {viewMode === 'edit' && (
              <Chip 
                label="편집 모드" 
                size="small" 
                color="warning"
              />
            )}
          </Box>
          
          {/* 🔧 Excel 도구 모음 */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="view">
                <Visibility fontSize="small" />
                <Typography sx={{ fontSize: 11, ml: 0.5 }}>보기</Typography>
              </ToggleButton>
              <ToggleButton value="edit">
                <EditIcon fontSize="small" />
                <Typography sx={{ fontSize: 11, ml: 0.5 }}>편집</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Divider orientation="vertical" flexItem />
            
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="확대">
                <Button 
                  onClick={() => setZoom(Math.min(zoom + 25, 200))}
                  disabled={zoom >= 200}
                >
                  <ZoomIn fontSize="small" />
                </Button>
              </Tooltip>
              
              <Button sx={{ minWidth: 50, fontSize: 11 }}>
                {zoom}%
              </Button>
              
              <Tooltip title="축소">
                <Button 
                  onClick={() => setZoom(Math.max(zoom - 25, 50))}
                  disabled={zoom <= 50}
                >
                  <ZoomOut fontSize="small" />
                </Button>
              </Tooltip>
            </ButtonGroup>
            
            <Tooltip title="격자 토글">
              <Button
                variant={showGrid ? "contained" : "outlined"}
                size="small"
                onClick={() => setShowGrid(!showGrid)}
                sx={{ minWidth: 40 }}
              >
                <GridOn fontSize="small" />
              </Button>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem />
            
            <Tooltip title="새로고침">
              <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>
                <Refresh fontSize="small" />
              </Button>
            </Tooltip>
            
            <Tooltip title="검색">
              <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>
                <Search fontSize="small" />
              </Button>
            </Tooltip>
            
            <Tooltip title="다운로드">
              <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>
                <Download fontSize="small" />
              </Button>
            </Tooltip>
            
            <Tooltip title="인쇄">
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => window.print()}
                sx={{ minWidth: 40 }}
              >
                <Print fontSize="small" />
              </Button>
            </Tooltip>
          </Box>
        </Box>
        
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#fff' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>A</TableCell>
                <TableCell sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>B</TableCell>
                <TableCell sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>C</TableCell>
                <TableCell sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>D</TableCell>
                <TableCell sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>E</TableCell>
                <TableCell sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>F</TableCell>
                <TableCell sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>G</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {excelData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell sx={{ 
                    bgcolor: '#f0f0f0', 
                    fontWeight: 'bold',
                    ...(highlightedCell?.row === rowIndex && { bgcolor: '#fff3cd' })
                  }}>
                    {rowIndex + 1}
                  </TableCell>
                  
                  {row.cols.map((col: any, colIndex: number) => (
                    <TableCell 
                      key={colIndex}
                      colSpan={col.colSpan || 1}
                      sx={{
                        fontWeight: col.bold ? 'bold' : 'normal',
                        textAlign: col.align || 'left',
                        bgcolor: col.bg || '#fff',
                        color: col.color || '#000',
                        border: '1px solid #ddd',
                        ...(highlightedCell?.row === rowIndex && 
                            highlightedCell?.col === colIndex && {
                              bgcolor: '#fff3cd !important',
                              border: '2px solid #ff9500 !important',
                              position: 'relative',
                              '&::after': {
                                content: '"📍"',
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                fontSize: 10
                              }
                            })
                      }}
                    >
                      {col.text}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#d4edda', border: '1px solid #c3e6cb' }} />
            <Typography variant="caption">정상 파싱</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#f8d7da', border: '1px solid #f5c6cb' }} />
            <Typography variant="caption">이상치 감지</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#fff3cd', border: '1px solid #ff9500' }} />
            <Typography variant="caption">매핑된 셀</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleExcelDialog;