export interface VerificationItem {
  id: string;
  fieldName: string;
  originalValue: string;
  parsedValue: string;
  confidence: number;
  status: 'correct' | 'warning' | 'error';
  cellRef: string;
  message?: string;
  category: 'material_cost' | 'processing_cost' | 'overhead_cost' | 'total' | 'metadata';
}

export interface ExcelCell {
  row: number;
  col: string;
  field: string;
  value: string;
  type: string;
}
