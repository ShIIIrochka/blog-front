import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { postsAPI, usersAPI, categoriesAPI } from '@/lib/api';
import type { Post, User, Category } from '@/lib/types';
import { PostCard } from '../components/PostCard';
import { CreatePost } from '../components/CreatePost';
import { Sidebar } from '../components/Sidebar';
import { APIClientError } from '@/lib/api-client';

// Cache for user data
const userCache = new Map<string, User>();

type FeedType = 'personalized' | 'following';

export function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [likedCategories, setLikedCategories] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<FeedType>('personalized');
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    loadFeed();
    loadCategories();
    loadLikedCategories();
    loadSavedPosts();
  }, [feedType]);

  const loadFeed = async () => {
    try {
      const page = feedType === 'personalized'
        ? await usersAPI.getPersonalizedFeed()
        : await usersAPI.getFeed();
      setPosts(page.items);
      // Load author data for posts
      const authorIds = [...new Set(page.items.map((p) => p.author_id))];
      await loadAuthors(authorIds);
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка загрузки ленты');
      }
    } finally {
      setLoading(false);
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

  const loadLikedCategories = async () => {
    try {
      const liked = await usersAPI.getLikedCategories();
      setLikedCategories(liked);
    } catch (error) {
      console.error('Error loading liked categories:', error);
    }
  };

  const loadSavedPosts = async () => {
    try {
      const saved = await usersAPI.getSavedPosts();
      setSavedPosts(new Set(saved.map((p) => p.id)));
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  };

  const loadAuthors = async (authorIds: string[]) => {
    const newAuthors = new Map(authors);
    
    for (const authorId of authorIds) {
      if (!newAuthors.has(authorId) && !userCache.has(authorId)) {
        try {
          const user = await usersAPI.getUserById(authorId);
          userCache.set(authorId, user);
          newAuthors.set(authorId, user);
        } catch (error) {
          console.error(`Error loading author ${authorId}:`, error);
        }
      } else if (userCache.has(authorId)) {
        newAuthors.set(authorId, userCache.get(authorId)!);
      }
    }
    
    setAuthors(newAuthors);
  };

  const handleCreatePost = async (title: string, content: string, categoryIds: string[]) => {
    if (categoryIds.length === 0) {
      toast.error('Выберите хотя бы одну категорию');
      return;
    }
    
    try {
      const newPost = await postsAPI.createPost({
        title,
        content,
        categories: categoryIds,
      });
      setPosts([newPost, ...posts]);
      toast.success('Пост создан!');
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка создания поста');
      }
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

  const filteredPosts = feedType === 'personalized' && selectedCategory
    ? posts.filter((post) => post.categories?.includes(selectedCategory))
    : posts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <Sidebar
            categories={categories}
            selectedCategory={feedType === 'personalized' ? selectedCategory : null}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              setFeedType('personalized');
            }}
          />
        </aside>

        {/* Main Feed */}
        <div className="lg:col-span-6 space-y-4">
          {/* Feed Type Selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex">
            <button
              onClick={() => {
                setFeedType('personalized');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                feedType === 'personalized'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              По интересам
            </button>
            <button
              onClick={() => {
                setFeedType('following');
                setSelectedCategory(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                feedType === 'following'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Подписки
            </button>
          </div>

          {likedCategories.length > 0 && !selectedCategory && feedType === 'personalized' && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✨</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Персонализированная лента
                  </h3>
                  <p className="text-sm text-gray-600">
                    Вы подписаны на {likedCategories.length}{' '}
                    {likedCategories.length === 1
                      ? 'категорию'
                      : likedCategories.length < 5
                      ? 'категории'
                      : 'категорий'}
                    . Показываются посты из ваших интересов!
                  </p>
                </div>
                <Link
                  to="/categories"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  Управление →
                </Link>
              </div>
            </div>
          )}

          {likedCategories.length === 0 && !selectedCategory && feedType === 'personalized' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Подпишитесь на категории
                  </h3>
                  <p className="text-sm text-gray-600">
                    Подпишитесь на интересные категории, чтобы видеть
                    персонализированную ленту!
                  </p>
                </div>
                <Link
                  to="/categories"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  Выбрать →
                </Link>
              </div>
            </div>
          )}

          <CreatePost categories={categories} onCreatePost={handleCreatePost} />

          {selectedCategory && feedType === 'personalized' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-3 flex items-center justify-between">
              <span className="text-blue-700">
                Фильтр:{' '}
                <span className="font-semibold">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                Сбросить
              </button>
            </div>
          )}

          <div className="space-y-4">
            {filteredPosts.map((post) => (
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

          {filteredPosts.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <h3 className="font-semibold text-gray-900 mb-2">Нет постов</h3>
              <p className="text-gray-500 mb-4">
                {selectedCategory
                  ? 'В этой категории пока нет постов'
                  : likedCategories.length === 0
                  ? 'Подпишитесь на категории, чтобы видеть персонализированную ленту'
                  : 'В выбранных категориях пока нет постов'}
              </p>
              {!selectedCategory && likedCategories.length === 0 && (
                <Link to="/categories">
                  <Button>Выбрать категории</Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Кого читать</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Функция поиска пользователей будет добавлена позже
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

