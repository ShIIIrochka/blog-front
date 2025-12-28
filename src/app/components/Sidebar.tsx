import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usersAPI } from '@/lib/api';
import type { Category } from '@/lib/types';
import { APIClientError } from '@/lib/api-client';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categoryIcons: { [key: string]: string } = {
  'технологии': '💻',
  'дизайн': '🎨',
  'новости': '📰',
  'разработка': '⚡',
  'образование': '📚',
  'развлечения': '🎮',
};

export function Sidebar({ categories, selectedCategory, onCategoryChange }: SidebarProps) {
  const [likedCategories, setLikedCategories] = useState<string[]>([]);
  const [togglingLike, setTogglingLike] = useState<string | null>(null);

  useEffect(() => {
    loadLikedCategories();
  }, []);

  const loadLikedCategories = async () => {
    try {
      const liked = await usersAPI.getLikedCategories();
      setLikedCategories(liked);
    } catch (error) {
      console.error('Error loading liked categories:', error);
    }
  };

  const toggleLike = async (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedCategories.includes(categoryId);
    setTogglingLike(categoryId);

    try {
      if (isLiked) {
        await usersAPI.unlikeCategory(categoryId);
        setLikedCategories(likedCategories.filter((id) => id !== categoryId));
        toast.success('Отписка выполнена');
      } else {
        await usersAPI.likeCategory(categoryId);
        setLikedCategories([...likedCategories, categoryId]);
        toast.success('Подписка оформлена');
      }
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка');
      }
    } finally {
      setTogglingLike(null);
    }
  };

  const getIcon = (name: string) => {
    return categoryIcons[name.toLowerCase()] || '📝';
  };

  return (
    <div className="sticky top-6">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold text-gray-900 mb-4">Категории</h2>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-xl">🌐</span>
            <span className="font-medium">Все</span>
          </button>
          {categories.map((cat) => {
            const isLiked = likedCategories.includes(cat.id);
            return (
              <div
                key={cat.id}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <button
                  onClick={() => onCategoryChange(cat.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span className="text-xl">{getIcon(cat.name)}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
                <button
                  onClick={(e) => toggleLike(cat.id, e)}
                  disabled={togglingLike === cat.id}
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isLiked
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                  title={isLiked ? 'Отписаться' : 'Подписаться'}
                >
                  {togglingLike === cat.id ? (
                    '...'
                  ) : isLiked ? (
                    <span className="text-xs">✓</span>
                  ) : (
                    <span className="text-xs">+</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
