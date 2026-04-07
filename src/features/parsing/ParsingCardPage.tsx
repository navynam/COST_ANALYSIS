/**
 * 📄 파싱(업로드) 페이지 - 카드 버전 - 견적서 처리 1단계
 * 
 * 🎯 주요 기능:
 * 1. 드래그앤드롭 파일 업로드 (Excel 파일)
 * 2. AI 자동 파싱 진행률 실시간 표시
 * 3. 파일별 상태 관리 (대기/추출중/검증/분석/실패)
 * 4. 파일 목록을 카드 형태로 표시 (그리드 레이아웃)
 * 5. 개별 파일 카드에 상세 정보 및 액션 버튼
 * 
 * 📊 카드 기반 레이아웃:
 * - 그리드: 반응형 카드 레이아웃 (데스크톱 3열, 태블릿 2열, 모바일 1열)
 * - 카드: 파일별 독립된 카드 컴포넌트
 * - 상태: 카드 헤더 색상으로 상태 구분
 * - 액션: 카드 하단에 상태별 액션 버튼
 * 
 * 🎨 카드 디자인:
 * - 헤더: 파일명 + 상태 배지
 * - 바디: 파일 정보 (크기, 업로드 시간, 진행률)
 * - 푸터: 액션 버튼 (검증하기, 분석하기, 재시도 등)
 * 
 * 🔗 기존 테이블 버전과 동일한 기능:
 * - 상태 필터링, 검색, 정렬 모든 기능 지원
 * - 동일한 useParsingPage 훅 사용
 * - 동일한 라우팅 및 상태 관리
 */
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import {
  Search,
  FilterList,
  CheckCircle,
  Schedule,
  Error,
  Analytics,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Close as CloseIcon,
  UploadFile,
  GridView,
  HourglassEmpty,
  PendingActions,
  TaskAlt,
  ViewModule,
  ViewList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { C } from '../../shared/constants/colors';
import FileDetailDrawer from './components/FileDetailDrawer';
import FileTable from './components/FileTable';
import SearchFilterDialog from './components/SearchFilterDialog';
import { useParsingPage } from './hooks/useParsingPage';
import type { SortField } from './types';
import cardStyles from './ParsingCardPage.module.css';

// 📋 파일 카드 컴포넌트
const FileCard: React.FC<{
  file: any;
  onVerify: () => void;
  onAnalysis: () => void;
  onDetail: () => void;
  onRetry?: () => void;
  onClick: () => void;
  onNoteClick: (fileId: string) => void;
  getNoteCount: (fileId: string) => number;
}> = ({ file, onVerify, onAnalysis, onDetail, onRetry, onClick, onNoteClick, getNoteCount }) => {

  // 상태별 색상 및 아이콘
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'extracting':
        return { 
          color: '#ff9800', 
          icon: <Schedule sx={{ fontSize: 16 }} />, 
          label: '추출중', 
          bgColor: '#fff3e0' 
        };
      case 'verifying':
        return { 
          color: '#2196f3', 
          icon: <Schedule sx={{ fontSize: 16 }} />, 
          label: '검증중', 
          bgColor: '#e3f2fd' 
        };
      case 'verified':
        return { 
          color: '#4caf50', 
          icon: <CheckCircle sx={{ fontSize: 16 }} />, 
          label: '검증완료', 
          bgColor: '#e8f5e8' 
        };
      case 'analyzing':
        return { 
          color: '#9c27b0', 
          icon: <Analytics sx={{ fontSize: 16 }} />, 
          label: '분석중', 
          bgColor: '#f3e5f5' 
        };
      case 'analyzed':
        return { 
          color: '#34c759', 
          icon: <CheckCircle sx={{ fontSize: 16 }} />, 
          label: '분석완료', 
          bgColor: '#e8f5e9' 
        };
      case 'failed':
        return { 
          color: '#f44336', 
          icon: <Error sx={{ fontSize: 16 }} />, 
          label: '실패', 
          bgColor: '#ffebee' 
        };
      default:
        return { 
          color: '#9e9e9e', 
          icon: <Schedule sx={{ fontSize: 16 }} />, 
          label: '대기', 
          bgColor: '#f5f5f5' 
        };
    }
  };

  const statusConfig = getStatusConfig(file.status);
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card
      className={cardStyles.fileCard}
      onClick={onClick}
    >
      {/* 🎨 Toss 스타일 카드 헤더 - 컴팩트 */}
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Box className={cardStyles.cardHeaderRow} sx={{ mb: 2 }}>
          {/* 상태 배지, 파일명 */}
          <Box className={cardStyles.cardBadgeRow} sx={{ gap: 2 }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                backgroundColor: `${statusConfig.color}15`,
                color: statusConfig.color,
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: `1px solid ${statusConfig.color}30`
              }}
            >
              {statusConfig.label}
            </Box>
            <Typography
              className={cardStyles.cardFileName}
              sx={{ fontSize: 16, fontWeight: 700, color: '#191f28' }}
              title={file.name}
            >
              {file.name}
            </Typography>
          </Box>
        </Box>

        {/* 📋 Toss 스타일 파일 정보 */}
        <Box sx={{ mb: 2 }}>
          {/* 첫 번째 라인: 파일 크기, 업로드일 */}
          <Box className={cardStyles.cardInfoRow} sx={{ gap: 3, mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              📁 {formatFileSize(file.size || 0)}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              📅 {file.uploadDate || file.uploadedAt}
            </Typography>
          </Box>

          {/* 두 번째 라인: 업로더, 부서 */}
          <Box className={cardStyles.cardInfoRow} sx={{ gap: 3, mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              👤 {file.uploader}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              🏢 {file.department}
            </Typography>
          </Box>


        </Box>

        {/* 🔄 동적 콘텐츠 영역 - 최소 여백 */}
        <Box sx={{ mb: 0.5, flex: 1 }}>
          {/* ⚡ Toss 스타일 진행률 (추출 중) */}
          {file.status === 'extracting' && (
            <Box sx={{ p: 2.5, bgcolor: '#f9fafb', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontSize: 14, color: '#4e5968', fontWeight: 600 }}>
                  데이터 추출 중
                </Typography>
                <Typography sx={{ fontSize: 14, color: statusConfig.color, fontWeight: 700 }}>
                  {file.progress || 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={file.progress || 0} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: '#e5e8eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: statusConfig.color,
                    borderRadius: 4
                  }
                }} 
              />
              <Typography sx={{ 
                fontSize: 12, 
                color: '#8b95a1', 
                mt: 1,
                textAlign: 'center'
              }}>
                Excel 파일을 분석하고 데이터를 추출하고 있어요
              </Typography>
            </Box>
          )}

          {/* ✅ Toss 스타일 추출 결과 (완료, 분석중, 검증 단계) - 컴팩트 */}
          {(file.status === 'verifying' || file.status === 'verified' || file.status === 'analyzing' || file.status === 'analyzed') && (
            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: '10px', border: '1px solid #dcfce7' }}>
              <Typography sx={{ 
                fontSize: 12, 
                color: '#15803d', 
                fontWeight: 700,
                mb: 1.5,
                textAlign: 'center'
              }}>
                ✨ 추출 완료
              </Typography>
              
              {/* 📊 추출 결과 요약 - 축소 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography sx={{ 
                    fontSize: 16, 
                    fontWeight: 800, 
                    color: '#0064ff',
                    lineHeight: 1
                  }}>
                    {file.parsedItems || 156}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: 10, 
                    color: '#15803d',
                    fontWeight: 500
                  }}>
                    파싱 항목
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography sx={{ 
                    fontSize: 16, 
                    fontWeight: 800, 
                    color: '#00c896',
                    lineHeight: 1
                  }}>
                    {(file.parsedItems && file.anomalies) ? 
                      Math.round(((file.parsedItems - file.anomalies) / file.parsedItems) * 100) : 
                      94
                    }%
                  </Typography>
                  <Typography sx={{ 
                    fontSize: 10, 
                    color: '#15803d',
                    fontWeight: 500
                  }}>
                    신뢰도
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography sx={{ 
                    fontSize: 16, 
                    fontWeight: 800, 
                    color: file.anomalies && file.anomalies > 0 ? '#ff5a5a' : '#8b95a1',
                    lineHeight: 1
                  }}>
                    {file.anomalies || 3}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: 10, 
                    color: '#15803d',
                    fontWeight: 500
                  }}>
                    이상치
                  </Typography>
                </Box>
              </Box>

              {/* 📋 추출된 카테고리 - 축소 */}
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #dcfce7' }}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip 
                    label="재료비 (4건)" 
                    size="small" 
                    sx={{ 
                      fontSize: 9, 
                      height: 18,
                      bgcolor: '#dbeafe', 
                      color: '#1d4ed8',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 0.5 }
                    }} 
                  />
                  <Chip 
                    label="가공비 (3건)" 
                    size="small" 
                    sx={{ 
                      fontSize: 9, 
                      height: 18,
                      bgcolor: '#fef3c7', 
                      color: '#d97706',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 0.5 }
                    }} 
                  />
                  <Chip 
                    label="경비 (2건)" 
                    size="small" 
                    sx={{ 
                      fontSize: 9, 
                      height: 18,
                      bgcolor: '#dcfce7', 
                      color: '#059669',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 0.5 }
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* 📋 대기 상태 안내 (추출 전) - 컴팩트 */}
          {file.status === 'pending' && (
            <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e8eb' }}>
              <Typography sx={{ 
                fontSize: 12, 
                color: '#6b7280', 
                fontWeight: 700,
                mb: 1,
                textAlign: 'center'
              }}>
                ⏳ 대기 중
              </Typography>
              
              <Typography sx={{ 
                fontSize: 12, 
                color: '#6b7280',
                fontWeight: 500,
                textAlign: 'center',
                lineHeight: 1.4
              }}>
                곧 데이터 추출이 시작됩니다
              </Typography>
            </Box>
          )}

          {/* ⚠️ 오류 상태 - 간소화 (오류 사유만) */}
          {file.status === 'failed' && (
            <Box sx={{ p: 2, bgcolor: '#fff5f5', borderRadius: '10px', border: '1px solid #fee2e2' }}>
              <Typography sx={{ 
                fontSize: 12, 
                color: '#dc2626',
                fontWeight: 600,
                mb: 1.5
              }}>
                오류 사유
              </Typography>
              <Typography sx={{ 
                fontSize: 13, 
                color: '#991b1b',
                lineHeight: 1.4,
                fontWeight: 500,
                bgcolor: '#fee2e2',
                p: 1.5,
                borderRadius: '8px'
              }}>
                {file.error || 'Excel 파일 형식이 올바르지 않거나 데이터를 읽을 수 없습니다. 파일을 다시 확인해주세요.'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* 🎯 Toss 스타일 버튼 영역 - 노트 + 액션 */}
      <Box sx={{ 
        p: 2, 
        pt: 0.5, 
        mt: 'auto'
      }}>
        {file.status === 'verifying' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); onNoteClick(file.id.toString()); }}
              sx={{ 
                fontSize: 12, 
                fontWeight: 600,
                textTransform: 'none', 
                borderRadius: '8px', 
                py: 1,
                px: 3,
                minWidth: 120,
                whiteSpace: 'nowrap',
                borderColor: '#0064ff',
                color: '#0064ff',
                '&:hover': { 
                  borderColor: '#0056d3',
                  bgcolor: 'rgba(0, 100, 255, 0.04)'
                }
              }}
            >
              📝 노트({getNoteCount(file.id.toString())})
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={(e) => { e.stopPropagation(); onVerify(); }}
              sx={{ 
                fontSize: 16, 
                fontWeight: 700,
                textTransform: 'none', 
                bgcolor: '#0064ff', 
                borderRadius: '12px', 
                py: 1.25,
                boxShadow: 'none',
                letterSpacing: '-0.3px',
                '&:hover': { 
                  bgcolor: '#0056d3',
                  boxShadow: 'none'
                } 
              }}
            >
              검증하기
            </Button>
          </Box>
        )}

        {file.status === 'verified' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); onNoteClick(file.id.toString()); }}
              sx={{ 
                fontSize: 12, 
                fontWeight: 600,
                textTransform: 'none', 
                borderRadius: '8px', 
                py: 1,
                px: 3,
                minWidth: 120,
                whiteSpace: 'nowrap',
                borderColor: '#0064ff',
                color: '#0064ff',
                '&:hover': { 
                  borderColor: '#0056d3',
                  bgcolor: 'rgba(0, 100, 255, 0.04)'
                }
              }}
            >
              📝 노트({getNoteCount(file.id.toString())})
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={(e) => { e.stopPropagation(); onAnalysis(); }}
              sx={{ 
                fontSize: 16, 
                fontWeight: 700,
                textTransform: 'none', 
                bgcolor: '#4caf50', 
                borderRadius: '12px', 
                py: 1.25,
                boxShadow: 'none',
                letterSpacing: '-0.3px',
                '&:hover': { 
                  bgcolor: '#388e3c',
                  boxShadow: 'none'
                } 
              }}
            >
              분석하기
            </Button>
          </Box>
        )}
        
        {file.status === 'extracting' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); onNoteClick(file.id.toString()); }}
              sx={{ 
                fontSize: 12, 
                fontWeight: 600,
                textTransform: 'none', 
                borderRadius: '8px', 
                py: 1,
                px: 3,
                minWidth: 120,
                whiteSpace: 'nowrap',
                borderColor: '#0064ff',
                color: '#0064ff',
                '&:hover': { 
                  borderColor: '#0056d3',
                  bgcolor: 'rgba(0, 100, 255, 0.04)'
                }
              }}
            >
              📝 노트({getNoteCount(file.id.toString())})
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              disabled 
              sx={{ 
                fontSize: 16, 
                fontWeight: 700,
                textTransform: 'none', 
                borderRadius: '12px',
                py: 1.25,
                borderColor: '#f2f4f6',
                color: '#8b95a1',
                letterSpacing: '-0.3px'
              }}
            >
              처리중
            </Button>
          </Box>
        )}
        
        {file.status === 'failed' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); onNoteClick(file.id.toString()); }}
              sx={{ 
                fontSize: 12, 
                fontWeight: 600,
                textTransform: 'none', 
                borderRadius: '8px', 
                py: 1,
                px: 3,
                minWidth: 120,
                whiteSpace: 'nowrap',
                borderColor: '#0064ff',
                color: '#0064ff',
                '&:hover': { 
                  borderColor: '#0056d3',
                  bgcolor: 'rgba(0, 100, 255, 0.04)'
                }
              }}
            >
              📝 노트({getNoteCount(file.id.toString())})
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={(e) => { e.stopPropagation(); onDetail(); }}
              sx={{ 
                fontSize: 16, 
                fontWeight: 700,
                textTransform: 'none', 
                borderRadius: '12px',
                py: 1.25,
                bgcolor: '#ff5a5a',
                boxShadow: 'none',
                letterSpacing: '-0.3px',
                '&:hover': { 
                  bgcolor: '#ff4444',
                  boxShadow: 'none'
                }
              }}
            >
              오류 확인
            </Button>
          </Box>
        )}
        
        {file.status === 'analyzing' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); onNoteClick(file.id.toString()); }}
              sx={{ 
                fontSize: 12, 
                fontWeight: 600,
                textTransform: 'none', 
                borderRadius: '8px', 
                py: 1,
                px: 3,
                minWidth: 120,
                whiteSpace: 'nowrap',
                borderColor: '#0064ff',
                color: '#0064ff',
                '&:hover': { 
                  borderColor: '#0056d3',
                  bgcolor: 'rgba(0, 100, 255, 0.04)'
                }
              }}
            >
              📝 노트({getNoteCount(file.id.toString())})
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={(e) => { e.stopPropagation(); onAnalysis(); }}
              sx={{ 
                fontSize: 16, 
                fontWeight: 700,
                textTransform: 'none', 
                bgcolor: '#9c27b0', 
                borderRadius: '12px',
                py: 1.25,
                boxShadow: 'none',
                letterSpacing: '-0.3px',
                '&:hover': { 
                  bgcolor: '#7b1fa2',
                  boxShadow: 'none'
                }
              }}
            >
              분석 상세보기
            </Button>
          </Box>
        )}

        {file.status === 'analyzed' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); onNoteClick(file.id.toString()); }}
              sx={{ 
                fontSize: 12, 
                fontWeight: 600,
                textTransform: 'none', 
                borderRadius: '8px', 
                py: 1,
                px: 3,
                minWidth: 120,
                whiteSpace: 'nowrap',
                borderColor: '#0064ff',
                color: '#0064ff',
                '&:hover': { 
                  borderColor: '#0056d3',
                  bgcolor: 'rgba(0, 100, 255, 0.04)'
                }
              }}
            >
              📝 노트({getNoteCount(file.id.toString())})
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={(e) => { e.stopPropagation(); onAnalysis(); }}
              sx={{ 
                fontSize: 16, 
                fontWeight: 700,
                textTransform: 'none', 
                bgcolor: '#34c759', 
                borderRadius: '12px',
                py: 1.25,
                boxShadow: 'none',
                letterSpacing: '-0.3px',
                '&:hover': { 
                  bgcolor: '#2da44e',
                  boxShadow: 'none'
                }
              }}
            >
              분석 결과 보기
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
};

