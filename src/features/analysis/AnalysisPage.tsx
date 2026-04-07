/**
 * 📊 분석 페이지 - 견적서 처리 3단계
 * 
 * 🎯 주요 기능:
 * 1. 파싱된 견적서 데이터의 심층 분석 및 검증
 * 2. 재료비/가공비/제경비 3개 카테고리별 세부 분석
 * 3. 이상치 감지 및 신뢰도 평가
 * 4. 3가지 보기 모드: 표준뷰/리스트뷰/관계도뷰
 * 5. 실시간 데이터 편집 및 계산 재검증
 * 
 * 📋 3가지 뷰 모드:
 * 
 * 🏗️ 표준뷰 (기본):
 * - 재료비/가공비/제경비를 계층별로 표시
 * - 각 항목의 신뢰도와 이상치 여부를 색상으로 표시
 * - 클릭하여 즉석 편집 가능
 * - 총합 및 비율 자동 계산
 * 
 * 📝 리스트뷰:
 * - 모든 항목을 평면 테이블로 표시
 * - 정렬, 필터링, 검색 기능 제공
 * - 대량 데이터 처리에 적합
 * 
 * 🕸️ 관계도뷰:
 * - 항목 간 의존성을 그래프로 시각화
 * - 드래그앤드롭으로 관계 편집 가능
 * - 복잡한 원가 구조 파악에 유용
 * 
 * 🎨 시각적 피드백:
 * - 신뢰도별 색상: 높음(초록), 보통(노랑), 낮음(빨강)
 * - 이상치 배지: ⚠️ 표시 + 상세 설명 팝오버
 * - 실시간 계산: 편집 시 즉시 총합 업데이트
 * 
 * 🔧 인터랙션:
 * - 셀 클릭 → 인라인 편집 모드
 * - 이상치 배지 클릭 → 상세 설명 팝오버
 * - 원본 데이터 버튼 → 원본 Excel 뷰어
 * - 완료 버튼 → 다음 단계 (비교 페이지)
 * 
 * 💾 데이터 구조:
 * - costGroups: 3개 카테고리별 계층 구조 데이터
 * - listData: 평면 테이블용 데이터
 * - summaryRows: 총합 계산 결과
 */
