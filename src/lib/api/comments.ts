import { apiRequest } from '../api-client';
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from '../types';

export const commentsAPI = {
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return apiRequest<Comment[]>(`/comments/post/${postId}`);
  },

  async getComment(commentId: string): Promise<Comment> {
    return apiRequest<Comment>(`/comments/${commentId}`);
  },

  async createComment(postId: string, data: CreateCommentRequest): Promise<Comment> {
    return apiRequest<Comment>(`/comments/post/${postId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async replyToComment(
    parentCommentId: string,
    data: CreateCommentRequest
  ): Promise<Comment> {
    return apiRequest<Comment>(`/comments/${parentCommentId}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    return apiRequest<Comment>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteComment(commentId: string): Promise<void> {
    return apiRequest<void>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};


