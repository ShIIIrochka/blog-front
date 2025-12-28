import { apiRequest } from '../api-client';
import type { Category } from '../types';

export const categoriesAPI = {
  async getAllCategories(limit = 100, cursor?: string | null): Promise<Category[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);
    return apiRequest<Category[]>(`/categories?${params.toString()}`);
  },

  async getCategoryById(categoryId: string): Promise<Category> {
    return apiRequest<Category>(`/categories/${categoryId}`);
  },

  async createCategory(name: string): Promise<Category> {
    return apiRequest<Category>('/categories/create', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
};


