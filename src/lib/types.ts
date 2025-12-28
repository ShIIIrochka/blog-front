// API Types based on openapi.json

export interface User {
  id: string;
  email: string;
  login: string;
  password?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  categories?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface JWTTokens {
  access: string;
  refresh: string;
}

export interface Page<T> {
  items: T[];
  next_cursor?: string | null;
  has_more: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  login: string;
  password: string;
}

export interface UpdateUserRequest {
  email: string;
  login: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categories?: string[] | null;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  categories?: string[] | null;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface APIError {
  status_code: number;
  detail: string;
  extra?: Record<string, any>;
}


