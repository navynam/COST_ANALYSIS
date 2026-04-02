/**
 * ✅ 파싱 데이터 검증 페이지 - 견적서 처리 2단계
 *
 * 🎯 핵심 기능:
 * 1. 왼쪽: 파싱된 데이터 (analysis 페이지와 동일한 3가지 뷰)
 * 2. 오른쪽: 실제 Excel 원본
 * 3. 클릭 매핑: 왼쪽 데이터 클릭 시 오른쪽 Excel 셀 하이라이트
 * 4. 리사이즈 가능한 분할 화면 (중간 바 드래그)
 * 5. 시각적 검증: 파싱 정확도를 한 눈에 확인
 *
 * 📊 2가지 뷰 모드:
 * - 표준뷰: 카테고리별 계층 구조
 * - 리스트뷰: 평면 테이블 형태
 *
 * 🔍 검증 특화 기능:
 * - Excel 셀 매핑: 클릭 시 원본 위치 하이라이트
 * - 신뢰도 표시: 파싱 정확도별 색상 코딩
 * - 실시간 비교: 좌우 화면에서 동시 확인
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Card,
  CardContent,
  Grid,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  ClickAwayListener,
  Popover,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Fullscreen as FullscreenIcon,
  InsertDriveFile as ExcelIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NavigateBefore,
  NoteAdd as NoteAddIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ExcelViewerDialog from '../analysis/components/ExcelViewerDialog';

// ✅ 셀 데이터 타입 (수정 기능 포함)
interface CellData {
  value: string | number;
  cell: string;
  originalValue?: string | number; // 원본값
  isModified?: boolean; // 수정 여부
  modifiedBy?: string; // 수정자
  modifiedAt?: string; // 수정 시간
}

// ✅ 재료비 항목 타입 (컬럼별 Excel 위치)
interface MaterialCostItem {
  id: string;
  category: '재료비';
  구분: CellData;
  품명: CellData;
  규격: CellData;
  단위: CellData;
  수량: CellData;
  단가: CellData;
  금액: CellData;
}

// ✅ 가공비 항목 타입 (컬럼별 Excel 위치)
interface ProcessCostItem {
  id: string;
  category: '가공비';
  공정: CellData;
  공정명: CellData;
  인원: CellData;
  적용CT: CellData;
  임율: CellData;
  금액: CellData;
}

// ✅ 경비 항목 타입 (컬럼별 Excel 위치)
interface OverheadCostItem {
  id: string;
  category: '경비';
  기종: CellData;
  CT: CellData;
  경비: CellData;
  금액: CellData;
}

// ✅ 통합 타입
type CostItem = MaterialCostItem | ProcessCostItem | OverheadCostItem;

interface CostGroup {
  category: '재료비' | '가공비' | '경비';
  items: CostItem[];
  total: number;
  color: string;
}

// ✅ 메인 컴포넌트
const ParsedDataReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 📄 파일 정보 (URL 파라미터에서 가져옴)
  const fileId = searchParams.get('fileId') || 'demo_file_001';
  const fileName = searchParams.get('fileName') || 'sample_data.xlsx';

  // 📄 파일 메타 정보 (실제로는 파싱된 데이터나 API에서 가져와야 함)
  const [fileMetadata, setFileMetadata] = useState({
    coNumber: 'CO-2024-001',
    partNumber: 'HL-2024-001',
    partName: 'HEAD LINING ASSY',
    supplier: '대리(주)',
    manager: '원장수',
    uploadDate: '2024-03-27',
    fileSize: '125 KB'
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CostItem | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<string>('');
  const [excelViewerOpen, setExcelViewerOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // 왼쪽 패널 너비 (%)
  const [isResizing, setIsResizing] = useState(false);
  const [costGroups, setCostGroups] = useState<CostGroup[]>([]);

  // 🔧 편집 모드 상태
  const [editingCell, setEditingCell] = useState<{
    itemId: string;
    fieldName: string;
    value: string | number;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // 🔧 Excel 재매핑 관련 상태
  const [isRemappingMode, setIsRemappingMode] = useState(false);

  // 📝 노트작성 관련 상태
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('parsing'); // 'parsing' | 'validation' | 'improvement'
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);




  // 리사이징 관련 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ 데모 데이터 로드 (Analysis와 동일한 구조)
  useEffect(() => {
    loadAnalysisData();
  }, []);

  // 📐 컬럼별 최소 너비 계산
  const getFieldWidth = (fieldName: string): string => {
    switch (fieldName) {
      case '구분':
      case '단위':
        return '60px';
      case '공정':
      case 'CT':
        return '50px';
      case '수량':
      case '인원':
        return '70px';
      case '단가':
      case '임율':
      case '적용CT':
        return '80px';
      case '금액':
      case '경비':
        return '100px';
      case '품명':
      case '공정명':
      case '기종':
        return '120px';
      case '규격':
        return '100px';
      default:
        return '80px';
    }
  };

  // 📐 컬럼별 최대 너비 계산
  const getFieldMaxWidth = (fieldName: string): string => {
    switch (fieldName) {
      case '구분':
      case '단위':
      case '공정':
      case 'CT':
        return '80px';
      case '수량':
      case '인원':
        return '90px';
      case '단가':
      case '임율':
      case '적용CT':
        return '120px';
      case '금액':
      case '경비':
        return '150px';
      case '품명':
      case '공정명':
      case '기종':
        return '200px';
      case '규격':
        return '160px';
      default:
        return '150px';
    }
  };

  // 🔽 아코디언 상태 관리 (localStorage 연동)
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>(() => {
    const saved = localStorage.getItem('cost-analysis-expanded-categories');
    return saved ? JSON.parse(saved) : {
      '재료비': true,
      '가공비': true,
      '경비': true
    };
  });

  // 🔽 카테고리 펼치기/접기 토글
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newState = {
        ...prev,
        [category]: !prev[category]
      };

      // localStorage에 저장
      localStorage.setItem('cost-analysis-expanded-categories', JSON.stringify(newState));
      console.log(`📁 ${category} ${prev[category] ? '접기' : '펼치기'}`);

      return newState;
    });
  };

  // 🎨 편집 가능한 셀 컴포넌트
  const EditableCell: React.FC<{
    cellData: CellData;
    item: CostItem;
    fieldName: string;
    className?: string;
    isNumeric?: boolean;
  }> = ({ cellData, item, fieldName, className = '', isNumeric = false }) => {
    const isEditing = editingCell?.itemId === item.id && editingCell.fieldName === fieldName;
    const isModified = cellData.isModified;

    if (isEditing) {
      return (
        <TableCell
          className={className}
          sx={{
            position: 'relative',
            minWidth: 'fit-content',
            backgroundColor: 'primary.light',
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: 2,
            py: 0.25,  // 상하 패딩 최소화
            px: 0.5    // 좌우 패딩 최소화
          }}
        >
          <ClickAwayListener onClickAway={() => {
            // 재매핑 모드일 때는 클릭 외부 취소 비활성화
            if (isRemappingMode) {
              console.log('🔒 재매핑 모드: ClickAway 무시');
              return;
            }
            handleEditCancel();
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,  // 1 → 0.5 (간격 50% 감소)
              minWidth: 'max-content',
              p: 0.5     // 1 → 0.5 (패딩 50% 감소)
            }}>
              <TextField
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEditSave();
                  } else if (e.key === 'Escape') {
                    handleEditCancel();
                  }
                }}
                size="small"
                type={isNumeric ? 'number' : 'text'}
                autoFocus
                variant="outlined"
                sx={{
                  minWidth: getFieldWidth(fieldName),
                  maxWidth: getFieldMaxWidth(fieldName),
                  width: 'auto',
                  '& .MuiInputBase-input': {
                    padding: '4px 6px',  // 6px 8px → 4px 6px (패딩 감소)
                    fontSize: '13px',    // 14px → 13px (폰트 크기 감소)
                    textAlign: isNumeric ? 'right' : 'left'
                  },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&.Mui-focused': {
                      backgroundColor: 'primary.light'
                    }
                  }
                }}
              />

              {/* 💡 편집 안내 - 컴팩트 */}
              <Box
                sx={{
                  fontSize: '10px',     // 10px로 복원
                  color: 'text.disabled',
                  textAlign: 'center',
                  fontFamily: 'monospace',  // 고정폭 폰트로 정렬
                  lineHeight: 0.9,      // 라인 높이 최소
                  opacity: 0.7,         // 더 투명하게
                  mt: -0.1              // 간격 더 줄이기
                }}
              >
                ↵저장 ⎋취소
              </Box>
            </Box>
          </ClickAwayListener>
        </TableCell>
      );
    }

    return (
      <TableCell
        className={className}
        sx={{
          cursor: 'pointer',
          backgroundColor: highlightedCell === cellData.cell ? 'primary.light' :
                          isModified ? 'warning.light' : 'inherit',
          color: isModified ? 'warning.dark' : 'inherit',
          fontWeight: isModified ? 600 : 'inherit',
          position: 'relative',
          userSelect: 'none',
          '&:hover': {
            backgroundColor: 'action.hover',
            '&::before': {
              content: '"더블클릭으로 편집"',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '10px',
              color: 'primary.main',
              bgcolor: 'rgba(255,255,255,0.9)',
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              border: '1px solid',
              borderColor: 'primary.main',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCellClick(item, cellData.cell, cellData.value);
          console.log(`👆 단일 클릭: ${fieldName}`);
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`🔥 더블클릭 감지! 필드: ${fieldName}, 값: ${cellData.value}`);
          handleCellDoubleClick(item, fieldName, cellData);
        }}
      >
        <span>
          {isNumeric ?
            (typeof cellData.value === 'number' ? cellData.value.toLocaleString() : cellData.value) +
            (fieldName === '단가' || fieldName === '금액' || fieldName === '임율' || fieldName === '경비' ? '원' :
             fieldName === 'CT' || fieldName === '적용CT' ? '초' :
             fieldName === '인원' ? '명' : '') :
            cellData.value
          }
          {isModified && (
            <Chip
              size="small"
              label="수정됨"
              color="warning"
              sx={{
                ml: 0.5,
                height: 16,
                fontSize: '10px',
                '& .MuiChip-label': { px: 0.5 }
              }}
            />
          )}
        </span>
        {isModified && (
          <Tooltip title={`원본: ${cellData.originalValue} → 수정: ${cellData.value}`} arrow>
            <Box sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'warning.main'
            }} />
          </Tooltip>
        )}
      </TableCell>
    );
  };

  const loadAnalysisData = () => {
    // 실제 견적서 항목들 (컬럼별 Excel 위치)
    const demoItems: CostItem[] = [
      // 재료비
      {
        id: '1', category: '재료비',
        구분: { value: '소재', cell: 'B15', originalValue: '소재' },
        품명: { value: '인서트필름', cell: 'C15', originalValue: '인서트필름' },
        규격: { value: '100x50x0.5', cell: 'D15', originalValue: '100x50x0.5' },
        단위: { value: 'EA', cell: 'E15', originalValue: 'EA' },
        수량: { value: 10, cell: 'F15', originalValue: 10 },
        단가: { value: 12.05, cell: 'G15', originalValue: 12.05 },
        금액: { value: 120.5, cell: 'H15', originalValue: 120.5 }
      },
      {
        id: '2', category: '재료비',
        구분: { value: '부품', cell: 'B16', originalValue: '부품' },
        품명: { value: 'PAD-ANTINOISE', cell: 'C16', originalValue: 'PAD-ANTINOISE' },
        규격: { value: '80x40x2', cell: 'D16', originalValue: '80x40x2' },
        단위: { value: 'EA', cell: 'E16', originalValue: 'EA' },
        수량: { value: 5, cell: 'F16', originalValue: 5 },
        단가: { value: 17.0, cell: 'G16', originalValue: 17.0 },
        금액: { value: 85.0, cell: 'H16', originalValue: 85.0 }
      },
      {
        id: '3', category: '재료비',
        구분: { value: '체결재', cell: 'B17', originalValue: '체결재' },
        품명: { value: 'TAPPING-SCREW', cell: 'C17', originalValue: 'TAPPING-SCREW' },
        규격: { value: 'M5x20', cell: 'D17', originalValue: 'M5x20' },
        단위: { value: 'EA', cell: 'E17', originalValue: 'EA' },
        수량: { value: 8, cell: 'F17', originalValue: 8 },
        단가: { value: 5.65, cell: 'G17', originalValue: 5.65 },
        금액: { value: 45.2, cell: 'H17', originalValue: 45.2 }
      },
      {
        id: '4', category: '재료비',
        구분: { value: '체결재', cell: 'B18', originalValue: '체결재' },
        품명: { value: 'FASTENER CLIP', cell: 'C18', originalValue: 'FASTENER CLIP' },
        규격: { value: 'TYPE-A', cell: 'D18', originalValue: 'TYPE-A' },
        단위: { value: 'EA', cell: 'E18', originalValue: 'EA' },
        수량: { value: 4, cell: 'F18', originalValue: 4 },
        단가: { value: 8.2, cell: 'G18', originalValue: 8.2 },
        금액: { value: 32.8, cell: 'H18', originalValue: 32.8 }
      },
      // 가공비
      {
        id: '5', category: '가공비',
        공정: { value: 'P01', cell: 'B20', originalValue: 'P01' },
        공정명: { value: '사출성형', cell: 'C20', originalValue: '사출성형' },
        인원: { value: 2, cell: 'D20', originalValue: 2 },
        적용CT: { value: 45, cell: 'E20', originalValue: 45 },
        임율: { value: 55.56, cell: 'F20', originalValue: 55.56 },
        금액: { value: 2500, cell: 'G20', originalValue: 2500 }
      },
      {
        id: '6', category: '가공비',
        공정: { value: 'P02', cell: 'B21', originalValue: 'P02' },
        공정명: { value: '조립', cell: 'C21', originalValue: '조립' },
        인원: { value: 1, cell: 'D21', originalValue: 1 },
        적용CT: { value: 30, cell: 'E21', originalValue: 30 },
        임율: { value: 40.0, cell: 'F21', originalValue: 40.0 },
        금액: { value: 1200, cell: 'G21', originalValue: 1200 }
      },
      {
        id: '7', category: '가공비',
        공정: { value: 'P03', cell: 'B22', originalValue: 'P03' },
        공정명: { value: '검사', cell: 'C22', originalValue: '검사' },
        인원: { value: 1, cell: 'D22', originalValue: 1 },
        적용CT: { value: 20, cell: 'E22', originalValue: 20 },
        임율: { value: 40.0, cell: 'F22', originalValue: 40.0 },
        금액: { value: 800, cell: 'G22', originalValue: 800 }
      },
      // 경비
      {
        id: '8', category: '경비',
        기종: { value: 'HEAD_LINING', cell: 'B25', originalValue: 'HEAD_LINING' },
        CT: { value: 45, cell: 'C25', originalValue: 45 },
        경비: { value: 333.33, cell: 'D25', originalValue: 333.33 },
        금액: { value: 15000, cell: 'E25', originalValue: 15000 }
      },
      {
        id: '9', category: '경비',
        기종: { value: 'HEAD_LINING', cell: 'B26', originalValue: 'HEAD_LINING' },
        CT: { value: 30, cell: 'C26', originalValue: 30 },
        경비: { value: 283.33, cell: 'D26', originalValue: 283.33 },
        금액: { value: 8500, cell: 'E26', originalValue: 8500 }
      }
    ] as CostItem[];

    // 카테고리별 그룹화
    const groups: CostGroup[] = [
      {
        category: '재료비',
        items: demoItems.filter(item => item.category === '재료비'),
        total: 0,
        color: '#2196f3'
      },
      {
        category: '가공비',
        items: demoItems.filter(item => item.category === '가공비'),
        total: 0,
        color: '#ff9800'
      },
      {
        category: '경비',
        items: demoItems.filter(item => item.category === '경비'),
        total: 0,
        color: '#4caf50'
      }
    ];

    // 총합 계산
    groups.forEach(group => {
      group.total = group.items.reduce((sum, item) => sum + Number(item.금액.value), 0);
    });

    setCostGroups(groups);
  };

  // ✅ 셀 클릭 핸들러 (Excel 하이라이트만)
  const handleCellClick = (item: CostItem, cell: string, value: string | number) => {
    setSelectedItem(item);
    setHighlightedCell(cell);
    console.log(`🎯 Excel 셀 ${cell} 하이라이트 - 값: ${value}`);
  };

  // 🔧 셀 더블클릭 편집 핸들러 - Excel 재매핑 모드 (디버깅 강화)
  const handleCellDoubleClick = (item: CostItem, fieldName: string, cellData: CellData) => {
    console.log(`🔥 더블클릭 감지! 항목: ${item.id}, 필드: ${fieldName}, 값: ${cellData.value}`);

    const newEditingCell = {
      itemId: item.id,
      fieldName,
      value: cellData.value
    };

    console.log(`🔧 editingCell 설정 중:`, newEditingCell);
    
    // Excel 재매핑을 위한 편집 상태 설정
    setEditingCell(newEditingCell);
    
    console.log(`🏗️ 상태 설정 완료 - 다음 단계들:`);
    console.log(`- setIsRemappingMode(true)`);
    console.log(`- setExcelViewerOpen(true)`);
    console.log(`- setHighlightedCell(${cellData.cell})`);

    // Excel 뷰어를 재매핑 모드로 열기
    setIsRemappingMode(true);
    setExcelViewerOpen(true);
    setHighlightedCell(cellData.cell); // 현재 매핑된 셀 하이라이트

    console.log(`📊 Excel 재매핑 모드 설정 완료: ${fieldName} (현재: ${cellData.cell})`);
    
    // 잠시 후 editingCell 상태를 다시 확인
    setTimeout(() => {
      console.log(`⏰ 1초 후 editingCell 상태 확인:`, editingCell);
    }, 1000);
  };

  // 💾 Excel 셀 재매핑 완료 핸들러
  const handleCellRemapping = (newCell: string, newValue: string | number) => {
    console.log(`🚨 handleCellRemapping 호출됨!`);
    console.log(`newCell: ${newCell}, newValue: ${newValue}`);
    console.log(`editingCell:`, editingCell);
    
    if (!editingCell) {
      console.log(`❌ editingCell이 없어서 재매핑 취소`);
      return;
    }

    console.log(`🔄 셀 재매핑 시작: ${editingCell.fieldName} - ${highlightedCell} → ${newCell} (${newValue})`);

    // costGroups만 업데이트 (UI가 사용하는 데이터 소스) - 디버깅 강화
    console.log(`🔍 찾는 아이템 ID: ${editingCell.itemId}, 필드: ${editingCell.fieldName}`);
    
    setCostGroups(prev => {
      let itemFound = false;
      let fieldUpdated = false;
      
      const result = prev.map(group => {
        console.log(`그룹 [${group.category}] 체크 중...`);
        
        const updatedGroup = {
          ...group,
          items: group.items.map(item => {
            console.log(`아이템 체크: ${item.id} === ${editingCell.itemId} ?`);
            
            if (item.id === editingCell.itemId) {
              console.log(`✅ 아이템 발견: ${item.id}`);
              itemFound = true;
              
              const updatedItem = { ...item };
              const field = updatedItem[editingCell.fieldName as keyof CostItem] as CellData;

              console.log(`필드 체크:`, field);
              console.log(`필드 타입: ${typeof field}`);
              console.log(`'value' in field:`, field && typeof field === 'object' && 'value' in field);

              if (field && typeof field === 'object' && 'value' in field) {
                console.log(`🔄 필드 업데이트 시작: ${editingCell.fieldName}`);
                (field as CellData).cell = newCell;
                (field as CellData).value = newValue;
                (field as CellData).isModified = true;
                (field as CellData).modifiedAt = new Date().toISOString();
                (field as CellData).modifiedBy = '사용자';
                
                fieldUpdated = true;
                console.log(`✅ 필드 업데이트 완료: ${editingCell.fieldName} = ${newValue}`);
              } else {
                console.log(`❌ 필드 업데이트 실패: 잘못된 필드 구조`);
              }

              return updatedItem;
            }
            return item;
          })
        };
        
        // 금액 변경시 총합 재계산
        updatedGroup.total = updatedGroup.items.reduce((sum, item) => {
          const amount = item.id === editingCell.itemId && editingCell.fieldName === '금액'
            ? Number(newValue)
            : Number(item.금액.value);
          return sum + amount;
        }, 0);
        
        return updatedGroup;
      });
      
      // 디버깅 결과 출력
      console.log(`📊 재매핑 결과 요약:`);
      console.log(`- 아이템 발견: ${itemFound}`);
      console.log(`- 필드 업데이트: ${fieldUpdated}`);
      
      if (!itemFound) {
        console.log(`❌ 심각한 문제: 아이템 ID ${editingCell.itemId}를 찾을 수 없음!`);
      }
      
      if (!fieldUpdated) {
        console.log(`❌ 심각한 문제: 필드 업데이트 실패!`);
      }
      
      return result;
    });

    // 편집 상태 초기화
    setEditingCell(null);
    setIsRemappingMode(false);
    setExcelViewerOpen(false); // Excel 뷰어 닫기
    setHighlightedCell(newCell); // 새로 매핑된 셀 하이라이트

    console.log(`🎯 재매핑 완료! 새로운 셀: ${newCell}, 값: ${newValue}`);
  };

  // 📝 노트작성 관련 핸들러
  const handleNoteSubmit = () => {
    if (!noteContent.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      fileId: currentFileId, // 파일 ID 추가 (파싱 노트와 연결)
      fileName: fileName, // 파일명 추가 (URL에서 가져옴)
      type: noteType,
      content: noteContent,
      timestamp: new Date().toISOString(),
      analysisData: {
        totalItems: costGroups.reduce((sum, group) => sum + group.items.length, 0),
        modifiedItems: getModifiedItemsCount(),
        categories: costGroups.map(g => ({
          name: g.category,
          total: g.total,
          itemCount: g.items.length
        })),
        highlightedCell,
        selectedItem: selectedItem?.id
      }
    };

    setSavedNotes(prev => [...prev, newNote]);

    // 파싱 노트 저장소에 저장 (통합)
    const existingParsingNotes = JSON.parse(localStorage.getItem('parsing-notes') || '[]');
    existingParsingNotes.push(newNote);
    localStorage.setItem('parsing-notes', JSON.stringify(existingParsingNotes));

    console.log('📝 검증 노트 저장 완료 (파싱 저장소):', newNote);
    setNoteContent('');
    setNoteDialogOpen(false);
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);

    // 현재 분석 데이터 요약
    const analysisContext = {
      파일명: 'sample_quotation.xlsx',
      총항목수: costGroups.reduce((sum, group) => sum + group.items.length, 0),
      수정된항목: getModifiedItemsCount(),
      카테고리별현황: costGroups.map(g => ({
        카테고리: g.category,
        총금액: g.total,
        항목수: g.items.length
      })),
      현재선택셀: highlightedCell,
      문제점: costGroups.reduce((problemCount, group) => {
        return problemCount + group.items.filter(item =>
          Object.values(item).some(field =>
            field && typeof field === 'object' && 'isModified' in field && field.isModified
          )
        ).length;
      }, 0)
    };

    // LLM 분석 시뮬레이션
    setTimeout(() => {
      const aiSuggestion = `
🤖 **AI 분석 결과** (${new Date().toLocaleString()})

📊 **현재 상태 분석:**
- 총 ${analysisContext.총항목수}개 항목 중 ${analysisContext.수정된항목}개 수정됨
- 재료비: ${costGroups.find(g => g.category === '재료비')?.total.toLocaleString()}원
- 가공비: ${costGroups.find(g => g.category === '가공비')?.total.toLocaleString()}원
- 경비: ${costGroups.find(g => g.category === '경비')?.total.toLocaleString()}원

🎯 **파싱 개선 권고사항:**
1. **셀 매핑 정확도**: ${highlightedCell ? `${highlightedCell} 셀 매핑 재검토 필요` : '매핑 상태 양호'}
2. **데이터 일관성**: 수량 단위와 금액 계산식 자동 검증 로직 추가
3. **예외처리**: 빈 셀, 병합 셀, 수식 셀에 대한 강화된 처리

📋 **향후 파싱시 주의사항:**
- 재료비 구분(소재/부품/체결재) 자동 분류 정확도 향상
- 가공비 공정 코드(P01~P03) 패턴 인식 강화
- 경비 계산 공식 검증 로직 추가
- Excel 템플릿 변경시 대응 방안 수립

⚠️ **체크 포인트:**
- [ ] 금액 합계 검산 (${costGroups.reduce((sum, g) => sum + g.total, 0).toLocaleString()}원)
- [ ] 단가×수량=금액 일치성 확인
- [ ] 셀 참조 오류 없는지 점검
      `;

      setNoteContent(aiSuggestion);
      setIsAnalyzing(false);
    }, 2000);
  };

  // 📄 현재 작업 중인 파일 ID (URL 파라미터에서 가져옴)
  const currentFileId = fileId;

  // 초기 노트 로드 (파싱 노트와 통합)
  useEffect(() => {
    try {
      // parsing-notes에서 현재 파일의 노트만 로드
      const parsingNotesData = JSON.parse(localStorage.getItem('parsing-notes') || '[]');
      // 기존 검증 노트도 마이그레이션
      const legacyNotesData = JSON.parse(localStorage.getItem('cost-analysis-notes') || '[]');

      // 현재 파일의 노트만 필터링
      const currentFileNotes = parsingNotesData.filter((note: any) =>
        note && note.fileId === currentFileId && note.content && note.content.trim().length > 0
      );

      // 기존 검증 노트를 파일 기반으로 마이그레이션
      const migratedLegacyNotes = legacyNotesData.map((note: any) => ({
        ...note,
        fileId: currentFileId, // 기존 노트를 현재 파일로 연결
        fileName: fileName // 현재 파일명
      }));

      // 마이그레이션된 노트를 파싱 노트에 추가 (중복 방지)
      if (migratedLegacyNotes.length > 0) {
        const allParsingNotes = [...parsingNotesData, ...migratedLegacyNotes];
        localStorage.setItem('parsing-notes', JSON.stringify(allParsingNotes));
        // 기존 검증 노트 삭제
        localStorage.removeItem('cost-analysis-notes');
        console.log('📝 검증 노트 → 파싱 노트 마이그레이션 완료:', migratedLegacyNotes.length, '개');
      }

      // 현재 파일의 모든 노트 (마이그레이션 포함)
      const allCurrentFileNotes = [...currentFileNotes, ...migratedLegacyNotes];
      setSavedNotes(allCurrentFileNotes);

      console.log('📝 파일별 노트 로드 완료:', {
        파일ID: currentFileId,
        노트수: allCurrentFileNotes.length,
        파싱노트: currentFileNotes.length,
        마이그레이션: migratedLegacyNotes.length
      });
    } catch (error) {
      console.error('노트 로드 실패:', error);
      setSavedNotes([]);
    }
  }, [currentFileId]);

  // 📊 수정된 항목 개수 계산
  const getModifiedItemsCount = (): number => {
    return costGroups.reduce((groupCount, group) => {
      return groupCount + group.items.reduce((itemCount, item) => {
        const modifiedFields = Object.keys(item).filter(key => {
          const field = item[key as keyof CostItem];
          return field && typeof field === 'object' && 'isModified' in field && field.isModified;
        });
        return itemCount + modifiedFields.length;
      }, 0);
    }, 0);
  };



  // 💾 전체 변경사항 저장
  const handleSaveAllChanges = () => {
    const modifiedCount = getModifiedItemsCount();

    if (modifiedCount === 0) {
      console.log('⚠️ 저장할 변경사항이 없습니다.');
      return;
    }

    // 여기서 실제 백엔드 API 호출 또는 로컬 저장 처리
    console.log(`💾 전체 저장 시작: ${modifiedCount}개 항목`);

    // 성공 피드백 (임시)
    alert(`✅ ${modifiedCount}개 항목이 성공적으로 저장되었습니다!`);

    console.log(`✅ 전체 저장 완료: ${modifiedCount}개 항목`);
  };

  // 💾 편집 저장 핸들러
  const handleEditSave = () => {
    if (!editingCell) return;

    const newValue = typeof editingCell.value === 'number'
      ? parseFloat(editValue) || 0
      : editValue;

    // costGroups만 업데이트 (UI가 사용하는 유일한 데이터 소스)
    setCostGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.id === editingCell.itemId) {
          const updatedItem = { ...item };
          const field = updatedItem[editingCell.fieldName as keyof CostItem] as CellData;

          if (field && typeof field === 'object' && 'value' in field) {
            (field as CellData).value = newValue;
            (field as CellData).isModified = true;
            (field as CellData).modifiedAt = new Date().toISOString();
            (field as CellData).modifiedBy = '사용자';
          }

          return updatedItem;
        }
        return item;
      }),
      // 금액 변경시 총합 재계산
      total: group.items.reduce((sum, item) => {
        const amount = item.id === editingCell.itemId && editingCell.fieldName === '금액'
          ? Number(newValue)
          : Number(item.금액.value);
        return sum + amount;
      }, 0)
    })));

    setEditingCell(null);
    setEditValue('');

    // 저장 완료 피드백 (임시 하이라이트)
    const targetCell = editingCell.fieldName;
    setTimeout(() => {
      setHighlightedCell('');
    }, 1000);

    console.log(`✅ ${editingCell.fieldName} 편집 완료: ${newValue} (임시 저장)`);
  };

  // ❌ 편집 취소 핸들러
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
    console.log('❌ 편집 취소');
  };

  // ✅ 리사이징 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // 20%~80% 범위로 제한
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // 리사이징 이벤트 리스너
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);



  // ✅ 표준뷰 렌더링 (카테고리별 테이블)
  const StandardView = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
          📊 카테고리별 원가 분석
        </Typography>


      </Box>

      {costGroups.map((group) => (
        <Paper key={group.category} sx={{ mb: 2, overflow: 'hidden' }}>
          {/* 📁 아코디언 헤더 (클릭 가능) */}
          <Box
            sx={{
              bgcolor: group.color,
              color: 'white',
              p: 1.5,  // 패딩 줄임 (2 → 1.5)
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: `${group.color}dd`,  // 호버 시 약간 어둡게
                transform: 'scale(1.005)',
                transition: 'all 0.2s ease'
              }
            }}
            onClick={() => toggleCategory(group.category)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* 📁 펼치기/접기 아이콘 */}
              {expandedCategories[group.category] ?
                <ExpandLessIcon sx={{ fontSize: '20px' }} /> :
                <ExpandMoreIcon sx={{ fontSize: '20px' }} />
              }
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '18px' }}>  {/* 폰트 크기 줄임 */}
                {group.category}
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '18px' }}>  {/* 폰트 크기 줄임 */}
              {group.total.toLocaleString()}원
            </Typography>
          </Box>

          {/* 🔽 아코디언 컨텐츠 */}
          <Collapse in={expandedCategories[group.category]}>
            <Box sx={{ p: 0 }}>
            {group.category === '재료비' && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>구분</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>품명</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>규격</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>단위</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>수량</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>단가</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item) => {
                      const materialItem = item as MaterialCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <EditableCell
                            cellData={materialItem.구분}
                            item={item}
                            fieldName="구분"
                          />
                          <EditableCell
                            cellData={materialItem.품명}
                            item={item}
                            fieldName="품명"
                            className="font-medium"
                          />
                          <EditableCell
                            cellData={materialItem.규격}
                            item={item}
                            fieldName="규격"
                          />
                          <EditableCell
                            cellData={materialItem.단위}
                            item={item}
                            fieldName="단위"
                          />
                          <EditableCell
                            cellData={materialItem.수량}
                            item={item}
                            fieldName="수량"
                            isNumeric
                          />
                          <EditableCell
                            cellData={materialItem.단가}
                            item={item}
                            fieldName="단가"
                            isNumeric
                          />
                          <EditableCell
                            cellData={materialItem.금액}
                            item={item}
                            fieldName="금액"
                            isNumeric
                            className="font-semibold"
                          />
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {group.category === '가공비' && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>공정</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>공정명</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>인원</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>적용C/T</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>임율</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item) => {
                      const processItem = item as ProcessCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <EditableCell
                            cellData={processItem.공정}
                            item={item}
                            fieldName="공정"
                          />
                          <EditableCell
                            cellData={processItem.공정명}
                            item={item}
                            fieldName="공정명"
                            className="font-medium"
                          />
                          <EditableCell
                            cellData={processItem.인원}
                            item={item}
                            fieldName="인원"
                            isNumeric
                          />
                          <EditableCell
                            cellData={processItem.적용CT}
                            item={item}
                            fieldName="적용CT"
                            isNumeric
                          />
                          <EditableCell
                            cellData={processItem.임율}
                            item={item}
                            fieldName="임율"
                            isNumeric
                          />
                          <EditableCell
                            cellData={processItem.금액}
                            item={item}
                            fieldName="금액"
                            isNumeric
                            className="font-semibold"
                          />
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {group.category === '경비' && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>기종</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>C/T</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>경비</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item) => {
                      const overheadItem = item as OverheadCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <EditableCell
                            cellData={overheadItem.기종}
                            item={item}
                            fieldName="기종"
                            className="font-medium"
                          />
                          <EditableCell
                            cellData={overheadItem.CT}
                            item={item}
                            fieldName="CT"
                            isNumeric
                          />
                          <EditableCell
                            cellData={overheadItem.경비}
                            item={item}
                            fieldName="경비"
                            isNumeric
                          />
                          <EditableCell
                            cellData={overheadItem.금액}
                            item={item}
                            fieldName="금액"
                            isNumeric
                            className="font-semibold"
                          />
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
  );

  // ✅ 리스트뷰 렌더링 (통합 테이블 - 편집 가능)
  const ListView = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          📋 전체 항목 리스트
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 600 }}>카테고리</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>구분/공정/기종</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>품명/공정명</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>규격/인원/C/T</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>수량/임율/경비</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>단가</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costGroups.flatMap(group => group.items).map((item) => {
              let 구분값 = '';
              let 품명값 = '';
              let 규격값 = '';
              let 수량값 = '';
              let 단가값 = '';

              if (item.category === '재료비') {
                const materialItem = item as MaterialCostItem;
                구분값 = String(materialItem.구분.value);
                품명값 = String(materialItem.품명.value);
                규격값 = String(materialItem.규격.value);
                수량값 = `${materialItem.수량.value} ${materialItem.단위.value}`;
                단가값 = `${Number(materialItem.단가.value).toLocaleString()}원`;
              } else if (item.category === '가공비') {
                const processItem = item as ProcessCostItem;
                구분값 = String(processItem.공정.value);
                품명값 = String(processItem.공정명.value);
                규격값 = `${processItem.인원.value}명`;
                수량값 = `${Number(processItem.임율.value).toLocaleString()}원/시간`;
                단가값 = `${processItem.적용CT.value}초`;
              } else if (item.category === '경비') {
                const overheadItem = item as OverheadCostItem;
                구분값 = String(overheadItem.기종.value);
                품명값 = '-';
                규격값 = `${overheadItem.CT.value}초`;
                수량값 = `${Number(overheadItem.경비.value).toLocaleString()}원/시간`;
                단가값 = '-';
              }

              return (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.category}
                      color={
                        item.category === '재료비' ? 'primary' :
                        item.category === '가공비' ? 'secondary' : 'success'
                      }
                      variant="outlined"
                    />
                  </TableCell>

                  {/* 구분/공정/기종 - 편집 가능 */}
                  {item.category === '재료비' && (
                    <EditableCell
                      cellData={(item as MaterialCostItem).구분}
                      item={item}
                      fieldName="구분"
                      className="font-medium"
                    />
                  )}
                  {item.category === '가공비' && (
                    <EditableCell
                      cellData={(item as ProcessCostItem).공정}
                      item={item}
                      fieldName="공정"
                    />
                  )}
                  {item.category === '경비' && (
                    <EditableCell
                      cellData={(item as OverheadCostItem).기종}
                      item={item}
                      fieldName="기종"
                      className="font-medium"
                    />
                  )}

                  {/* 품명/공정명 - 편집 가능 */}
                  {item.category === '재료비' && (
                    <EditableCell
                      cellData={(item as MaterialCostItem).품명}
                      item={item}
                      fieldName="품명"
                      className="font-medium"
                    />
                  )}
                  {item.category === '가공비' && (
                    <EditableCell
                      cellData={(item as ProcessCostItem).공정명}
                      item={item}
                      fieldName="공정명"
                      className="font-medium"
                    />
                  )}
                  {item.category === '경비' && (
                    <TableCell>-</TableCell>
                  )}

                  {/* 규격/인원/CT - 편집 가능 */}
                  {item.category === '재료비' && (
                    <EditableCell
                      cellData={(item as MaterialCostItem).규격}
                      item={item}
                      fieldName="규격"
                    />
                  )}
                  {item.category === '가공비' && (
                    <EditableCell
                      cellData={(item as ProcessCostItem).인원}
                      item={item}
                      fieldName="인원"
                      isNumeric
                    />
                  )}
                  {item.category === '경비' && (
                    <EditableCell
                      cellData={(item as OverheadCostItem).CT}
                      item={item}
                      fieldName="CT"
                      isNumeric
                    />
                  )}

                  {/* 수량/임율/경비 - 편집 가능 */}
                  {item.category === '재료비' && (
                    <EditableCell
                      cellData={(item as MaterialCostItem).수량}
                      item={item}
                      fieldName="수량"
                      isNumeric
                    />
                  )}
                  {item.category === '가공비' && (
                    <EditableCell
                      cellData={(item as ProcessCostItem).임율}
                      item={item}
                      fieldName="임율"
                      isNumeric
                    />
                  )}
                  {item.category === '경비' && (
                    <EditableCell
                      cellData={(item as OverheadCostItem).경비}
                      item={item}
                      fieldName="경비"
                      isNumeric
                    />
                  )}

                  {/* 단가/적용CT - 편집 가능 */}
                  {item.category === '재료비' && (
                    <EditableCell
                      cellData={(item as MaterialCostItem).단가}
                      item={item}
                      fieldName="단가"
                      isNumeric
                    />
                  )}
                  {item.category === '가공비' && (
                    <EditableCell
                      cellData={(item as ProcessCostItem).적용CT}
                      item={item}
                      fieldName="적용CT"
                      isNumeric
                    />
                  )}
                  {item.category === '경비' && (
                    <TableCell>-</TableCell>
                  )}

                  {/* 금액 - 편집 가능 */}
                  <EditableCell
                    cellData={item.금액}
                    item={item}
                    fieldName="금액"
                    isNumeric
                    className="font-semibold"
                  />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );



  // ✅ 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: return <StandardView />;
      case 1: return <ListView />;
      default: return <StandardView />;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 🎯 Header bar - Analysis 스타일 */}
      <Box sx={{ borderBottom: '1px solid #e5e5e7', px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 13, color: '#86868b' }}>검증 &gt;</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{fileName || 'HEAD_LINING_원가계산서'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          {/* ── 현재 페이지 기능 버튼 ── */}
          <Box sx={{ display: 'flex', gap: 1, pr: 1.5, borderRight: '1px solid #e5e5e7' }}>
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
              노트작성{' '}
              {savedNotes.filter((n: any) => n && n.fileId === currentFileId && n.content && n.content.trim()).length > 0 && (
                <Box component="span" sx={{
                  ml: 0.5, px: 0.75, py: 0.1,
                  bgcolor: '#0064ff', color: '#fff',
                  borderRadius: '10px', fontSize: 10, fontWeight: 700, lineHeight: 1.6,
                }}>
                  {savedNotes.filter((n: any) => n && n.fileId === currentFileId && n.content && n.content.trim()).length}
                </Box>
              )}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
              onClick={handleSaveAllChanges}
              disabled={getModifiedItemsCount() === 0}
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
              저장{getModifiedItemsCount() > 0 && (
                <Box component="span" sx={{
                  ml: 0.5, px: 0.75, py: 0.1,
                  bgcolor: '#ff9500', color: '#fff',
                  borderRadius: '10px', fontSize: 10, fontWeight: 700, lineHeight: 1.6,
                }}>
                  {getModifiedItemsCount()}
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

            {/* 현재 단계 완료 */}
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                console.log('✅ 검증완료: 파일 상태 → verified');
                alert('✅ 검증이 완료되었습니다.');
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
              검증 완료
            </Button>

            {/* 다음 단계로 */}
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                console.log('📊 분석으로 이동: 파일 상태 → analyzing');
                navigate('/analysis');
              }}
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
              분석 →
            </Button>
          </Box>

        </Box>
      </Box>

      {/* Info Cards - Analysis 스타일 */}
      <Box sx={{ display: 'flex', gap: 2, px: 3, py: 2, bgcolor: '#f5f5f7' }}>
        {[
          { label: 'E.O. NO.', value: fileMetadata.coNumber || 'EO-2024-1201' },
          { label: '품번 / 품명', value: `${fileMetadata.partNumber || 'HL-2024-001'} · ${fileMetadata.partName || 'HEAD LINING'}` },
          { label: '협력사 / 담당자', value: `${fileMetadata.supplier || '대한(주)'} · ${fileMetadata.manager || '김철수'}` },
        ].map(c => (
          <Paper key={c.label} sx={{ flex: 1, p: 1.5, borderRadius: '8px', border: '1px solid #e5e5e7', boxShadow: 'none' }}>
            <Typography sx={{ fontSize: 10, color: '#86868b', mb: 0.25 }}>{c.label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{c.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* 💡 안내 텍스트 (배경/라인 없음) */}
      <Box sx={{ px: 3, py: 0.75 }}>
        <Typography sx={{ fontSize: 12, color: '#0071e3', fontWeight: 600 }}>
          💡 왼쪽 컬럼 클릭 → 오른쪽 Excel 하이라이트 · 더블클릭으로 셀 재매핑
        </Typography>
      </Box>

      {/* 🔄 메인 컨텐츠 (리사이즈 가능한 2분할) */}
      <Box
        ref={containerRef}
        sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}
      >

        {/* 👈 왼쪽: 파싱된 데이터 (Analysis와 동일) */}
        <Box sx={{
          width: `${leftWidth}%`,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {/* 탭 헤더 */}
          <Box sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{ px: 2 }}
            >
              <Tab label="표준" />
              <Tab label="리스트" />
            </Tabs>
          </Box>

          {/* 탭 컨텐츠 */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {renderTabContent()}
          </Box>
        </Box>

        {/* 🔄 리사이저 바 */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            width: 4,
            bgcolor: isResizing ? 'primary.main' : 'divider',
            cursor: 'col-resize',
            transition: 'background-color 0.2s ease',
            '&:hover': { bgcolor: 'primary.main' }
          }}
        />

        {/* 👉 오른쪽: Excel 원본 */}
        <Box sx={{
          width: `${100 - leftWidth}%`,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'grey.50'
        }}>
          {/* Excel 뷰어 헤더 */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ExcelIcon color="success" />
                <Typography variant="h6" fontWeight={600}>
                  Excel 원본
                </Typography>
                {highlightedCell && (
                  <Chip
                    size="small"
                    label={`${highlightedCell} 하이라이트`}
                    color="primary"
                  />
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FullscreenIcon />}
                onClick={() => setExcelViewerOpen(true)}
              >
                전체화면
              </Button>
            </Box>

            {highlightedCell && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Excel <strong>{highlightedCell}</strong> 셀이 선택되었습니다.
                  오른쪽 Excel 뷰어에서 해당 위치를 확인하세요.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Excel 임베디드 뷰어 */}
          <Box sx={{ flex: 1, p: 2 }}>
            <Paper sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'white',
              border: selectedItem
                ? '2px solid #0094FF'
                : '2px dashed rgba(0, 0, 0, 0.1)'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <ExcelIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Excel 미리보기
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {highlightedCell ? (
                    <>
                      <strong>{highlightedCell}</strong> 셀이 하이라이트될 예정
                      <br />
                      실제 Excel 파일에서 위치를 확인하세요
                    </>
                  ) : (
                    <>
                      왼쪽에서 컬럼을 클릭하면
                      <br />
                      해당 Excel 셀이 하이라이트됩니다
                    </>
                  )}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ViewIcon />}
                  onClick={() => setExcelViewerOpen(true)}
                >
                  Excel 뷰어 열기
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* 🔗 Excel 뷰어 다이얼로그 */}
      <ExcelViewerDialog
        open={excelViewerOpen}
        onClose={() => {
          console.log(`🚪 Excel 뷰어 onClose 호출됨`);
          setExcelViewerOpen(false);
          setIsRemappingMode(false);
          // setEditingCell(null); // 제거: 재매핑 완료 후에만 null로 설정
          console.log(`🚪 Excel 뷰어 닫기 완료 (editingCell 유지)`);
        }}
        highlightedCell={highlightedCell}
        title={isRemappingMode ? `🔄 셀 재매핑${editingCell?.fieldName ? `: ${editingCell.fieldName}` : ''}` : (highlightedCell ? `Excel 원본 - ${highlightedCell} 셀` : 'Excel 원본')}
        isRemappingMode={isRemappingMode}
        onCellSelect={(newCell: string, newValue: string | number) => {
          console.log(`📞 onCellSelect 콜백 호출: ${newCell} = ${newValue}`);
          console.log(`🔍 현재 editingCell 상태:`, editingCell);
          
          if (editingCell) {
            handleCellRemapping(newCell, newValue);
          } else {
            console.log(`❌ editingCell이 null이어서 재매핑 불가능`);
            console.log(`🔧 강제로 editingCell 복구 시도...`);
            // editingCell이 null인 경우를 위한 fallback
          }
        }}
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
              <strong>현재 분석 상태:</strong> 총 {costGroups.reduce((sum, group) => sum + group.items.length, 0)}개 항목 |
              수정 {getModifiedItemsCount()}개 |
              총액 {costGroups.reduce((sum, g) => sum + g.total, 0).toLocaleString()}원
              {highlightedCell && ` | 선택셀: ${highlightedCell}`}
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
              <MenuItem value="parsing">🔍 파싱 이슈</MenuItem>
              <MenuItem value="validation">✅ 검증 결과</MenuItem>
              <MenuItem value="improvement">💡 개선 제안</MenuItem>
            </Select>
          </FormControl>

          {/* ✨ AI 분석 버튼 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AIIcon />}
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              sx={{ textTransform: 'none' }}
            >
              {isAnalyzing ? '분석중...' : 'AI 분석 제안'}
            </Button>
            <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
              현재 분석 상태를 기반으로 개선사항을 제안합니다
            </Typography>
          </Box>

          {/* 📝 노트 내용 입력 */}
          <TextField
            multiline
            rows={12}
            fullWidth
            label="노트 내용"
            placeholder={`예시:
🔍 파싱 이슈 발견:
- C15 셀 (인서트필름) 매핑이 D15로 잘못됨
- 가공비 임율 계산식 확인 필요

💡 향후 개선사항:
- Excel 템플릿 변경시 자동 감지 로직
- 단가×수량=금액 자동 검증
- 공정코드 패턴 인식 강화

📋 체크리스트:
- [ ] 재료비 총합: 283.5원 검증 완료
- [ ] 가공비 CT 시간 단위 통일
- [ ] 경비 계산식 수식 검토`}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* 📋 노트 히스토리 (다이얼로그 내) */}
          {savedNotes && savedNotes.length > 0 && savedNotes.some((note: any) => note && note.fileId === currentFileId && note.content && note.content.trim()) && (
            <>
              <Divider sx={{ my: 2 }} />

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  📋 노트 히스토리 ({savedNotes.filter((n: any) => n && n.fileId === currentFileId && n.content && n.content.trim()).length}개)
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    // 현재 파일의 노트만 삭제
                    const allParsingNotes = JSON.parse(localStorage.getItem('parsing-notes') || '[]');
                    const otherFileNotes = allParsingNotes.filter((note: any) => note.fileId !== currentFileId);
                    localStorage.setItem('parsing-notes', JSON.stringify(otherFileNotes));
                    setSavedNotes([]);
                    console.log('🗑️ 현재 파일 노트 히스토리 초기화:', currentFileId);
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

              <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                {savedNotes.filter((note: any) => note && note.fileId === currentFileId && note.content && note.content.trim()).slice().reverse().map((note, index) => (
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
                            note.type === 'validation' ? '✅ 검증' :
                            '💡 개선'
                          }
                          variant="outlined"
                          sx={{
                            fontSize: '10px',
                            height: '20px',
                            bgcolor:
                              note.type === 'parsing' ? '#fff3e0' :
                              note.type === 'validation' ? '#e8f5e8' :
                              '#e3f2fd',
                            color:
                              note.type === 'parsing' ? '#e65100' :
                              note.type === 'validation' ? '#2e7d32' :
                              '#1565c0'
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
                          {note.context.총항목수 && (
                            <Chip
                              size="small"
                              label={`📊 ${note.context.총항목수}개`}
                              variant="outlined"
                              sx={{ fontSize: '9px', height: '16px' }}
                            />
                          )}
                          {note.context.수정된항목 > 0 && (
                            <Chip
                              size="small"
                              label={`✏️ ${note.context.수정된항목}개 수정`}
                              variant="outlined"
                              sx={{ fontSize: '9px', height: '16px' }}
                            />
                          )}
                          {note.context.highlightedCell && (
                            <Chip
                              size="small"
                              label={`🎯 ${note.context.highlightedCell}`}
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
          >
            노트 저장
          </Button>
        </DialogActions>
      </Dialog>



      {/* 목록으로 버튼은 상단 전체저장 옆으로 이동됨 */}
    </Box>
  );
};

export default ParsedDataReviewPage;