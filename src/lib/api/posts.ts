import { apiRequest } from '../api-client';
import type { Post, CreatePostRequest, UpdatePostRequest, Page } from '../types';

export const postsAPI = {
  async getPosts(cursor?: string | null, limit = 10): Promise<Page<Post>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    return apiRequest<Page<Post>>(`/posts?${params.toString()}`);
  },

  async getPost(postId: string): Promise<Post> {
    return apiRequest<Post>(`/posts/${postId}`);
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    return apiRequest<Post>('/posts/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePost(postId: string, data: UpdatePostRequest): Promise<Post> {
    return apiRequest<Post>(`/posts/${postId}/update`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePost(postId: string): Promise<void> {
    return apiRequest<void>(`/posts/${postId}/delete`, {
      method: 'DELETE',
    });
  },

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return apiRequest<Post[]>(`/posts/user/${authorId}`);
  },

  async searchPosts(query: string, limit = 10, offset = 0): Promise<Post[]> {
    const params = new URLSearchParams();
    params.append('search_query', query);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return apiRequest<Post[]>(`/posts/search?${params.toString()}`);
  },
};


