import { apiRequest } from '../api-client';
import type { User, UpdateUserRequest, Page, Post } from '../types';

export const usersAPI = {
  async getMe(): Promise<User> {
    return apiRequest<User>('/users/me');
  },

  async getUserById(userId: string): Promise<User> {
    return apiRequest<User>(`/users/${userId}`);
  },

  async updateUser(data: UpdateUserRequest): Promise<User> {
    return apiRequest<User>('/users/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(): Promise<void> {
    return apiRequest<void>('/users/delete', {
      method: 'DELETE',
    });
  },

  async getSavedPosts(): Promise<Post[]> {
    return apiRequest<Post[]>('/users/posts/saved');
  },

  async savePost(postId: string): Promise<void> {
    return apiRequest<void>(`/users/posts/save/${postId}`, {
      method: 'POST',
    });
  },

  async unsavePost(postId: string): Promise<void> {
    return apiRequest<void>(`/users/unsave-post/${postId}`, {
      method: 'DELETE',
    });
  },

  async followUser(userId: string): Promise<void> {
    return apiRequest<void>(`/users/follow/${userId}`, {
      method: 'POST',
    });
  },

  async unfollowUser(userId: string): Promise<void> {
    return apiRequest<void>(`/users/unfollow/${userId}`, {
      method: 'DELETE',
    });
  },

  async getFeed(cursor?: string | null, limit = 10): Promise<Page<Post>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    return apiRequest<Page<Post>>(`/users/feed?${params.toString()}`);
  },

  async getPersonalizedFeed(cursor?: string | null, limit = 10): Promise<Page<Post>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    return apiRequest<Page<Post>>(`/users/personalized-feed?${params.toString()}`);
  },

  async likeCategory(categoryId: string): Promise<void> {
    return apiRequest<void>(`/users/categories/like/${categoryId}`, {
      method: 'POST',
    });
  },

  async unlikeCategory(categoryId: string): Promise<void> {
    return apiRequest<void>(`/users/categories/unlike/${categoryId}`, {
      method: 'DELETE',
    });
  },

  async getLikedCategories(): Promise<string[]> {
    return apiRequest<string[]>('/users/categories/liked');
  },
};


