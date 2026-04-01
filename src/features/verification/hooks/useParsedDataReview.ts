import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockVerificationData } from '../data/mockData';
import type { VerificationItem } from '../types';

export const useParsedDataReview = () => {
  const navigate = useNavigate();
  const [highlightedCell, setHighlightedCell] = useState<string>('');
  const [editDialog, setEditDialog] = useState<{ open: boolean; item?: VerificationItem }>({ open: false });
  const [correctedValue, setCorrectedValue] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const totalCorrect = mockVerificationData.filter(item => item.status === 'correct').length;
  const totalWarning = mockVerificationData.filter(item => item.status === 'warning').length;
  const totalError = mockVerificationData.filter(item => item.status === 'error').length;

  const handleCellHighlight = (cellRef: string) => {
    setHighlightedCell(cellRef);
    setTimeout(() => setHighlightedCell(''), 3000);
  };

  return {
    navigate,
    highlightedCell, setHighlightedCell,
    editDialog, setEditDialog,
    correctedValue, setCorrectedValue,
    reportDialogOpen, setReportDialogOpen,
    totalCorrect, totalWarning, totalError,
    handleCellHighlight,
  };
};
