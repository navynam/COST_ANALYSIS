/**
 * @fileoverview 검증 페이지 - 현대모비스 견적서 기반 UX
 * @description 원본과 AI파싱 결과 나란히 비교, 실시간 하이라이트, 원클릭 수정
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
} from '@mui/material';
import {
  CheckCircle, Warning, Error as ErrorIcon, NavigateNext, NavigateBefore,
  Edit, Visibility, Assessment, Close,
} from '@mui/icons-material';
import WorkflowStepper from '../components/WorkflowStepper';
import { useNavigate } from 'react-router-dom';

/* ── 검증 항목 데이터 (현대모비스 견적서 기반) ── */
interface VerificationItem {
  id: string;
  fieldName: string;
  originalValue: string;
  parsedValue: string;
  confidence: number;
  status: 'correct' | 'warning' | 'error';
  cellRef: string;
  message?: string;
  category: 'material_cost' | 'processing_cost' | 'overhead_cost' | 'total' | 'metadata';
}

const mockVerificationData: VerificationItem[] = [
  {
    id: '1',
    fieldName: '재료비',
    originalValue: '1,250,000',
    parsedValue: '125,000',
    confidence: 75,
    status: 'error',
    cellRef: 'B12',
    message: '콤마 인식 오류로 인한 값 차이',
    category: 'material_cost',
  },
  {
    id: '2',
    fieldName: '가공비',
    originalValue: '800,000',
    parsedValue: '800,000',
    confidence: 98,
    status: 'correct',
    cellRef: 'B15',
    category: 'processing_cost',
  },
  {
    id: '3',
    fieldName: '제경비',
    originalValue: '350,000',
    parsedValue: '350,000',
    confidence: 95,
    status: 'correct',
    cellRef: 'B18',
    category: 'overhead_cost',
  },
  {
    id: '4',
    fieldName: '합계',
    originalValue: '2,400,000',
    parsedValue: '24,000',
    confidence: 45,
    status: 'error',
    cellRef: 'B21',
    message: '계산 검증: 1,250,000 + 800,000 + 350,000 = 2,400,000',
    category: 'total',
  },
  {
    id: '5',
    fieldName: '업체명',
    originalValue: '㈜대한제조',
    parsedValue: '대한제조',
    confidence: 82,
    status: 'warning',
    cellRef: 'C5',
    message: '법인 표기 누락',
    category: 'metadata',
  },
  {
    id: '6',
    fieldName: '견적일자',
    originalValue: '2024.02.15',
    parsedValue: '',
    confidence: 35,
    status: 'error',
    cellRef: 'C6',
    message: '날짜 형식 인식 실패',
    category: 'metadata',
  },
  {
    id: '7',
    fieldName: '단위중량',
    originalValue: '0.45kg',
    parsedValue: '0.45',
    confidence: 88,
    status: 'warning',
    cellRef: 'D8',
    message: '단위 정보 누락',
    category: 'material_cost',
  },
];

// 원본 엑셀 미리보기 데이터
const mockExcelData = [
  { row: 12, col: 'B', field: '재료비', value: '1,250,000', type: 'number' },
  { row: 15, col: 'B', field: '가공비', value: '800,000', type: 'number' },
  { row: 18, col: 'B', field: '제경비', value: '350,000', type: 'number' },
  { row: 21, col: 'B', field: '합계', value: '2,400,000', type: 'number' },
  { row: 5, col: 'C', field: '업체명', value: '㈜대한제조', type: 'text' },
  { row: 6, col: 'C', field: '견적일자', value: '2024.02.15', type: 'date' },
  { row: 8, col: 'D', field: '단위중량', value: '0.45kg', type: 'text' },
];

