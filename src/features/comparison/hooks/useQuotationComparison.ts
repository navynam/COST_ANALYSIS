import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProducts, mockQuotations } from '../data/mockData';

export const useQuotationComparison = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false); // 수동 비교 제어

  const quotations = selectedProduct ? mockQuotations[selectedProduct] || [] : [];
  const selectionStep = !selectedProduct ? 0 : !showComparison ? 1 : 2;

  const toggleQuotation = (qId: string) => {
    setSelectedQuotations(prev => {
      if (prev.includes(qId)) {
        return prev.filter(id => id !== qId);
      } else if (prev.length < 4) {
        return [...prev, qId];
      }
      return prev; // 4개 초과시 추가하지 않음
    });
  };

  const resetSelection = () => {
    setSelectedProduct(null);
    setSelectedQuotations([]);
    setShowComparison(false);
  };

  const startComparison = () => {
    setShowComparison(true);
  };

  const filteredProducts = mockProducts.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
  });

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
