import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VerificationItem } from '../types';
import { calculateVerificationCounts } from '../services/verificationService';

export const useParsedDataReview = () => {
  const navigate = useNavigate();
  const [highlightedCell, setHighlightedCell] = useState<string>('');
  const [editDialog, setEditDialog] = useState<{ open: boolean; item?: VerificationItem }>({ open: false });
  const [correctedValue, setCorrectedValue] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const { totalCorrect, totalWarning, totalError } = calculateVerificationCounts();

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
