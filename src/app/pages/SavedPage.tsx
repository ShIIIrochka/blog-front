import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usersAPI, categoriesAPI } from '@/lib/api';
import type { Post, User, Category } from '@/lib/types';
import { PostCard } from '../components/PostCard';
import { APIClientError } from '@/lib/api-client';

export function SavedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Map<string, User>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedPosts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await categoriesAPI.getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSavedPosts = async () => {
    try {
      const savedPosts = await usersAPI.getSavedPosts();
      setPosts(savedPosts);
      
      // Load author data
      const authorIds = [...new Set(savedPosts.map((p) => p.author_id))];
      await loadAuthors(authorIds);
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка загрузки сохраненных постов');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async (authorIds: string[]) => {
    const newAuthors = new Map(authors);
    
    for (const authorId of authorIds) {
      if (!newAuthors.has(authorId)) {
        try {
          const user = await usersAPI.getUserById(authorId);
          newAuthors.set(authorId, user);
        } catch (error) {
          console.error(`Error loading author ${authorId}:`, error);
        }
      }
    }
    
    setAuthors(newAuthors);
  };


  const handleUnsave = async (postId: string) => {
    try {
      await usersAPI.unsavePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      toast.success('Пост удален из избранного');
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка удаления');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Сохраненные посты</h1>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={authors.get(post.author_id)}
                categories={categories}
                isSaved={true}
                onSave={handleUnsave}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔖</div>
            <h3 className="font-semibold text-gray-900 mb-2">Нет сохраненных постов</h3>
            <p className="text-gray-500">
              Сохраняйте интересные посты, чтобы прочитать их позже
            </p>
          </div>
        )}
      </main>
    </div>
  );
}


