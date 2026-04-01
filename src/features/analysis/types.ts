export interface CostRow {
  level: 'L0' | 'L1';
  category: string;
  name: string;
  spec: string;
  unit: string;
  qty: number | string;
  unitPrice: string;
  amount: string;
  ratio: string;
  confidence: number;
  status: 'normal' | 'anomaly';
  anomalyReason?: string;
  hasSub?: boolean;
  editable?: boolean;
}

export interface CostGroup {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  totalAmount: string;
  totalPct: string;
  anomalyCount: number;
  secondColHeader: string;
  rows: CostRow[];
}

export interface ListItem {
  id: string;
  name: string;
  category: string;
  spec: string;
  unit: string;
  qty: number | string;
  unitPrice: string;
  amount: string;
  ratio: string;
  confidence: number;
  status: 'normal' | 'anomaly';
  children?: ListItem[];
}

export interface ListGroup {
  id: string;
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  items: ListItem[];
}
