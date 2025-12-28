import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { categoriesAPI, usersAPI } from '@/lib/api';
import type { Category } from '@/lib/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { APIClientError } from '@/lib/api-client';

interface CategoryFormData {
  name: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [likedCategories, setLikedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [togglingLike, setTogglingLike] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadCategories(), loadLikedCategories()]);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await categoriesAPI.getAllCategories(100);
      setCategories(cats);
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка загрузки категорий');
      }
    } finally {
      setLoading(false);
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

  const toggleLike = async (categoryId: string) => {
    const isLiked = likedCategories.includes(categoryId);
    setTogglingLike(categoryId);

    try {
      if (isLiked) {
        await usersAPI.unlikeCategory(categoryId);
        setLikedCategories(likedCategories.filter((id) => id !== categoryId));
        toast.success('Вы отписались от категории');
      } else {
        await usersAPI.likeCategory(categoryId);
        setLikedCategories([...likedCategories, categoryId]);
        toast.success('Вы подписались на категорию');
      }
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка обновления подписки');
      }
    } finally {
      setTogglingLike(null);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setCreating(true);
    try {
      const newCategory = await categoriesAPI.createCategory(data.name.trim());
      setCategories([...categories, newCategory]);
      reset();
      toast.success('Категория создана!');
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка создания категории');
      }
    } finally {
      setCreating(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      'технологии': '💻',
      'дизайн': '🎨',
      'новости': '📰',
      'разработка': '⚡',
      'образование': '📚',
      'развлечения': '🎮',
      'наука': '🔬',
      'спорт': '⚽',
      'путешествия': '✈️',
      'еда': '🍕',
    };
    return icons[name.toLowerCase()] || '📝';
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Категории</h1>
          <p className="text-gray-600">
            Управление категориями для организации постов
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Форма создания категории */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Создать новую категорию
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Название категории</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Например: Технологии"
                  {...register('name', {
                    required: 'Название обязательно',
                    minLength: {
                      value: 2,
                      message: 'Минимум 2 символа',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Максимум 50 символов',
                    },
                  })}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <Button type="submit" disabled={creating} className="w-full">
                {creating ? 'Создание...' : 'Создать категорию'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Подписки на категории
              </h3>
              <p className="text-sm text-blue-700">
                Подпишитесь на интересные категории справа, чтобы видеть
                персонализированную ленту с постами из выбранных категорий на
                главной странице!
              </p>
            </div>
          </div>

          {/* Список существующих категорий */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Существующие категории ({categories.length})
              </h2>
              {likedCategories.length > 0 && (
                <span className="text-sm text-blue-600">
                  {likedCategories.length} подписок
                </span>
              )}
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📂</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Нет категорий
                </h3>
                <p className="text-gray-500">
                  Создайте первую категорию, чтобы начать организовывать посты
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {categories.map((category) => {
                  const isLiked = likedCategories.includes(category.id);
                  return (
                    <div
                      key={category.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isLiked
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-2xl">
                        {getCategoryIcon(category.name)}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {category.name}
                        </div>
                        {isLiked && (
                          <div className="text-xs text-blue-600">
                            ✓ Вы подписаны
                          </div>
                        )}
                      </div>
                      <Button
                        variant={isLiked ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleLike(category.id)}
                        disabled={togglingLike === category.id}
                      >
                        {togglingLike === category.id
                          ? '...'
                          : isLiked
                          ? 'Отписаться'
                          : 'Подписаться'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Как использовать категории
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Создайте</h4>
                <p className="text-sm text-gray-600">
                  Добавьте категории для разных типов контента
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Выберите</h4>
                <p className="text-sm text-gray-600">
                  При создании поста выберите подходящую категорию
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Подпишитесь</h4>
                <p className="text-sm text-gray-600">
                  Нажмите "Подписаться" чтобы видеть посты из этой категории
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

