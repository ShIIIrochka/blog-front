import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { postsAPI, usersAPI, categoriesAPI } from '@/lib/api';
import type { Post, User, Category } from '@/lib/types';
import { PostCard } from '../components/PostCard';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { APIClientError } from '@/lib/api-client';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Map<string, User>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
    loadCategories();
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    try {
      const saved = await usersAPI.getSavedPosts();
      setSavedPosts(new Set(saved.map((p) => p.id)));
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await categoriesAPI.getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await postsAPI.searchPosts(searchQuery);
      setPosts(results);
      
      // Load author data
      const authorIds = [...new Set(results.map((p) => p.author_id))];
      await loadAuthors(authorIds);
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка поиска');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    }
  };


  const handleSave = async (postId: string) => {
    const isSaved = savedPosts.has(postId);
    
    try {
      if (isSaved) {
        await usersAPI.unsavePost(postId);
        setSavedPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        toast.success('Пост удален из избранного');
      } else {
        await usersAPI.savePost(postId);
        setSavedPosts((prev) => new Set(prev).add(postId));
        toast.success('Пост сохранен!');
      }
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка сохранения');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Поиск постов</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Поиск по заголовку и тексту..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Поиск...' : 'Найти'}
            </Button>
          </div>
        </form>

        {posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={authors.get(post.author_id)}
                categories={categories}
                isSaved={savedPosts.has(post.id)}
                onSave={handleSave}
              />
            ))}
          </div>
        )}

        {!loading && query && posts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
            <p className="text-gray-500">Попробуйте другой запрос</p>
          </div>
        )}

        {!query && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Начните поиск</h3>
            <p className="text-gray-500">Введите запрос для поиска постов</p>
          </div>
        )}
      </main>
    </div>
  );
}


