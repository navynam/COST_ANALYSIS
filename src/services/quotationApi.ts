import api from './api';

export interface QuotationItem {
  id: number;
  quotation_id: number;
  category: string;
  item_name: string;
  original_value: string;
  mapped_value: number | null;
  mapping_status: string;
  mapping_confidence: number;
  row_index: number;
  col_index: number;
}

export interface Quotation {
  id: number;
  vendor_id: number;
  product_id: number;
  file_name: string;
  status: string;
  uploaded_at: string;
  reviewed_at?: string;
  analyzed_at?: string;
  vendor_name?: string;
  product_name?: string;
  items?: QuotationItem[];
}

export interface AnalysisResult {
  id: number;
  quotation_id: number;
  rule_id: number | null;
  status: string;
  expected_value: number | null;
  actual_value: number | null;
  deviation: number | null;
  message: string;
  rule_name?: string;
}

export const uploadQuotation = (formData: FormData) =>
  api.post<Quotation>('/api/quotations/upload', formData);

export const getQuotations = (params?: Record<string, any>) =>
  api.get<Quotation[]>('/api/quotations', { params });

export const getQuotation = (id: number) =>
  api.get<Quotation>(`/api/quotations/${id}`);

export const updateItem = (quotationId: number, itemId: number, data: Partial<QuotationItem>) =>
  api.put<QuotationItem>(`/api/quotations/${quotationId}/items/${itemId}`, data);

export const reviewComplete = (id: number) =>
  api.post(`/api/quotations/${id}/review-complete`);

export const analyzeQuotation = (id: number) =>
  api.post(`/api/quotations/${id}/analyze`);

export const getAnalysis = (id: number) =>
  api.get<AnalysisResult[]>(`/api/quotations/${id}/analysis`);

export const getRawData = (id: number) =>
  api.get<{ rows: string[][] }>(`/api/quotations/${id}/raw-data`);

export const getProductQuotations = (productId: number) =>
  api.get<Quotation[]>(`/api/products/${productId}/quotations`);
