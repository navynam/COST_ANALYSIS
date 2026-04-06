import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  filterProducts,
  getQuotationsForProduct,
  calculateSelectionStep,
  toggleQuotationSelection,
} from '../services/comparisonService';

export const useQuotationComparison = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false); // 수동 비교 제어

  const quotations = getQuotationsForProduct(selectedProduct);
  const selectionStep = calculateSelectionStep(selectedProduct, showComparison);

  const toggleQuotation = (qId: string) => {
    setSelectedQuotations(prev => toggleQuotationSelection(prev, qId));
  };

  const resetSelection = () => {
    setSelectedProduct(null);
    setSelectedQuotations([]);
    setShowComparison(false);
  };

  const startComparison = () => {
    setShowComparison(true);
  };

  const filteredProducts = filterProducts(searchQuery);

  return {
    navigate,
    selectedProduct, setSelectedProduct,
    selectedQuotations, setSelectedQuotations,
    searchOpen, setSearchOpen,
    searchQuery, setSearchQuery,
    quotations, selectionStep,
    toggleQuotation, resetSelection, filteredProducts,
    showComparison, startComparison,
  };
};
