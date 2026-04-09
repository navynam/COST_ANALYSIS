import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CostRow } from '../types';
import {
  calculateTotalNotesCount,
  buildCellKey,
  isOverhead as checkOverhead,
  hasExcelData as checkHasExcelData,
  findExcelRowIndex,
  saveModifiedCells,
} from '../services/analysisService';

export const useAnalysisPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editCell, setEditCell] = useState<{ groupId: string; rowIdx: number; field: 'unitPrice' | 'amount' } | null>(null);
  const [editValue, setEditValue] = useState('');

  // 수정된 셀 추적: key = "groupId-rowIdx-field", value = 새 값
  const [modifiedCells, setModifiedCells] = useState<Record<string, string>>({});

  const commitEdit = () => {
    if (editCell && editValue.trim() !== '') {
      const key = buildCellKey(editCell.groupId, editCell.rowIdx, editCell.field);
      setModifiedCells(prev => ({ ...prev, [key]: editValue.trim() }));
    }
    setEditCell(null);
  };

  const getModifiedCount = () => Object.keys(modifiedCells).length;

  const handleSaveAllChanges = async (onComplete?: (count: number) => void) => {
    const count = getModifiedCount();
    if (count === 0) return;
    await saveModifiedCells(modifiedCells);
    setModifiedCells({});
    if (onComplete) onComplete(count);
  };
  const [anomalyAnchor, setAnomalyAnchor] = useState<{ el: HTMLElement; reason: string } | null>(null);
  const [originalViewOpen, setOriginalViewOpen] = useState(false);
  const [highlightedCell, setHighlightedCell] = useState<{ row: number; col: number } | null>(null);
  const [calculationAnchor, setCalculationAnchor] = useState<{ el: HTMLElement; row: CostRow; groupTitle: string } | null>(null);
  
  // 📝 노트작성 관련 상태
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('analysis');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);

  // 📊 전체 노트 개수 (파싱 + 분석 노트 통합)
  const [totalNotesCount, setTotalNotesCount] = useState(0);
  
  const updateTotalNotesCount = () => {
    setTotalNotesCount(calculateTotalNotesCount());
  };

  // 컴포넌트 마운트 시 노트 개수 초기화
  useEffect(() => {
    updateTotalNotesCount();
  }, []);

  // localStorage storage 이벤트 리스닝
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'parsing-notes' || e.key === 'analysis-notes') {
        updateTotalNotesCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 페이지 focus 시에도 업데이트 (같은 탭에서 변경 시)
    const handleFocus = () => {
      updateTotalNotesCount();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const startEdit = (groupId: string, rowIdx: number, field: 'unitPrice' | 'amount', currentValue: string) => {
    setEditCell({ groupId, rowIdx, field });
    setEditValue(currentValue);
  };

  const isOverhead = (groupId: string) => checkOverhead(groupId);

  const hasExcelData = (itemName: string) => checkHasExcelData(itemName);

  const handleCellClick = (itemName: string) => {
    const rowIndex = findExcelRowIndex(itemName);
    if (rowIndex !== -1) {
      setHighlightedCell({ row: rowIndex, col: 1 });
      setOriginalViewOpen(true);
    }
  };

  const handleAmountClick = (event: React.MouseEvent<HTMLElement>, row: CostRow, groupTitle: string) => {
    setCalculationAnchor({ el: event.currentTarget, row, groupTitle });
  };

  return {
    navigate,
    activeTab, setActiveTab,
    editCell, setEditCell,
    editValue, setEditValue,
    anomalyAnchor, setAnomalyAnchor,
    originalViewOpen, setOriginalViewOpen,
    highlightedCell, setHighlightedCell,
    calculationAnchor, setCalculationAnchor,
    noteDialogOpen, setNoteDialogOpen,
    noteContent, setNoteContent,
    noteType, setNoteType,
    savedNotes, setSavedNotes,
    totalNotesCount,
    updateTotalNotesCount,
    startEdit, isOverhead, hasExcelData, handleCellClick, handleAmountClick,
    modifiedCells, commitEdit, getModifiedCount, handleSaveAllChanges,
  };
};