const statusColor = {
  correct: { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' },
  warning: { bg: '#fff8e1', border: '#ff9800', text: '#ef6c00' },
  error: { bg: '#ffebee', border: '#f44336', text: '#c62828' },
};

const confidenceColor = (confidence: number) => {
  if (confidence >= 90) return '#4caf50';
  if (confidence >= 70) return '#ff9800';
  return '#f44336';
};

const ParsedDataReview: React.FC = () => {
  const navigate = useNavigate();
  const [highlightedCell, setHighlightedCell] = useState<string>('');
  const [editDialog, setEditDialog] = useState<{ open: boolean; item?: VerificationItem }>({ open: false });
  const [correctedValue, setCorrectedValue] = useState('');

  const totalCorrect = mockVerificationData.filter(item => item.status === 'correct').length;
  const totalWarning = mockVerificationData.filter(item => item.status === 'warning').length;
  const totalError = mockVerificationData.filter(item => item.status === 'error').length;

  const handleCellHighlight = (cellRef: string) => {
    setHighlightedCell(cellRef);
    setTimeout(() => setHighlightedCell(''), 3000); // 3초 후 하이라이트 제거
  };

  const handleEdit = (item: VerificationItem) => {
    setEditDialog({ open: true, item });
    setCorrectedValue(item.originalValue);
  };

  const handleSaveEdit = () => {
    // 실제로는 서버로 수정된 값 전송
    console.log('수정된 값:', correctedValue);
    setEditDialog({ open: false });
    setCorrectedValue('');
    alert('수정사항이 저장되었습니다!');
  };

  const handleApprove = (item: VerificationItem) => {
    console.log('승인됨:', item.id);
    alert(`"${item.fieldName}" 값이 승인되었습니다.`);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <WorkflowStepper activeStep={1} />

      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#003875" sx={{ mb: 1 }}>
          🔍 견적서 검증
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <strong>파일명:</strong> 현대모비스_제조견적서_2024.xlsx
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Chip icon={<CheckCircle />} label={`✅ ${totalCorrect}개 정상`} 
            sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }} />
          <Chip icon={<Warning />} label={`⚠️ ${totalWarning}개 검토 필요`} 
            sx={{ bgcolor: '#fff8e1', color: '#ef6c00' }} />
          <Chip icon={<ErrorIcon />} label={`❌ ${totalError}개 오류`} 
            sx={{ bgcolor: '#ffebee', color: '#c62828' }} />
        </Box>
      </Box>

      {/* 요약 카드 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
        <Card sx={{ textAlign: 'center', border: '2px solid #4caf50', bgcolor: '#e8f5e8' }}>
          <CardContent>
            <Typography variant="h2" fontWeight={800} color="#2e7d32">{totalCorrect}</Typography>
            <Typography variant="body2" color="#2e7d32">정상 추출</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', border: '2px solid #ff9800', bgcolor: '#fff8e1' }}>
          <CardContent>
            <Typography variant="h2" fontWeight={800} color="#ef6c00">{totalWarning}</Typography>
            <Typography variant="body2" color="#ef6c00">검토 필요</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', border: '2px solid #f44336', bgcolor: '#ffebee' }}>
          <CardContent>
            <Typography variant="h2" fontWeight={800} color="#c62828">{totalError}</Typography>
            <Typography variant="body2" color="#c62828">수정 필요</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', border: '2px solid #2196f3', bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="h2" fontWeight={800} color="#1976d2">85%</Typography>
            <Typography variant="body2" color="#1976d2">전체 신뢰도</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 메인 비교 영역 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3, mb: 3 }}>
        {/* 원본 엑셀 미리보기 */}
        <Paper sx={{ p: 3, height: '600px' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#003875' }}>
            📊 원본 엑셀 미리보기
          </Typography>
          <TableContainer sx={{ height: '500px', overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 700 }}>행</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>값</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>위치</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockExcelData.map((cell) => (
                  <TableRow 
                    key={`${cell.row}-${cell.col}`}
                    sx={{
                      bgcolor: highlightedCell === cell.row + cell.col ? '#ffeb3b' : undefined,
                      transition: 'background-color 0.5s ease',
                    }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace' }}>{cell.row}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{cell.field}</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700,
                      color: cell.type === 'number' ? '#1976d2' : '#333',
                    }}>{cell.value}</TableCell>
                    <TableCell>
                      <Chip 
                        label={cell.col + cell.row} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontFamily: 'monospace', fontSize: '11px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* AI 파싱 결과 검증 */}
        <Paper sx={{ p: 3, height: '600px' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#003875' }}>
            🤖 AI 파싱 결과 검증
          </Typography>
          <Box sx={{ height: '500px', overflow: 'auto' }}>
            {mockVerificationData.map((item) => {
              const colors = statusColor[item.status];
              return (
                <Paper 
                  key={item.id}
                  sx={{ 
                    p: 2, mb: 2, 
                    border: `2px solid ${colors.border}`, 
                    bgcolor: colors.bg,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                  onClick={() => handleCellHighlight(item.cellRef.replace(/[^0-9A-Z]/g, ''))}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color={colors.text}>
                      {item.fieldName}
                    </Typography>
                    <Chip 
                      label={`${item.confidence}%`}
                      size="small"
                      sx={{ 
                        bgcolor: confidenceColor(item.confidence),
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    원본: {item.originalValue} → 파싱: {item.parsedValue || '인식 실패'} 
                    {item.status !== 'correct' && <span style={{ color: colors.text }}> ❌</span>}
                  </Typography>

                  {item.message && (
                    <Alert severity={item.status === 'error' ? 'error' : 'warning'} sx={{ mb: 2, fontSize: '12px' }}>
                      {item.message}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {item.status !== 'correct' && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        startIcon={<Edit />}
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
                      >
                        수정
                      </Button>
                    )}
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<CheckCircle />}
                      onClick={(e) => { e.stopPropagation(); handleApprove(item); }}
                      sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                    >
                      {item.status === 'correct' ? '확인됨' : '맞음'}
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      </Box>

      {/* 하단 액션 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>진행상황:</strong> {mockVerificationData.length}개 항목 중 {totalCorrect}개 검토 완료 ({Math.round((totalCorrect / mockVerificationData.length) * 100)}%)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<NavigateBefore />} 
            onClick={() => navigate('/parsing')}
          >
            뒤로가기
          </Button>
          <Button 
            variant="contained" 
            endIcon={<NavigateNext />}
            onClick={() => navigate('/analysis')}
            sx={{ bgcolor: '#003875', px: 4, py: 1.5, fontSize: '16px' }}
          >
            검증 완료 및 다음 단계 →
          </Button>
        </Box>
      </Box>

      {/* 수정 다이얼로그 */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          필드 값 수정
          <IconButton onClick={() => setEditDialog({ open: false })}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="필드명"
              value={editDialog.item?.fieldName || ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              label="현재 AI 파싱값"
              value={editDialog.item?.parsedValue || ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              label="수정된 값"
              value={correctedValue}
              onChange={(e) => setCorrectedValue(e.target.value)}
              fullWidth
              placeholder="올바른 값을 입력하세요"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false })}>취소</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            sx={{ bgcolor: '#003875' }}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParsedDataReview;