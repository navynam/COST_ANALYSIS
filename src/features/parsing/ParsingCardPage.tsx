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
  NoteAdd as NoteAddIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { C } from '../../shared/constants/colors';
import FileUploadArea from './components/FileUploadArea';
import FileDetailDrawer from './components/FileDetailDrawer';
import SearchFilterDialog from './components/SearchFilterDialog';
import { useParsingPage } from './hooks/useParsingPage';

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
      case 'complete':
        return { 
          color: '#4caf50', 
          icon: <CheckCircle sx={{ fontSize: 16 }} />, 
          label: '완료', 
          bgColor: '#e8f5e8' 
        };
      case 'analyzing':
        return { 
          color: '#9c27b0', 
          icon: <Analytics sx={{ fontSize: 16 }} />, 
          label: '분석중', 
          bgColor: '#f3e5f5' 
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
      sx={{ 
        height: '380px', // 더 컴팩트한 고정 높이
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        border: '1px solid #f2f4f6',
        borderRadius: '16px',
        cursor: 'pointer',
        bgcolor: 'white',
        boxShadow: 'none',
        overflow: 'hidden',
        '&:hover': { 
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          borderColor: '#0064ff'
        }
      }}
      onClick={onClick}
    >
      {/* 🎨 Toss 스타일 카드 헤더 - 컴팩트 */}
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* 상태 배지, 파일명 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
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
              sx={{ 
                fontSize: 16, 
                fontWeight: 700, 
                color: '#191f28',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                letterSpacing: '-0.3px'
              }}
              title={file.name}
            >
              {file.name}
            </Typography>
          </Box>
        </Box>

        {/* 📋 Toss 스타일 파일 정보 */}
        <Box sx={{ mb: 2 }}>
          {/* 첫 번째 라인: 파일 크기, 업로드일 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              📁 {formatFileSize(file.size || 0)}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              📅 {file.uploadDate || file.uploadedAt}
            </Typography>
          </Box>
          
          {/* 두 번째 라인: 업로더, 부서 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
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
          {(file.status === 'complete' || file.status === 'analyzing') && (
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
                    정확도
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
        {file.status === 'complete' && (
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
                bgcolor: '#00c896', 
                borderRadius: '12px',
                py: 1.25,
                boxShadow: 'none',
                letterSpacing: '-0.3px',
                '&:hover': { 
                  bgcolor: '#00b085',
                  boxShadow: 'none'
                }
              }}
            >
              상세보기
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
};

const ParsingCardPage: React.FC = () => {
  const navigate = useNavigate();
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
` : currentFile?.status === 'complete' ? `
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
1. ${currentFile?.status === 'complete' ? '검증 페이지로 이동하여 데이터 정확성 확인' : '파일 상태가 완료될 때까지 대기'}
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
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg }}>
      {/* 🎨 기존 파싱 페이지와 동일한 헤더 (배경 없음) */}
      <Box sx={{ px: 3, pt: 2.5 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5, color: C.dark }}>견적서 파싱</Typography>
        <Typography sx={{ fontSize: 13, color: C.gray, mb: 2 }}>파일을 업로드하면 AI가 자동으로 데이터를 추출합니다</Typography>
      </Box>

      {/* 🔄 업로드 영역 */}
        <FileUploadArea
          dragOver={dragOver} 
          uploadQueue={uploadQueue}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { 
            e.preventDefault(); 
            setDragOver(false); 
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); 
          }}
          onFileSelect={handleFiles}
          onRemoveQueue={i => setUploadQueue(prev => prev.filter((_, j) => j !== i))}
        />

      {/* 🔍 Toss 스타일 검색 */}
      <Box sx={{ px: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            fullWidth 
            placeholder="파일명 검색" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: '#8b95a1' }} />
                </InputAdornment>
              ), 
              sx: { 
                fontSize: 16, 
                borderRadius: '12px',
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#f2f4f6' },
                  '&:hover fieldset': { borderColor: '#0064ff' },
                  '&.Mui-focused fieldset': { borderColor: '#0064ff', borderWidth: 2 }
                }
              } 
            }} 
          />
          <Button 
            variant={isSearchActive ? 'contained' : 'outlined'}
            onClick={() => setSearchDialogOpen(true)}
            sx={{ 
              px: 3,
              py: 1.5,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              ...(isSearchActive ? {
                bgcolor: '#0064ff',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0056d3' }
              } : {
                borderColor: '#f2f4f6',
                color: '#4e5968',
                bgcolor: 'white',
                '&:hover': { 
                  borderColor: '#0064ff',
                  bgcolor: 'white'
                }
              })
            }}
          >
            <FilterList sx={{ fontSize: 18, mr: 0.5 }} />
            필터
          </Button>
        </Box>
      </Box>

      {/* 📊 Toss 스타일 상태 카드 */}
      <Box sx={{ px: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {statusCards.map((sc, index) => (
            <Box 
              key={sc.key} 
              onClick={() => setFilter(sc.key)}
              sx={{ 
                flex: 1, 
                bgcolor: 'white',
                border: filter === sc.key ? `2px solid ${sc.colorKey}` : '1px solid #f2f4f6',
                borderRadius: '16px', 
                p: 3, 
                cursor: 'pointer', 
                textAlign: 'center', 
                transition: 'all 0.2s ease',
                '&:hover': { 
                  borderColor: sc.colorKey,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Typography sx={{ 
                fontSize: 36, 
                fontWeight: 800, 
                color: sc.colorKey, 
                mb: 0.5,
                lineHeight: 1,
                letterSpacing: '-1px'
              }}>
                {counts[sc.key]}
              </Typography>
              <Typography sx={{ 
                fontSize: 14, 
                color: '#8b95a1',
                fontWeight: 500
              }}>
                {sc.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 📁 Toss 스타일 파일 그리드 */}
      <Box sx={{ px: 4, pb: 6 }}>
        {filteredAndSorted.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 12,
            bgcolor: 'white',
            borderRadius: '16px',
            border: '1px solid #f2f4f6'
          }}>
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
        ) : (
          <Grid container spacing={3}>
            {filteredAndSorted.map(file => (
              <Grid item xs={12} sm={6} lg={4} key={file.id}>
                <FileCard
                  file={file}
                  onVerify={() => navigate(`/verification?fileId=${file.id}&fileName=${encodeURIComponent(file.name)}`)}
                  onAnalysis={() => navigate('/analysis')}
                  onDetail={() => setDrawerFile(file)}
                  onRetry={() => {
                    // 재시도 로직
                    console.log('Retrying file:', file.name);
                  }}
                  onClick={() => setDrawerFile(file)}
                  onNoteClick={handleNoteClick}
                  getNoteCount={getNoteCount}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* 상세 정보 드로어 */}
      <FileDetailDrawer
        file={drawerFile}
        onClose={() => setDrawerFile(null)}
        onVerify={() => navigate('/verification')}
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