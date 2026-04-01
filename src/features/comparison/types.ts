export interface Product {
  id: string;
  name: string;
  material: string;
  quotationCount: number;
}

export interface Quotation {
  id: string;
  vendor: string;
  date: string;
  label: string;
}

export interface CompRow {
  item: string;
  isSubtotal?: boolean;
  values: Record<string, number>;
  material?: Record<string, string>;
}
