/**
 * 📊 원본 Excel 뷰어 다이얼로그
 * 
 * 🎯 주요 기능:
 * 1. 실제 Excel 파일과 동일한 형태의 스프레드시트 뷰어
 * 2. 파싱된 데이터와 원본 셀의 매핑 관계 시각화
 * 3. 이상치 감지 결과를 원본 셀에서 직접 확인
 * 4. Excel과 유사한 UX (행/열 번호, 셀 선택, 스크롤)
 * 
 * 🎨 시각적 특징:
 * - 선택된 셀: 주황색 하이라이트 + 📍 아이콘
 * - 정상 파싱: 연한 초록색 배경
 * - 이상치 감지: 연한 빨간색 배경
 * - Excel 스타일 그리드와 헤더
 * 
 * 🔧 상호작용:
 * - 셀 클릭으로 해당 파싱 결과 하이라이트
 * - 스크롤로 대용량 스프레드시트 탐색
 * - 범례로 색상 의미 설명
 */

import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableRow, TableHead,
  Dialog, DialogTitle, DialogContent, IconButton, Chip, Divider,
  Paper, ButtonGroup, Button, Tooltip,
} from '@mui/material';
import { 
  Close, GridOn, ViewCompact, ZoomIn, ZoomOut, 
  FindInPage, Download, Print 
} from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import { excelData } from '../data/excelData';

