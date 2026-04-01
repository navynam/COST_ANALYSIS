/**
 * 📄 파싱(업로드) 페이지 - 견적서 처리 1단계
 * 
 * 🎯 주요 기능:
 * 1. 드래그앤드롭 파일 업로드 (Excel 파일)
 * 2. AI 자동 파싱 진행률 실시간 표시
 * 3. 파일별 상태 관리 (대기/추출중/검증/분석/실패)
 * 4. 파일 목록 테이블 (검색, 정렬, 필터링)
 * 5. 개별 파일 상세 정보 및 액션 (검증하기, 재시도 등)
 * 
 * 📊 상태별 카드 시스템:
 * - 전체: 모든 파일 개수
 * - 추출: AI 파싱 진행 중 (주황색)
 * - 검증: 파싱 완료, 검증 대기 (초록색)
 * - 분석: 검증 완료, 분석 진행/대기 (보라색)
 * - 실패: 파싱/검증 실패 (빨간색)
 * 
 * 🔧 사용자 액션:
 * - 파일 업로드: 드래그앤드롭 또는 클릭 업로드
 * - 상태 필터링: 카드 클릭으로 해당 상태 파일들만 표시
 * - 검색: 파일명으로 실시간 검색
 * - 일괄 작업: 체크박스로 선택 후 삭제/다운로드
 * - 개별 작업: "검증하기", "상세보기", "재시도" 버튼
 * 
 * 🔗 다음 단계 연동:
 * - "검증하기" 버튼 → 검증 페이지 (/verification)
 * - "상세보기" 버튼 → 분석 페이지 (/analysis)
 * 
 * 💾 상태 관리:
 * - useParsingPage 훅에서 파일 목록, 필터, 검색 등 모든 상태 관리
 * - 실시간 진행률 업데이트 (WebSocket 또는 Polling)
 */
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Checkbox, 
  Button,
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
  IconButton,
  Chip
} from '@mui/material';
import { 
  Search, 
  Delete, 
  Download, 
  FilterList,
  NoteAdd as NoteAddIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { C } from '../../shared/constants/colors';
import FileUploadArea from './components/FileUploadArea';
import FileTable from './components/FileTable';
import FileDetailDrawer from './components/FileDetailDrawer';
import SearchFilterDialog from './components/SearchFilterDialog';
import { useParsingPage } from './hooks/useParsingPage';

const ParsingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filter, setFilter,
    searchQuery, setSearchQuery,
    selectedIds, setSelectedIds,
    dragOver, setDragOver,
    uploadQueue, setUploadQueue,
    drawerFile, setDrawerFile,
    searchDialogOpen, setSearchDialogOpen,
    searchFilters, setSearchFilters,
    sortField, sortDirection,
    filteredAndSorted, counts, isSearchActive, statusCards,
    handleFiles, handleSort,
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

  // 📝 AI 분석
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
      <Box sx={{ px: 3, pt: 2.5 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5, color: C.dark }}>견적서 파싱</Typography>
        <Typography sx={{ fontSize: 13, color: C.gray, mb: 2 }}>파일을 업로드하면 AI가 자동으로 데이터를 추출합니다</Typography>
      </Box>

      <FileUploadArea
        dragOver={dragOver} uploadQueue={uploadQueue}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
        onFileSelect={handleFiles}
        onRemoveQueue={i => setUploadQueue(prev => prev.filter((_, j) => j !== i))}
      />

      {/* 검색 툴바 */}
      <Box sx={{ display: 'flex', gap: 1.25, px: 3, mb: 2 }}>
        <TextField size="small" fullWidth placeholder="문서명으로 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: C.gray }} /></InputAdornment>, sx: { fontSize: 13, bgcolor: '#fff', borderRadius: '8px' } }} />
        <Button variant="outlined" size="small" onClick={() => setSearchDialogOpen(true)}
          sx={{ whiteSpace: 'nowrap', fontSize: 12, borderColor: isSearchActive ? C.blue : C.border, color: isSearchActive ? C.blue : C.dark, bgcolor: isSearchActive ? '#f0f6ff' : 'transparent' }}>
          <FilterList sx={{ fontSize: 16, mr: 0.5 }} />상세조회
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, px: 3, mb: 1.5, alignItems: 'center' }}>
        <Checkbox size="small" checked={selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0}
          onChange={() => { if (selectedIds.size === filteredAndSorted.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredAndSorted.map(f => f.id))); }} />
        <Typography sx={{ fontSize: 12 }}>전체 선택</Typography>
        <Button size="small" startIcon={<Delete sx={{ fontSize: 14 }} />} sx={{ fontSize: 12, ml: 1 }}>일괄 삭제</Button>
        <Button size="small" startIcon={<Download sx={{ fontSize: 14 }} />} sx={{ fontSize: 12 }}>일괄 다운로드</Button>
      </Box>

      {/* 상태 카드 */}
      <Box sx={{ display: 'flex', gap: 1.5, px: 3, mb: 2 }}>
        {statusCards.map(sc => (
          <Box key={sc.key} onClick={() => setFilter(sc.key)}
            sx={{ flex: 1, bgcolor: '#fff', border: `1px solid ${filter === sc.key ? C.blue : C.border}`, borderRadius: '10px', p: 2, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', ...(filter === sc.key && { bgcolor: '#f0f6ff' }), '&:hover': { borderColor: C.blue } }}>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: sc.colorKey, mb: 0.5 }}>{counts[sc.key]}</Typography>
            <Typography sx={{ fontSize: 12, color: C.gray }}>{sc.label}</Typography>
          </Box>
        ))}
      </Box>

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

      <FileDetailDrawer
        file={drawerFile}
        onClose={() => setDrawerFile(null)}
        onVerify={() => navigate('/verification')}
      />

      <SearchFilterDialog
        open={searchDialogOpen}
        filters={searchFilters}
        onChange={setSearchFilters}
        onApply={() => setSearchDialogOpen(false)}
        onReset={() => setSearchFilters({ documentName: '', dateFrom: '', dateTo: '', uploader: '', department: '' })}
        onClose={() => setSearchDialogOpen(false)}
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
          {savedNotes && savedNotes.length > 0 && savedNotes.some((note: any) => note && note.fileId === currentFileId && note.content && note.content.trim()) && currentFileId && (
            <>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  📋 이 파일의 노트 히스토리 ({savedNotes.filter((n: any) => n.fileId === currentFileId && n.content && n.content.trim()).length}개)
                </Typography>
                
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    // 현재 파일의 노트만 삭제
                    const updatedNotes = savedNotes.filter((n: any) => n.fileId !== currentFileId);
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
                {savedNotes.filter((note: any) => note.fileId === currentFileId && note.content && note.content.trim()).slice().reverse().map((note: any, index: number) => (
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
    </Box>
  );
};

export default ParsingPage;