const statusIconMap: Record<string, React.ReactNode> = {
  all:       <GridView sx={{ fontSize: 14 }} />,
  extracting: <HourglassEmpty sx={{ fontSize: 14 }} />,
  verifying: <PendingActions sx={{ fontSize: 14 }} />,
  verified:  <CheckCircle sx={{ fontSize: 14 }} />,
  analyzing: <Analytics sx={{ fontSize: 14 }} />,
  analyzed:  <TaskAlt sx={{ fontSize: 14 }} />,
  failed:    <Error sx={{ fontSize: 14 }} />,
};

const ParsingCardPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const {
    filter, setFilter,
    searchQuery, setSearchQuery,
    dragOver, setDragOver,
    uploadQueue, setUploadQueue,
    drawerFile, setDrawerFile,
    searchDialogOpen, setSearchDialogOpen,
    searchFilters, setSearchFilters,
    filteredAndSorted, counts, isSearchActive, statusCards,
    handleFiles,
  } = useParsingPage();

  // 뷰 모드 (카드 / 리스트)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField | null>('uploadDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  // 📝 노트 관련 상태
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('parsing');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 📝 파일별 노트 개수 계산
  const getNoteCount = (fileId: string): number => {
    return savedNotes.filter(note => 
      note.fileId === fileId && note.content && note.content.trim()
    ).length;
  };

  // 📝 노트 작성 다이얼로그 열기
  const handleNoteClick = (fileId: string) => {
    setCurrentFileId(fileId);
    setNoteDialogOpen(true);
    setNoteContent('');
    setNoteType('parsing');
  };

  // 📝 노트 저장
  const handleNoteSubmit = () => {
    if (!noteContent.trim() || !currentFileId) return;

    const currentFile = filteredAndSorted.find(f => f.id.toString() === currentFileId);
    const newNote = {
      id: Date.now().toString(),
      fileId: currentFileId,
      fileName: currentFile?.name || '알 수 없는 파일',
      type: noteType,
      content: noteContent.trim(),
      timestamp: new Date().toISOString(),
      context: {
        파일명: currentFile?.name,
        상태: currentFile?.status,
        파일크기: currentFile?.fileSize
      }
    };

    setSavedNotes(prev => [...prev, newNote]);
    
    // localStorage에 저장
    const existingNotes = JSON.parse(localStorage.getItem('parsing-notes') || '[]');
    existingNotes.push(newNote);
    localStorage.setItem('parsing-notes', JSON.stringify(existingNotes));
    
    console.log('📝 파싱 노트 저장 완료:', newNote);
    setNoteContent('');
    setNoteDialogOpen(false);
    setCurrentFileId(null);
  };

  // 📝 AI 분석 (검증 페이지와 유사)
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const currentFile = filteredAndSorted.find(f => f.id.toString() === currentFileId);
      const aiSuggestion = `
🤖 **파싱 단계 AI 분석** (${new Date().toLocaleString()})

📁 **파일 정보:**
- 파일명: ${currentFile?.name || '알 수 없음'}
- 상태: ${currentFile?.status || '알 수 없음'}
- 크기: ${currentFile?.fileSize || '0 Bytes'}

🎯 **파싱 상태 분석:**
${currentFile?.status === 'extracting' ? `
⏳ 추출 진행 중
- 현재 진행률: ${currentFile?.progress || 0}%
- 예상 완료 시간: 2-3분
- 권장사항: 추출 완료까지 대기
` : (currentFile?.status === 'verifying' || currentFile?.status === 'verified') ? `
✅ 추출 완료
- 파싱 항목: ${currentFile?.parsedItems || 0}개
- 이상치: ${currentFile?.anomalies || 0}개
- 권장사항: 검증 단계로 진행
` : currentFile?.status === 'failed' ? `
❌ 추출 실패
- 오류 원인: Excel 형식 또는 구조 문제
- 권장사항: 파일 확인 후 재업로드
` : `
📊 분석 준비 중
- 권장사항: 파일 상태 확인 필요
`}

📋 **다음 단계 권고:**
1. ${(currentFile?.status === 'verifying' || currentFile?.status === 'verified') ? '검증 페이지로 이동하여 데이터 정확성 확인' : '파일 상태가 완료될 때까지 대기'}
2. ${currentFile?.anomalies && currentFile.anomalies > 0 ? '이상치 항목 우선 검토' : '표준 검증 프로세스 진행'}
3. 문제 발견시 이 노트에 세부 사항 기록
      `;
      
      setNoteContent(aiSuggestion);
      setIsAnalyzing(false);
    }, 2000);
  };

  // 초기 노트 로드
  useEffect(() => {
    try {
      const savedNotesData = JSON.parse(localStorage.getItem('parsing-notes') || '[]');
      const validNotes = Array.isArray(savedNotesData) ? savedNotesData.filter(note => 
        note && note.id && note.content && note.content.trim().length > 0
      ) : [];
      setSavedNotes(validNotes);
    } catch (error) {
      console.error('파싱 노트 로드 실패:', error);
      setSavedNotes([]);
    }
  }, []);

  return (
    <Box
      className={cardStyles.root}
      sx={{ bgcolor: C.bg }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
    >
      {/* 드래그 오버레이 */}
      {dragOver && (
        <Box className={cardStyles.dragOverlay}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#0064ff' }}>
            파일을 놓으면 업로드됩니다
          </Typography>
        </Box>
      )}

      {/* ── 상단 컨트롤 패널 (고정 영역) ── */}
      <Box className={cardStyles.controlPanel} sx={{ mx: 3, mt: 1.5, mb: 1.5 }}>

        {/* 툴바: 타이틀 | 업로드 버튼 | 검색 | 필터 */}
        <Box className={cardStyles.toolbar} sx={{ px: 2, py: 1.5, gap: 1.5 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: C.dark, whiteSpace: 'nowrap', mr: 0.5 }}>
            견적서 파싱
          </Typography>

          <input
            ref={fileInputRef} type="file" hidden multiple accept=".xlsx,.xls,.jpg,.jpeg,.png"
            onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
          />
          <Button
            variant="contained"
            startIcon={<UploadFile sx={{ fontSize: 17 }} />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600,
              borderRadius: '10px', py: 0.875, px: 3,
              minWidth: '150px',
              bgcolor: '#0064ff', boxShadow: 'none', textTransform: 'none',
              '&:hover': { bgcolor: '#0056d3', boxShadow: 'none' },
            }}
          >
            파일 업로드
          </Button>

          <TextField
            size="small"
            sx={{ flex: 1, minWidth: 100 }}
            placeholder="파일명 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#8b95a1' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px', bgcolor: '#f9fafb', fontSize: 14 },
            }}
          />

          <Button
            variant={isSearchActive ? 'contained' : 'outlined'}
            onClick={() => setSearchDialogOpen(true)}
            sx={{
              whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600,
              borderRadius: '10px', py: 0.875, px: 2, textTransform: 'none',
              ...(isSearchActive
                ? { bgcolor: '#0064ff', boxShadow: 'none', '&:hover': { bgcolor: '#0056d3', boxShadow: 'none' } }
                : { borderColor: '#e5e8eb', color: '#4e5968', bgcolor: 'white', '&:hover': { borderColor: '#0064ff', bgcolor: 'white' } }
              ),
            }}
          >
            <FilterList sx={{ fontSize: 16, mr: 0.5 }} />필터
          </Button>

          {/* 뷰 전환 토글 */}
          <Box sx={{ display: 'flex', borderRadius: '10px', border: '1px solid #e5e8eb', overflow: 'hidden', ml: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('card')}
              sx={{
                borderRadius: 0, px: 1.2,
                bgcolor: viewMode === 'card' ? '#0064ff' : 'white',
                color: viewMode === 'card' ? 'white' : '#8b95a1',
                '&:hover': { bgcolor: viewMode === 'card' ? '#0056d3' : '#f5f5f5' },
              }}
            >
              <ViewModule sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                borderRadius: 0, px: 1.2,
                bgcolor: viewMode === 'list' ? '#0064ff' : 'white',
                color: viewMode === 'list' ? 'white' : '#8b95a1',
                '&:hover': { bgcolor: viewMode === 'list' ? '#0056d3' : '#f5f5f5' },
              }}
            >
              <ViewList sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* 업로드 큐 (파일 선택 시 표시) */}
        {uploadQueue.length > 0 && (
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f2f4f6' }}>
            {uploadQueue.map((q, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: i < uploadQueue.length - 1 ? 0.75 : 0 }}>
                <Typography sx={{ fontSize: 13 }}>📄</Typography>
                <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 500, color: '#191f28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {q.file.name}
                </Typography>
                <Box sx={{ width: 100, height: 3, bgcolor: '#e5e8eb', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ width: `${q.progress}%`, height: '100%', bgcolor: C.blue, borderRadius: 2, transition: 'width 0.3s' }} />
                </Box>
                <Typography sx={{ fontSize: 11, color: C.gray, minWidth: 30, textAlign: 'right' }}>{q.progress}%</Typography>
                <IconButton size="small" onClick={() => setUploadQueue(prev => prev.filter((_, j) => j !== i))}
                  sx={{ width: 20, height: 20, bgcolor: '#e5e5e7', '&:hover': { bgcolor: '#f8d7da', color: C.red } }}>
                  <CloseIcon sx={{ fontSize: 10 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* 상태 필터 (아이콘 칩) */}
        <Box className={cardStyles.statusFilterRow} sx={{ px: 2, py: 1, gap: 1 }}>
          {statusCards.map(sc => (
            <Box
              key={sc.key}
              onClick={() => setFilter(sc.key)}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.75,
                px: 1.5, py: 0.625, borderRadius: '20px',
                bgcolor: filter === sc.key ? `${sc.colorKey}18` : '#f9fafb',
                border: `1.5px solid ${filter === sc.key ? sc.colorKey : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.15s',
                '&:hover': { bgcolor: `${sc.colorKey}12`, borderColor: sc.colorKey },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', color: sc.colorKey }}>
                {statusIconMap[sc.key]}
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: sc.colorKey, lineHeight: 1 }}>
                {counts[sc.key]}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#4e5968', fontWeight: 500, lineHeight: 1 }}>
                {sc.label}
              </Typography>
            </Box>
          ))}
        </Box>

      </Box>

      {/* 📁 파일 그리드 (스크롤 영역) */}
      <Box className={cardStyles.fileGrid} sx={{ px: viewMode === 'card' ? 3 : 0, pt: 1, pb: 3 }}>
        {filteredAndSorted.length === 0 ? (
          <Box className={cardStyles.emptyState} sx={{ py: 12 }}>
            <Typography sx={{ fontSize: 64, mb: 3 }}>📄</Typography>
            <Typography sx={{ 
              fontSize: 20, 
              color: '#191f28', 
              mb: 1,
              fontWeight: 700,
              letterSpacing: '-0.5px'
            }}>
              아직 업로드된 파일이 없어요
            </Typography>
            <Typography sx={{ 
              fontSize: 16, 
              color: '#8b95a1',
              fontWeight: 500,
              lineHeight: 1.6
            }}>
              Excel 파일을 드래그하거나 업로드 버튼을 눌러주세요
            </Typography>
          </Box>
        ) : viewMode === 'card' ? (
          <Grid container spacing={3}>
            {filteredAndSorted.map(file => (
              <Grid item xs={12} sm={6} lg={4} key={file.id}>
                <FileCard
                  file={file}
                  onVerify={() => navigate(`/verification?fileId=${file.id}&fileName=${encodeURIComponent(file.name)}`)}
                  onAnalysis={() => navigate('/analysis')}
                  onDetail={() => setDrawerFile(file)}
                  onRetry={() => {
                    console.log('Retrying file:', file.name);
                  }}
                  onClick={() => setDrawerFile(file)}
                  onNoteClick={handleNoteClick}
                  getNoteCount={getNoteCount}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <FileTable
            files={filteredAndSorted}
            selectedIds={selectedIds}
            sortField={sortField}
            sortDirection={sortDirection}
            onToggleSelect={id => setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; })}
            onToggleAll={() => { if (selectedIds.size === filteredAndSorted.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredAndSorted.map(f => f.id))); }}
            onSort={handleSort}
            onRowClick={f => setDrawerFile(f)}
            onVerify={(fileId, fileName) => navigate(`/verification?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}`)}
            onAnalysis={() => navigate('/analysis')}
            onFailedDetail={f => setDrawerFile(f)}
            onNoteClick={handleNoteClick}
            getNoteCount={getNoteCount}
          />
        )}
      </Box>

      {/* 상세 정보 드로어 */}
      <FileDetailDrawer
        file={drawerFile}
        onClose={() => setDrawerFile(null)}
        onVerify={() => navigate('/verification')}
        onAnalysis={() => navigate('/analysis')}
      />

      {/* 📝 노트 작성 다이얼로그 */}
      <Dialog 
        open={noteDialogOpen} 
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>
            📝 파싱 노트 작성
          </Typography>
          <IconButton onClick={() => setNoteDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* 현재 파일 정보 */}
          {currentFileId && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>파일:</strong> {filteredAndSorted.find(f => f.id.toString() === currentFileId)?.name || '알 수 없음'} |
                <strong> 상태:</strong> {filteredAndSorted.find(f => f.id.toString() === currentFileId)?.status || '알 수 없음'}
              </Typography>
            </Alert>
          )}

          {/* 노트 유형 선택 */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>노트 유형</InputLabel>
            <Select 
              value={noteType} 
              onChange={(e) => setNoteType(e.target.value)}
              label="노트 유형"
            >
              <MenuItem value="parsing">🔍 파싱 이슈</MenuItem>
              <MenuItem value="upload">📤 업로드 문제</MenuItem>
              <MenuItem value="format">📋 파일 형식</MenuItem>
              <MenuItem value="improvement">💡 개선 제안</MenuItem>
            </Select>
          </FormControl>

          {/* AI 분석 제안 버튼 */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={isAnalyzing ? <AIIcon className="animate-spin" /> : <AIIcon />}
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || !currentFileId}
            sx={{ 
              mb: 2, 
              py: 1.5,
              textTransform: 'none',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: '12px',
              borderColor: '#0064ff',
              color: '#0064ff',
              '&:hover': {
                borderColor: '#0056d3',
                bgcolor: 'rgba(0, 100, 255, 0.04)'
              }
            }}
          >
            {isAnalyzing ? 'AI 분석 중...' : 'AI 분석 제안 받기'}
          </Button>

          {/* 노트 작성 영역 */}
          <TextField
            fullWidth
            multiline
            rows={8}
            label="노트 내용"
            placeholder={`예시: 🔍 파싱 이슈 발견:
- Excel 템플릿이 표준과 다름
- 재료비 컬럼 위치 변경됨
- 추가 검토 필요`}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* 📋 노트 히스토리 (다이얼로그 내) */}
          {savedNotes && savedNotes.length > 0 && savedNotes.some(note => note && note.content && note.content.trim()) && currentFileId && (
            <>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  📋 이 파일의 노트 히스토리 ({savedNotes.filter(n => n.fileId === currentFileId && n.content && n.content.trim()).length}개)
                </Typography>
                
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    // 현재 파일의 노트만 삭제
                    const updatedNotes = savedNotes.filter(n => n.fileId !== currentFileId);
                    setSavedNotes(updatedNotes);
                    localStorage.setItem('parsing-notes', JSON.stringify(updatedNotes));
                    console.log('🗑️ 파일 노트 히스토리 초기화');
                  }}
                  sx={{ 
                    fontSize: '10px',
                    py: 0.25,
                    px: 1,
                    minWidth: 'auto'
                  }}
                >
                  초기화
                </Button>
              </Box>
              
              <Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                {savedNotes.filter(note => note.fileId === currentFileId && note.content && note.content.trim()).slice().reverse().map((note, index) => (
                  <Paper 
                    key={note.id} 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      mb: 1.5, 
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    {/* 노트 헤더 */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 1 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip 
                          size="small" 
                          label={
                            note.type === 'parsing' ? '🔍 파싱' : 
                            note.type === 'upload' ? '📤 업로드' : 
                            note.type === 'format' ? '📋 형식' :
                            '💡 개선'
                          } 
                          variant="outlined"
                          sx={{
                            fontSize: '10px',
                            height: '20px',
                            bgcolor: 
                              note.type === 'parsing' ? '#fff3e0' : 
                              note.type === 'upload' ? '#e8f5e8' : 
                              note.type === 'format' ? '#e3f2fd' :
                              '#f3e5f5',
                            color: 
                              note.type === 'parsing' ? '#e65100' : 
                              note.type === 'upload' ? '#2e7d32' : 
                              note.type === 'format' ? '#1565c0' :
                              '#7b1fa2'
                          }}
                        />
                        {index === 0 && (
                          <Chip 
                            size="small" 
                            label="최신" 
                            sx={{ 
                              bgcolor: '#ff5722', 
                              color: 'white',
                              fontSize: '9px',
                              height: '18px'
                            }}
                          />
                        )}
                      </Box>
                      
                      <Typography variant="caption" sx={{ 
                        color: 'text.secondary',
                        fontSize: '10px',
                        fontFamily: 'monospace'
                      }}>
                        {new Date(note.timestamp).toLocaleString('ko-KR', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>

                    {/* 노트 내용 - 스크롤 가능 */}
                    <Box sx={{
                      maxHeight: '100px',
                      overflowY: 'auto',
                      bgcolor: '#fafafa',
                      borderRadius: '6px',
                      p: 1.5,
                      border: '1px solid #f0f0f0',
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        bgcolor: '#f5f5f5',
                        borderRadius: '2px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        bgcolor: '#d0d0d0',
                        borderRadius: '2px',
                        '&:hover': {
                          bgcolor: '#b0b0b0',
                        },
                      },
                    }}>
                      <Typography variant="body2" sx={{ 
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: 'text.primary',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit'
                      }}>
                        {note.content}
                      </Typography>
                    </Box>

                    {/* 컨텍스트 정보 (간단히) */}
                    {note.context && (
                      <Box sx={{ 
                        mt: 1,
                        pt: 1,
                        borderTop: '1px dashed #e0e0e0'
                      }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {note.context.상태 && (
                            <Chip 
                              size="small" 
                              label={`📊 ${note.context.상태}`}
                              variant="outlined"
                              sx={{ fontSize: '9px', height: '16px' }}
                            />
                          )}
                          {note.context.파일크기 && (
                            <Chip 
                              size="small" 
                              label={`📄 ${note.context.파일크기}`}
                              variant="outlined"
                              sx={{ fontSize: '9px', height: '16px' }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNoteDialogOpen(false)}>
            취소
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            onClick={handleNoteSubmit}
            disabled={!noteContent.trim()}
            sx={{
              bgcolor: '#0064ff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#0056d3'
              }
            }}
          >
            노트 저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 검색 필터 다이얼로그 */}
      <SearchFilterDialog
        open={searchDialogOpen}
        filters={searchFilters}
        onChange={setSearchFilters}
        onApply={() => setSearchDialogOpen(false)}
        onReset={() => setSearchFilters({ 
          documentName: '', 
          dateFrom: '', 
          dateTo: '', 
          uploader: '', 
          department: '' 
        })}
        onClose={() => setSearchDialogOpen(false)}
      />
    </Box>
  );
};

export default ParsingCardPage;