interface OriginalViewDialogProps {
  open: boolean;
  onClose: () => void;
  highlightedCell: { row: number; col: number } | null;
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

const OriginalViewDialog: React.FC<OriginalViewDialogProps> = ({ open, onClose, highlightedCell }) => {
  // 🎛️ Excel 뷰어 상태 관리
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  
  // 📊 최대 열 개수 계산 (colspan 고려)
  const maxCols = Math.max(...excelData.map(row => 
    row.cols.reduce((sum, col) => sum + (col.colSpan || 1), 0)
  ));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          height: '90vh', 
          maxHeight: '90vh',
          zIndex: 9999
        } 
      }}
      sx={{ zIndex: 9999 }}
    >
      
      {/* 🎯 향상된 다이얼로그 헤더 */}
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pb: 1,
        borderBottom: `1px solid ${C.border}`,
        bgcolor: '#f8f9fa'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GridOn sx={{ color: C.green }} />
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>📄 Excel 원본 뷰어</Typography>
            <Chip 
              label="HEAD_LINING_원가계산서.xlsx" 
              size="small" 
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Box>
          
          {/* 🔧 Excel 도구 모음 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="확대">
                <Button 
                  onClick={() => setZoom(Math.min(zoom + 25, 200))}
                  disabled={zoom >= 200}
                >
                  <ZoomIn fontSize="small" />
                </Button>
              </Tooltip>
              
              <Button sx={{ minWidth: 60, fontSize: 11 }}>
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
                <ViewCompact fontSize="small" />
              </Button>
            </Tooltip>
            
            <Tooltip title="검색">
              <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>
                <FindInPage fontSize="small" />
              </Button>
            </Tooltip>
            
            <Tooltip title="다운로드">
              <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>
                <Download fontSize="small" />
              </Button>
            </Tooltip>
            
            <Tooltip title="인쇄">
              <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>
                <Print fontSize="small" />
              </Button>
            </Tooltip>
          </Box>
        </Box>
        
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#fff' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* 📊 Excel 스프레드시트 영역 */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: '#ffffff',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${100 / (zoom / 100)}%`,
            height: `${100 / (zoom / 100)}%`,
          }}
        >
          <Paper elevation={0} sx={{ minWidth: 900 }}>
            
            {/* 📋 Excel 스타일 테이블 */}
            <Table 
              size="small" 
              sx={{ 
                borderCollapse: 'separate',
                '& .MuiTableCell-root': {
                  border: showGrid ? `1px solid #e0e0e0` : 'none',
                  padding: '4px 8px',
                  minWidth: 80,
                  position: 'relative',
                }
              }}
            >
              
              {/* 🔤 Excel 스타일 열 헤더 (A, B, C, ...) */}
              <TableHead>
                <TableRow>
                  {/* 📍 좌상단 빈 셀 */}
                  <TableCell 
                    sx={{ 
                      bgcolor: '#f0f0f0', 
                      border: `1px solid #d0d0d0`,
                      width: 40,
                      textAlign: 'center',
                      fontWeight: 700,
                      color: C.gray
                    }}
                  >
                    ■
                  </TableCell>
                  
                  {/* 🔤 A, B, C, ... 열 헤더들 */}
                  {Array.from({ length: maxCols }, (_, i) => (
                    <TableCell 
                      key={i}
                      sx={{ 
                        bgcolor: '#f0f0f0', 
                        border: `1px solid #d0d0d0`,
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: 11,
                        color: C.gray,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#e8e8e8' }
                      }}
                    >
                      {getColumnLabel(i)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {/* 📊 실제 데이터 행들 */}
              <TableBody>
                {excelData.map((row, ri) => {
                  // 현재 행의 열 추적을 위한 변수
                  let currentColIndex = 0;
                  
                  return (
                    <TableRow key={ri}>
                      
                      {/* 🔢 행 번호 (1, 2, 3, ...) */}
                      <TableCell sx={{
                        bgcolor: '#f0f0f0',
                        border: `1px solid #d0d0d0`,
                        width: 40,
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: 11,
                        color: C.gray,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#e8e8e8' },
                        ...(highlightedCell?.row === ri && { 
                          bgcolor: '#fff3cd', 
                          color: C.orange,
                          fontWeight: 700 
                        })
                      }}>
                        {ri + 1}
                      </TableCell>
                      
                      {/* 📄 실제 데이터 셀들 */}
                      {row.cols.map((col: any, ci: number) => {
                        currentColIndex += (col.colSpan || 1);
                        
                        const isHighlighted = highlightedCell?.row === ri && highlightedCell?.col === ci;
                        const isSelected = selectedCell?.row === ri && selectedCell?.col === ci;
                        
                        return (
                          <TableCell
                            key={`${ri}-${ci}`}
                            colSpan={col.colSpan || 1}
                            onClick={() => setSelectedCell({ row: ri, col: ci })}
                            sx={{
                              fontSize: ri === 0 ? 14 : 12,
                              fontWeight: col.bold ? 700 : 400,
                              textAlign: col.align || 'left',
                              bgcolor: col.bg || '#fff',
                              color: col.color || C.dark,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              
                              // 🎨 상호작용 스타일
                              '&:hover': { 
                                bgcolor: isHighlighted || isSelected ? undefined : '#f5f5f5',
                                transform: 'scale(1.02)',
                                zIndex: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              },
                              
                              // 🎯 하이라이트된 셀 (파싱 결과와 연결)
                              ...(isHighlighted && {
                                bgcolor: '#fff3cd !important',
                                border: `2px solid ${C.orange} !important`,
                                fontWeight: 700,
                                zIndex: 20,
                                '&::after': {
                                  content: '"📍"',
                                  position: 'absolute',
                                  top: 2,
                                  right: 2,
                                  fontSize: 10,
                                  zIndex: 21,
                                }
                              }),
                              
                              // 🖱️ 선택된 셀 (사용자 클릭)
                              ...(isSelected && !isHighlighted && {
                                bgcolor: '#e3f2fd !important',
                                border: `2px solid ${C.blue} !important`,
                                fontWeight: 600,
                                zIndex: 15,
                              })
                            }}
                          >
                            {col.text}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Divider />
        
        {/* 📊 하단 상태 표시줄 + 범례 */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#f8f9fa', 
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          
          {/* 📋 셀 정보 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedCell && (
              <Chip
                label={`${getColumnLabel(selectedCell.col)}${selectedCell.row + 1} 선택됨`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {highlightedCell && (
              <Chip
                label={`${getColumnLabel(highlightedCell.col)}${highlightedCell.row + 1} 파싱 연결`}
                size="small"
                sx={{ bgcolor: '#fff3cd', color: C.orange }}
              />
            )}
          </Box>
          
          {/* 🎨 색상 범례 */}
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 14, 
                height: 14, 
                bgcolor: '#d4edda', 
                borderRadius: 2, 
                border: '1px solid #c3e6cb' 
              }} />
              <Typography sx={{ fontSize: 11, color: C.gray }}>
                ✅ 정상 파싱
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 14, 
                height: 14, 
                bgcolor: '#f8d7da', 
                borderRadius: 2, 
                border: '1px solid #f5c6cb' 
              }} />
              <Typography sx={{ fontSize: 11, color: C.gray }}>
                ⚠️ 이상치 감지
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 14, 
                height: 14, 
                bgcolor: '#fff3cd', 
                borderRadius: 2, 
                border: `1px solid ${C.orange}` 
              }} />
              <Typography sx={{ fontSize: 11, color: C.gray }}>
                📍 매핑된 셀
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 14, 
                height: 14, 
                bgcolor: '#e3f2fd', 
                borderRadius: 2, 
                border: `1px solid ${C.blue}` 
              }} />
              <Typography sx={{ fontSize: 11, color: C.gray }}>
                🖱️ 선택된 셀
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OriginalViewDialog;
