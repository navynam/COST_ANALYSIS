import api from './api';

export interface ComparisonData {
  vendors: { id: number; name: string; quotation_id: number }[];
  categories: string[];
  items: {
    category: string;
    item_name: string;
    values: Record<string, number | null>;
    min_value: number | null;
    max_value: number | null;
  }[];
}

export const getComparison = (productId: number, quotationIds?: number[]) =>
  api.get<ComparisonData>('/api/comparison', {
    params: {
      product_id: productId,
      ...(quotationIds && quotationIds.length > 0 ? { quotation_ids: quotationIds.join(',') } : {}),
    },
  });