import React from 'react';
import {
  Box, Typography, Paper, Button, Chip, Popover, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, ClickAwayListener, Dialog, DialogTitle, DialogContent, 
  DialogActions, Select, MenuItem, FormControl, InputLabel, Alert, IconButton
} from '@mui/material';
import { NavigateNext, NavigateBefore, NoteAdd as NoteAddIcon, Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { C } from '../../shared/constants/colors';
import { costGroups, summaryRows } from './data/costGroups';
import { listData } from './data/listData';
import LevelBadge from './components/LevelBadge';
import StatusBadge from './components/StatusBadge';
import MiniConfidence from './components/MiniConfidence';
import ListViewRow from './components/ListView';
import RelationView from './components/RelationView';
import ExcelViewerDialog from './components/ExcelViewerDialog';
import GoldenSetView from './components/GoldenSetView';
import { useAnalysisPage } from './hooks/useAnalysisPage';
import {
  tableHeaderSx as tthSx,
  tableHeaderNumSx as tthNumSx,
  tableCellSx as tdSx,
  tableCellNumSx as tdNumSx,
} from '../../shared/styles';
import styles from './AnalysisPage.module.css';

const AnalysisPage: React.FC = () => {
  const {
    navigate,
    activeTab, setActiveTab,
    editCell, setEditCell,
    editValue, setEditValue,
    anomalyAnchor, setAnomalyAnchor,
    originalViewOpen, setOriginalViewOpen,
    highlightedCell,
    calculationAnchor, setCalculationAnchor,
    noteDialogOpen, setNoteDialogOpen,
    noteContent, setNoteContent,
    noteType, setNoteType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    savedNotes: _savedNotes, setSavedNotes,
    totalNotesCount,
    updateTotalNotesCount,
    startEdit, isOverhead, hasExcelData, handleCellClick, handleAmountClick,
    commitEdit, getModifiedCount, handleSaveAllChanges,
  } = useAnalysisPage();

  const [selectedRelationNode, setSelectedRelationNode] = React.useState<any>(null);

  // 리스트뷰 인라인 편집 상태
  const [listEditCell, setListEditCell] = React.useState<{ itemId: string; field: string } | null>(null);
  const [listEditValue, setListEditValue] = React.useState('');

  const handleListStartEdit = (itemId: string, field: string, currentValue: string) => {
    setListEditCell({ itemId, field });
    setListEditValue(currentValue);
  };
  const handleListCommitEdit = () => {
    // TODO: 실제 데이터 업데이트 로직 연결
    console.log('리스트뷰 편집 완료:', listEditCell, listEditValue);
    setListEditCell(null);
  };
  const handleListCancelEdit = () => setListEditCell(null);

  // 📝 노트작성 관련 핸들러
  const handleNoteSubmit = () => {
    if (!noteContent.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      type: noteType,
      content: noteContent,
      timestamp: new Date().toISOString(),
      page: 'analysis',
      fileName: 'HEAD_LINING_원가계산서.xlsx'
    };

    setSavedNotes(prev => [...prev, newNote]);
    
    // localStorage에 저장 (analysis 페이지용)
    const existingNotes = JSON.parse(localStorage.getItem('analysis-notes') || '[]');
    existingNotes.push(newNote);
    localStorage.setItem('analysis-notes', JSON.stringify(existingNotes));
    
    setNoteContent('');
    setNoteDialogOpen(false);
    
    // 노트 개수 업데이트
    updateTotalNotesCount();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg }}>
      {/* Header */}
      <Box className={styles.headerBar} sx={{ borderBottom: `1px solid ${C.border}`, px: 3, py: 2 }}>
        <Box className={styles.headerLeft} sx={{ gap: 1 }}>
          <Typography sx={{ fontSize: 13, color: C.gray }}>분석 &gt;</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>HEAD_LINING_원가계산서</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          {/* ── 현재 페이지 기능 버튼 ── */}
          <Box sx={{ display: 'flex', gap: 1, pr: 1.5, borderRight: '1px solid #e5e5e7' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                // 골든셋 탭으로 이동 후 다운로드
                setActiveTab(3);
                setTimeout(() => {
                  const dlBtn = document.querySelector('[data-excel-download]') as HTMLButtonElement;
                  if (dlBtn) dlBtn.click();
                }, 300);
              }}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: '8px',
                borderColor: '#217346',
                color: '#217346',
                bgcolor: '#f0fdf4',
                px: 1.5,
                '&:hover': { borderColor: '#1a5c38', bgcolor: '#dcfce7', color: '#1a5c38' }
              }}
            >
              📥 엑셀다운로드
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOriginalViewOpen(true)}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: '8px',
                borderColor: '#e5e5e7',
                color: '#6b7280',
                bgcolor: '#fafafa',
                px: 1.5,
                '&:hover': { borderColor: '#d1d5db', bgcolor: '#f3f4f6', color: '#374151' }
              }}
            >
              📄 원본보기
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<NoteAddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setNoteDialogOpen(true)}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: '8px',
                borderColor: '#e5e5e7',
                color: '#6b7280',
                bgcolor: '#fafafa',
                px: 1.5,
                '&:hover': { borderColor: '#d1d5db', bgcolor: '#f3f4f6', color: '#374151' }
              }}
            >
              노트작성 {totalNotesCount > 0 && (
                <Box component="span" sx={{
                  ml: 0.5, px: 0.75, py: 0.1,
                  bgcolor: '#0064ff', color: '#fff',
                  borderRadius: '10px', fontSize: 10, fontWeight: 700, lineHeight: 1.6,
                }}>
                  {totalNotesCount}
                </Box>
              )}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
              onClick={handleSaveAllChanges}
              disabled={getModifiedCount() === 0}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: '8px',
                borderColor: '#e5e5e7',
                color: '#6b7280',
                bgcolor: '#fafafa',
                px: 1.5,
                '&:hover': { borderColor: '#d1d5db', bgcolor: '#f3f4f6', color: '#374151' },
                '&.Mui-disabled': { borderColor: '#e5e5e7', color: '#c0c4cc', bgcolor: '#fafafa' }
              }}
            >
              저장{getModifiedCount() > 0 && (
                <Box component="span" sx={{
                  ml: 0.5, px: 0.75, py: 0.1,
                  bgcolor: '#ff9500', color: '#fff',
                  borderRadius: '10px', fontSize: 10, fontWeight: 700, lineHeight: 1.6,
                }}>
                  {getModifiedCount()}
                </Box>
              )}
            </Button>
          </Box>

          {/* ── 단계 이동 버튼 ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {/* 이전 단계로 */}
            <Button
              variant="text"
              size="small"
              startIcon={<NavigateBefore sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/parsing_card')}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: '8px',
                color: '#8b95a1',
                px: 1.2,
                minWidth: 0,
                '&:hover': { bgcolor: '#f3f4f6', color: '#374151' }
              }}
            >
              목록
            </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<NavigateBefore sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/verification')}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: '8px',
                color: '#8b95a1',
                px: 1.2,
                minWidth: 0,
                '&:hover': { bgcolor: '#f3f4f6', color: '#374151' }
              }}
            >
              검증
            </Button>

            {/* 현재 단계 완료 */}
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                console.log('✅ 분석완료: 파일 상태 → analyzed');
                alert('✅ 분석이 완료되었습니다. 상태가 "분석완료"로 변경되었습니다.');
              }}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: '8px',
                bgcolor: '#0064ff',
                boxShadow: 'none',
                px: 2,
                '&:hover': { bgcolor: '#0056d3', boxShadow: 'none' }
              }}
            >
              분석 완료
            </Button>

            {/* 다음 단계로 */}
            <Button
              variant="contained"
              size="small"
              endIcon={<NavigateNext sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/comparison')}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: '8px',
                bgcolor: '#34c759',
                boxShadow: 'none',
                px: 2,
                '&:hover': { bgcolor: '#28a745', boxShadow: 'none' }
              }}
            >
              비교
            </Button>
          </Box>

        </Box>
      </Box>

      {/* Info Cards - Verification 스타일 */}
      <Box sx={{ display: 'flex', gap: 2, px: 3, py: 2, bgcolor: '#f5f5f7' }}>
        {[
          { label: 'E.O. NO.', value: 'EO-2024-1201' },
          { label: '품번 / 품명', value: 'HL-2024-001 · HEAD LINING' },
          { label: '협력사 / 담당자', value: '대한(주) · 김철수' },
        ].map(c => (
          <Paper key={c.label} sx={{ flex: 1, p: 1.5, borderRadius: '8px', border: '1px solid #e5e5e7', boxShadow: 'none' }}>
            <Typography sx={{ fontSize: 10, color: '#86868b', mb: 0.25 }}>{c.label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{c.value}</Typography>
          </Paper>
        ))}
        <Paper sx={{ flex: '0 0 140px', p: 1.5, borderRadius: '8px', border: '1px solid #e5e5e7', boxShadow: 'none' }}>
          <Typography sx={{ fontSize: 10, color: '#86868b', mb: 0.25 }}>생산원가</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0071e3' }}>₩76,800</Typography>
        </Paper>
      </Box>

      {/* Tab Bar with Status - 통합 */}
      <Box sx={{ borderBottom: `1px solid ${C.border}`, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: 13, fontWeight: 600, textTransform: 'none', px: 2.5 }, '& .Mui-selected': { color: C.blue }, '& .MuiTabs-indicator': { bgcolor: C.blue, height: 2.5 } }}>
          {['표준', '리스트', '관계도', '골든셋'].map(label => <Tab key={label} label={label} />)}
        </Tabs>
        
        {/* Status 정보들 오른쪽 정렬 */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {[
            { label: '수정된 항목', value: '1개', color: C.dark },
            { label: '신뢰도', value: '92%', color: C.green },
            { label: '파싱항목', value: '24건', color: C.dark },
            { label: '이상치', value: '2건', color: C.red },
            { label: '하위 견적서', value: '3개', color: C.dark },
          ].map(s => (
            <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: 12, color: C.gray }}>{s.label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Info Cards는 상단 헤더 아래로 이동됨 */}

        {/* 노트작성 & 원본보기 버튼은 상단 헤더로 이동됨 */}

        {/* ── 표준 뷰 ── */}
        {activeTab === 0 && (
          <>
            {costGroups.map(group => (
              <Paper key={group.id} sx={{ mb: 2, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, bgcolor: group.iconBg, color: group.iconColor }}>{group.icon}</Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{group.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{group.totalAmount}</Typography>
                    <Typography sx={{ fontSize: 13, color: C.gray }}>{group.totalPct}</Typography>
                    {group.anomalyCount > 0 && (
                      <Box sx={{ fontSize: 10, fontWeight: 600, px: 0.75, py: 0.25, borderRadius: '4px', bgcolor: '#f8d7da', color: C.red }}>이상치 {group.anomalyCount}</Box>
                    )}
                  </Box>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell sx={{ ...tthSx, width: 50 }}>레벨</TableCell>
                      <TableCell sx={{ ...tthSx, width: 80 }}>{group.secondColHeader}</TableCell>
                      <TableCell sx={tthSx}>{group.id === 'processing' ? '공정명' : '품명'}</TableCell>
                      {!isOverhead(group.id) && <TableCell sx={tthSx}>규격</TableCell>}
                      {!isOverhead(group.id) && <TableCell sx={{ ...tthSx, width: 50 }}>단위</TableCell>}
                      {!isOverhead(group.id) && <TableCell sx={{ ...tthNumSx, width: 50 }}>수량</TableCell>}
                      {!isOverhead(group.id) && <TableCell sx={{ ...tthNumSx, width: 90 }}>단가</TableCell>}
                      <TableCell sx={{ ...tthNumSx, width: 90 }}>금액</TableCell>
                      <TableCell sx={{ ...tthNumSx, width: 60 }}>비율</TableCell>
                      <TableCell sx={{ ...tthSx, width: 70 }}>신뢰도</TableCell>
                      <TableCell sx={{ ...tthSx, width: 60 }}>상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.rows.map((row, ri) => {
                      const isAnomaly = row.status === 'anomaly';
                      const isSubRow = row.level === 'L1';
                      return (
                        <TableRow key={ri} sx={{
                          ...(isAnomaly && { bgcolor: '#fff8f8 !important', '&:hover td': { bgcolor: '#fff0f0 !important' } }),
                          ...(isSubRow && { '& td': { color: '#666', bgcolor: '#fafcff' } }),
                          '&:hover': { bgcolor: '#f8f9ff' },
                        }}>
                          <TableCell sx={tdSx}><LevelBadge level={row.level} /></TableCell>
                          <TableCell sx={{ ...tdSx, ...(isSubRow && { color: C.gray }) }}>{row.category}</TableCell>
                          <TableCell
                            sx={{ ...tdSx, fontWeight: 500, ...(isSubRow && { pl: 3.5 }), cursor: 'pointer', '&:hover': { bgcolor: '#e8f4fd' } }}
                            onClick={() => handleCellClick(row.name)}
                          >
                            {row.name}
                            {row.hasSub && <Typography component="span" sx={{ fontSize: 11, ml: 1, color: C.blue }}>📎 하위 견적서</Typography>}
                          </TableCell>
                          {!isOverhead(group.id) && <TableCell sx={tdSx}>{row.spec}</TableCell>}
                          {!isOverhead(group.id) && <TableCell sx={tdSx}>{row.unit}</TableCell>}
                          {!isOverhead(group.id) && <TableCell sx={tdNumSx}>{row.qty}</TableCell>}
                          {!isOverhead(group.id) && (
                            <TableCell sx={{ ...tdNumSx, cursor: row.editable ? 'pointer' : 'default', '&:hover': row.editable ? { bgcolor: '#e8f4fd', borderRadius: '4px' } : {} }}
                              onClick={() => row.editable && startEdit(group.id, ri, 'unitPrice', row.unitPrice)}>
                              {editCell?.groupId === group.id && editCell.rowIdx === ri && editCell.field === 'unitPrice' ? (
                                <ClickAwayListener onClickAway={commitEdit}>
                                  <TextField size="small" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditCell(null); }}
                                    sx={{ '& input': { fontSize: 12, p: '4px 8px' } }} />
                                </ClickAwayListener>
                              ) : row.unitPrice}
                            </TableCell>
                          )}
                          <TableCell sx={{ ...tdNumSx, fontWeight: 600, ...(isAnomaly && { color: C.red }), cursor: 'pointer', '&:hover': { bgcolor: '#e8f4fd', borderRadius: '4px' } }}
                            onClick={(e) => {
                              if (row.editable) startEdit(group.id, ri, 'amount', row.amount);
                              else handleAmountClick(e, row, group.title);
                            }}>
                            {editCell?.groupId === group.id && editCell.rowIdx === ri && editCell.field === 'amount' ? (
                              <ClickAwayListener onClickAway={commitEdit}>
                                <TextField size="small" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditCell(null); }}
                                  sx={{ '& input': { fontSize: 12, p: '4px 8px' } }} />
                              </ClickAwayListener>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                {row.amount}
                                <Typography
                                  component="span"
                                  sx={{ fontSize: 10, color: C.gray, ml: 0.5, cursor: 'pointer', '&:hover': { color: C.blue } }}
                                  onClick={(e) => { e.stopPropagation(); handleAmountClick(e, row, group.title); }}
                                >
                                  💡
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell sx={tdNumSx}>{row.ratio}</TableCell>
                          <TableCell sx={tdSx}><MiniConfidence value={row.confidence} /></TableCell>
                          <TableCell sx={tdSx}>
                            {isAnomaly ? (
                              <Box sx={{ cursor: 'pointer' }} onClick={(e) => setAnomalyAnchor({ el: e.currentTarget as HTMLElement, reason: row.anomalyReason || '' })}>
                                <StatusBadge status="anomaly" />
                              </Box>
                            ) : (
                              <StatusBadge status="normal" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            ))}

            {/* Summary */}
            <Paper sx={{ mb: 3, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, bgcolor: C.dark, color: '#fff' }}>Σ</Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>소계 (생산원가)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: C.blue }}>₩76,800</Typography>
                  <Typography sx={{ fontSize: 13, color: C.gray }}>100%</Typography>
                </Box>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={tthSx}>구분</TableCell>
                    <TableCell sx={{ ...tthNumSx, width: 120 }}>금액</TableCell>
                    <TableCell sx={{ ...tthNumSx, width: 80 }}>비율</TableCell>
                    <TableCell sx={{ ...tthSx, width: 200 }}>구성</TableCell>
                    <TableCell sx={{ ...tthSx, width: 80 }}>이상치</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaryRows.map(sr => (
                    <TableRow key={sr.label}>
                      <TableCell sx={{ ...tdSx, fontWeight: 600 }}>{sr.label}</TableCell>
                      <TableCell sx={{ ...tdNumSx, fontWeight: 600 }}>{sr.amount}</TableCell>
                      <TableCell sx={tdNumSx}>{sr.pct}</TableCell>
                      <TableCell sx={tdSx}>
                        <Box sx={{ display: 'flex', height: 8, bgcolor: '#e5e5e7', borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ width: `${sr.barWidth}%`, bgcolor: sr.barColor, height: '100%' }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...tdSx, fontWeight: sr.anomalies ? 600 : 400, color: sr.anomalies ? C.red : C.gray }}>{sr.anomalies}건</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f0f4ff' }}>
                    <TableCell sx={{ ...tdSx, fontWeight: 700 }}>합계</TableCell>
                    <TableCell sx={{ ...tdSx, fontWeight: 700, color: C.blue, fontSize: 15 }}>₩76,800</TableCell>
                    <TableCell sx={{ ...tdSx, fontWeight: 700 }}>100%</TableCell>
                    <TableCell sx={tdSx}>
                      <Box sx={{ display: 'flex', height: 8, bgcolor: '#e5e5e7', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ width: '58.9%', bgcolor: C.blue, height: '100%' }} />
                        <Box sx={{ width: '30.1%', bgcolor: C.green, height: '100%' }} />
                        <Box sx={{ width: '11.1%', bgcolor: C.orange, height: '100%' }} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...tdSx, color: C.red, fontWeight: 700 }}>2건</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </>
        )}

        {/* ── 리스트 뷰 ── */}
        {activeTab === 1 && (
          <>
            {listData.map(group => (
              <Paper key={group.id} sx={{ mb: 2, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 1.75, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}` }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, bgcolor: group.iconBg, color: group.iconColor }}>{group.icon}</Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{group.title}</Typography>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell sx={{ ...tthSx, width: 100 }}>구분</TableCell>
                      <TableCell sx={tthSx}>품명</TableCell>
                      <TableCell sx={tthSx}>규격</TableCell>
                      <TableCell sx={{ ...tthSx, width: 50 }}>단위</TableCell>
                      <TableCell sx={{ ...tthSx, width: 50 }}>수량</TableCell>
                      <TableCell sx={{ ...tthSx, width: 80 }}>단가</TableCell>
                      <TableCell sx={{ ...tthSx, width: 80 }}>금액</TableCell>
                      <TableCell sx={{ ...tthSx, width: 60 }}>비율</TableCell>
                      <TableCell sx={{ ...tthSx, width: 70 }}>신뢰도</TableCell>
                      <TableCell sx={{ ...tthSx, width: 60 }}>상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map(item => (
                      <ListViewRow key={item.id} item={item} onCellClick={handleCellClick} onAmountClick={handleAmountClick} onAnomalyClick={(el, reason) => setAnomalyAnchor({ el, reason })} groupTitle={group.title}
                        editCell={listEditCell} editValue={listEditValue} onStartEdit={handleListStartEdit} onEditValueChange={setListEditValue} onCommitEdit={handleListCommitEdit} onCancelEdit={handleListCancelEdit} />
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            ))}
          </>
        )}

        {/* ── 관계도 뷰 ── */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Paper sx={{ flex: 1, borderRadius: '10px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden', minWidth: 0 }}>
              <Box sx={{ px: 2.5, py: 1.75, bgcolor: '#f9f9fb', borderBottom: `1px solid ${C.border}` }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>🔗 원가 구조 관계도</Typography>
                <Typography sx={{ fontSize: 11, color: C.gray }}>노드 간 관계와 이상치를 시각적으로 확인합니다</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <RelationView
                  listData={listData}
                  onNodeSelect={(node) => setSelectedRelationNode(node)}
                />
              </Box>
            </Paper>

            {/* ── 우측 상세 패널 ── */}
            {selectedRelationNode && (
              <Paper sx={{
                width: 280, flexShrink: 0, borderRadius: '10px',
                border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden',
                position: 'sticky', top: 16,
              }}>
                {/* 패널 헤더 */}
                <Box sx={{
                  px: 2, py: 1.5, bgcolor: '#f9f9fb',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.dark }}>상세 정보</Typography>
                  <IconButton size="small" onClick={() => setSelectedRelationNode(null)} sx={{ width: 22, height: 22 }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>

                {/* 패널 본문 */}
                <Box sx={{ p: 2 }}>
                  {/* 상태 + 이름 */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{
                      display: 'inline-block', px: 1, py: 0.25, borderRadius: '4px', mb: 0.75,
                      bgcolor: selectedRelationNode.status === 'anomaly' ? '#fff0f0' : '#f0fdf4',
                      border: `1px solid ${selectedRelationNode.status === 'anomaly' ? '#fca5a5' : '#86efac'}`,
                    }}>
                      <Typography sx={{
                        fontSize: 10, fontWeight: 700,
                        color: selectedRelationNode.status === 'anomaly' ? '#dc2626' : '#16a34a',
                      }}>
                        {selectedRelationNode.status === 'anomaly' ? '⚠️ 이상치' : '✅ 정상'}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.dark, lineHeight: 1.3 }}>
                      {selectedRelationNode.label}
                    </Typography>
                    {selectedRelationNode.sub && (
                      <Typography sx={{ fontSize: 11, color: C.gray, mt: 0.5 }}>{selectedRelationNode.sub}</Typography>
                    )}
                  </Box>

                  {/* 금액 */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f9fafb', borderRadius: '8px' }}>
                    <Typography sx={{ fontSize: 10, color: C.gray, mb: 0.5 }}>금액</Typography>
                    <Typography sx={{
                      fontSize: 20, fontWeight: 800,
                      color: selectedRelationNode.status === 'anomaly' ? '#dc2626' : C.blue,
                    }}>
                      {selectedRelationNode.amount}
                    </Typography>
                    {selectedRelationNode.detail && (
                      <Typography sx={{ fontSize: 11, color: C.gray, mt: 0.25 }}>비율: {selectedRelationNode.detail}</Typography>
                    )}
                  </Box>

                  {/* 신뢰도 */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: 11, color: C.gray }}>신뢰도</Typography>
                      <Typography sx={{
                        fontSize: 11, fontWeight: 700,
                        color: selectedRelationNode.confidence >= 90 ? '#16a34a' : selectedRelationNode.confidence >= 70 ? '#d97706' : '#dc2626',
                      }}>
                        {selectedRelationNode.confidence}%
                      </Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{
                        width: `${selectedRelationNode.confidence}%`, height: '100%', borderRadius: 3,
                        bgcolor: selectedRelationNode.confidence >= 90 ? '#22c55e' : selectedRelationNode.confidence >= 70 ? '#f59e0b' : '#ef4444',
                        transition: 'width 0.4s ease',
                      }} />
                    </Box>
                  </Box>

                  {/* 항목 세부 정보 (레벨 2 이상) */}
                  {selectedRelationNode.level >= 2 && (
                    <Box sx={{ borderTop: `1px solid ${C.border}`, pt: 1.5, mb: 2 }}>
                      {selectedRelationNode.spec && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography sx={{ fontSize: 11, color: C.gray }}>규격</Typography>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.dark }}>{selectedRelationNode.spec}</Typography>
                        </Box>
                      )}
                      {selectedRelationNode.qty && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography sx={{ fontSize: 11, color: C.gray }}>수량</Typography>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.dark }}>{selectedRelationNode.qty} {selectedRelationNode.unit}</Typography>
                        </Box>
                      )}
                      {selectedRelationNode.unitPrice && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography sx={{ fontSize: 11, color: C.gray }}>단가</Typography>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.dark }}>₩{selectedRelationNode.unitPrice}</Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* AI 판단근거 (이상치인 경우) */}
                  {selectedRelationNode.status === 'anomaly' && selectedRelationNode.anomalyReason && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fff5f5', borderRadius: '8px', border: '1px solid #fca5a520' }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.orange, mb: 0.75 }}>
                        🤖 AI 판단 근거
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#7f1d1d', lineHeight: 1.6 }}>
                        {selectedRelationNode.anomalyReason}
                      </Typography>
                    </Box>
                  )}

                  {/* 원본 보기 버튼 */}
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={!hasExcelData(selectedRelationNode.label)}
                    onClick={() => handleCellClick(selectedRelationNode.label)}
                    sx={{
                      fontSize: 12, fontWeight: 600, textTransform: 'none',
                      borderRadius: '8px', borderColor: C.blue, color: C.blue,
                      '&:hover': { bgcolor: 'rgba(0,100,255,0.04)', borderColor: C.blue },
                      '&.Mui-disabled': { borderColor: '#d1d5db', color: '#9ca3af' },
                    }}
                  >
                    📄 원본 데이터 보기
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* ── 골든셋 뷰 ── */}
        {activeTab === 3 && <GoldenSetView />}

        {/* 원본보기 다이얼로그 */}
        <ExcelViewerDialog 
          open={originalViewOpen} 
          onClose={() => setOriginalViewOpen(false)} 
          highlightedCell={highlightedCell}
          fileName="sample_data.xlsx"
          // excelUrl="/sample_excel/sample_data.xlsx" // URL 로드 시 CORS 오류 발생
          // excelFile={uploadedFile} // 업로드된 File 객체 (향후 기능)
        />

        {/* 📝 노트작성 다이얼로그 */}
        <Dialog
          open={noteDialogOpen}
          onClose={() => setNoteDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NoteAddIcon color="primary" />
              <Typography variant="h6">📝 분석 노트 작성</Typography>
            </Box>
            <IconButton onClick={() => setNoteDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 1 }}>
            {/* 📊 현재 분석 상태 요약 */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>분석 페이지:</strong> HEAD_LINING_원가계산서.xlsx |
                총 {listData.length}개 항목 분석 중
              </Typography>
            </Alert>

            {/* 🎯 노트 유형 선택 */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>노트 유형</InputLabel>
              <Select
                value={noteType}
                label="노트 유형"
                onChange={(e) => setNoteType(e.target.value)}
              >
                <MenuItem value="analysis">📊 분석 결과</MenuItem>
                <MenuItem value="anomaly">⚠️ 이상치 발견</MenuItem>
                <MenuItem value="calculation">🧮 계산 검증</MenuItem>
                <MenuItem value="improvement">💡 개선 제안</MenuItem>
              </Select>
            </FormControl>

            {/* 📝 노트 내용 작성 */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="노트 내용"
              placeholder="분석 결과, 이상치, 개선사항 등을 자유롭게 기록하세요..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              sx={{ mb: 2 }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setNoteDialogOpen(false)}>
              취소
            </Button>
            <Button 
              variant="contained" 
              onClick={handleNoteSubmit}
              disabled={!noteContent.trim()}
            >
              노트 저장
            </Button>
          </DialogActions>
        </Dialog>

        {/* 목록으로/검증으로 버튼은 상단 헤더로 이동됨 */}
      </Box>

      {/* Anomaly Reason Popover */}
      <Popover open={!!anomalyAnchor} anchorEl={anomalyAnchor?.el} onClose={() => setAnomalyAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        <Box sx={{ bgcolor: C.dark, color: '#fff', borderRadius: '8px', p: 1.5, maxWidth: 260, fontSize: 12, lineHeight: 1.5 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.75, color: C.orange, fontSize: 12 }}>🤖 AI 판단 근거</Typography>
          <Typography sx={{ fontSize: 12, color: '#ddd' }}>{anomalyAnchor?.reason}</Typography>
        </Box>
      </Popover>

      {/* Calculation Popover */}
      <Popover open={!!calculationAnchor} anchorEl={calculationAnchor?.el} onClose={() => setCalculationAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {calculationAnchor && (
          <Paper sx={{ maxWidth: 400, bgcolor: '#fff', borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: C.blue, color: '#fff', p: 2 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>🧮 계산식 상세 정보</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 12, color: C.gray, mb: 1 }}>{calculationAnchor.groupTitle} &gt; {calculationAnchor.row.category}</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: C.dark, mb: 0.5 }}>{calculationAnchor.row.name}</Typography>
                {calculationAnchor.row.spec && <Typography sx={{ fontSize: 12, color: C.gray }}>규격: {calculationAnchor.row.spec}</Typography>}
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.blue, mb: 1.5 }}>💰 계산 과정</Typography>
                {calculationAnchor.row.qty && calculationAnchor.row.unitPrice ? (
                  <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: '8px', border: `1px solid ${C.border}`, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>수량</Typography>
                      <Typography sx={{ fontSize: 14, fontFamily: 'monospace' }}>{calculationAnchor.row.qty} {calculationAnchor.row.unit}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>단가</Typography>
                      <Typography sx={{ fontSize: 14, fontFamily: 'monospace' }}>₩{calculationAnchor.row.unitPrice}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>가중치</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 14, fontFamily: 'monospace' }}>{calculationAnchor.row.status === 'anomaly' ? '1.2' : '1.0'}</Typography>
                        {calculationAnchor.row.status === 'anomaly' && (
                          <Chip label="이상치 조정" size="small" sx={{ bgcolor: '#ffebee', color: C.red, fontSize: '10px', height: 20 }} />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ bgcolor: '#fff', p: 1.5, borderRadius: '6px', border: `2px solid ${C.blue}`, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: C.blue }}>
                        {calculationAnchor.row.qty} × ₩{calculationAnchor.row.unitPrice} × {calculationAnchor.row.status === 'anomaly' ? '1.2' : '1.0'} = ₩{calculationAnchor.row.amount}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: '8px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 600, color: C.orange }}>고정 배분액 = ₩{calculationAnchor.row.amount}</Typography>
                    <Typography sx={{ fontSize: 12, color: C.gray, mt: 0.5 }}>수량/단가 기반이 아닌 일괄 배분 비용</Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 2, borderTop: `1px solid ${C.border}` }}>
                <Box>
                  <Typography sx={{ fontSize: 11, color: C.gray, mb: 0.5 }}>전체 대비 비율</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{calculationAnchor.row.ratio}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: C.gray, mb: 0.5 }}>AI 신뢰도</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{calculationAnchor.row.confidence}%</Typography>
                    <Box sx={{ width: 40, height: 6, bgcolor: '#e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ width: `${calculationAnchor.row.confidence}%`, height: '100%', bgcolor: calculationAnchor.row.confidence >= 90 ? C.green : calculationAnchor.row.confidence >= 70 ? C.orange : C.red }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
              {calculationAnchor.row.status === 'anomaly' && calculationAnchor.row.anomalyReason && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#fff5f5', border: `1px solid ${C.red}20`, borderRadius: '8px' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.red, mb: 0.5 }}>⚠️ 이상치 감지</Typography>
                  <Typography sx={{ fontSize: 12, color: C.red }}>{calculationAnchor.row.anomalyReason}</Typography>
                </Box>
              )}
              <Typography 
                sx={{ 
                  fontSize: 10, 
                  color: C.gray, 
                  textAlign: 'center', 
                  mt: 2, 
                  pt: 1, 
                  borderTop: `1px solid ${C.border}`,
                  cursor: 'pointer',
                  '&:hover': {
                    color: C.blue,
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => setCalculationAnchor(null)}
              >
                클릭하여 닫기
              </Typography>
            </Box>
          </Paper>
        )}
      </Popover>
    </Box>
  );
};

export default AnalysisPage;
