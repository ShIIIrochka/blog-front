import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usersAPI, postsAPI, categoriesAPI } from '@/lib/api';
import type { User, Post, Category } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import { Button } from '@/app/components/ui/button';
import { APIClientError } from '@/lib/api-client';

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUser();
      loadUserPosts();
      loadCategories();
      loadSavedPosts();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      const userData = await usersAPI.getUserById(userId!);
      setUser(userData);
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка загрузки профиля');
      }
    }
  };

  const loadUserPosts = async () => {
    try {
      const userPosts = await postsAPI.getPostsByAuthor(userId!);
      setPosts(userPosts);
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка загрузки постов');
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

  const loadSavedPosts = async () => {
    try {
      const saved = await usersAPI.getSavedPosts();
      setSavedPosts(new Set(saved.map((p) => p.id)));
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  };

  const handleFollow = async () => {
    if (!userId) return;
    
    setFollowLoading(true);
    try {
      if (following) {
        await usersAPI.unfollowUser(userId);
        setFollowing(false);
        toast.success('Вы отписались');
      } else {
        await usersAPI.followUser(userId);
        setFollowing(true);
        toast.success('Вы подписались!');
      }
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка подписки');
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    console.log('Like post:', id);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Пользователь не найден</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl">
                {user.login[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.login}</h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
            
            {!isOwnProfile && currentUser && (
              <Button
                onClick={handleFollow}
                disabled={followLoading}
                variant={following ? 'outline' : 'default'}
              >
                {followLoading
                  ? 'Загрузка...'
                  : following
                  ? 'Отписаться'
                  : 'Подписаться'}
              </Button>
            )}
          </div>
        </div>

        {/* Posts Count */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Посты ({posts.length})
          </h2>
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={user}
                categories={categories}
                onLike={handleLike}
                isSaved={savedPosts.has(post.id)}
                onSave={handleSave}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Нет постов</h3>
            <p className="text-gray-500">
              {isOwnProfile
                ? 'Вы еще не создали ни одного поста'
                : 'Этот пользователь еще не создал ни одного поста'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

