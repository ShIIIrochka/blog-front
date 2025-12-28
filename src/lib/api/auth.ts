import { apiRequest } from '../api-client';
import type { JWTTokens, LoginRequest, RegisterRequest } from '../types';

export const authAPI = {
  async login(data: LoginRequest): Promise<JWTTokens> {
    return apiRequest<JWTTokens>('/user/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async register(data: RegisterRequest): Promise<JWTTokens> {
    return apiRequest<JWTTokens>('/user/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async refresh(): Promise<JWTTokens> {
    return apiRequest<JWTTokens>('/user/auth/refresh', {
      method: 'POST',
    });
  },

  async logout(): Promise<void> {
    return apiRequest<void>('/user/auth/logout', {
      method: 'POST',
    });
  },
};


