import api from './api';

export interface Vendor {
  id: number;
  name: string;
  contact?: string;
  description?: string;
  created_at: string;
}

export const getVendors = () => api.get<Vendor[]>('/api/vendors');
export const createVendor = (data: Partial<Vendor>) => api.post<Vendor>('/api/vendors', data);
