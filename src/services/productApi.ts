import api from './api';

export interface Product {
  id: number;
  name: string;
  spec?: string;
  description?: string;
  created_at: string;
}

export const getProducts = () => api.get<Product[]>('/api/products');
export const createProduct = (data: Partial<Product>) => api.post<Product>('/api/products', data);
export const getProduct = (id: number) => api.get<Product>(`/api/products/${id}`);
