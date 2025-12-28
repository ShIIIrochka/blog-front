import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { postsAPI, categoriesAPI } from '@/lib/api';
import type { Category } from '@/lib/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { APIClientError } from '@/lib/api-client';

interface CreatePostFormData {
  title: string;
  content: string;
}

export function CreatePostPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePostFormData>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    setCategoriesError(null);
    try {
      const cats = await categoriesAPI.getAllCategories();
      setCategories(cats);
      if (cats.length === 0) {
        setCategoriesError('Категории не найдены. Обратитесь к администратору.');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategoriesError('Ошибка загрузки категорий');
      toast.error('Не удалось загрузить категории');
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Введите название категории');
      return;
    }

    setCreatingCategory(true);
    try {
      const newCategory = await categoriesAPI.createCategory(newCategoryName.trim());
      setCategories([...categories, newCategory]);
      setSelectedCategories([...selectedCategories, newCategory.id]);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      toast.success('Категория создана!');
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка создания категории');
      }
    } finally {
      setCreatingCategory(false);
    }
  };

  const onSubmit = async (data: CreatePostFormData) => {
    if (selectedCategories.length === 0) {
      toast.error('Выберите хотя бы одну категорию');
      return;
    }
    
    setIsLoading(true);
    try {
      const post = await postsAPI.createPost({
        title: data.title,
        content: data.content,
        categories: selectedCategories,
      });
      toast.success('Пост создан!');
      navigate(`/posts/${post.id}`);
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка создания поста');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Создать пост</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                type="text"
                {...register('title', {
                  required: 'Заголовок обязателен',
                  minLength: {
                    value: 3,
                    message: 'Заголовок должен быть не менее 3 символов',
                  },
                  maxLength: {
                    value: 200,
                    message: 'Заголовок должен быть не более 200 символов',
                  },
                })}
                className="mt-1"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="content">Содержание</Label>
              <Textarea
                id="content"
                {...register('content', {
                  required: 'Содержание обязательно',
                  minLength: {
                    value: 10,
                    message: 'Содержание должно быть не менее 10 символов',
                  },
                })}
                className="mt-1"
                rows={10}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>
                  Категории <span className="text-red-500">*</span>
                </Label>
                {!loadingCategories && !categoriesError && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                  >
                    {showNewCategoryInput ? 'Отмена' : '+ Создать категорию'}
                  </Button>
                )}
              </div>
              
              {showNewCategoryInput && (
                <div className="mb-3 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Название категории"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateCategory();
                      }
                    }}
                    disabled={creatingCategory}
                  />
                  <Button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                    size="sm"
                  >
                    {creatingCategory ? 'Создание...' : 'Добавить'}
                  </Button>
                </div>
              )}
              
              {loadingCategories ? (
                <div className="mt-2 text-gray-500">Загрузка категорий...</div>
              ) : categoriesError ? (
                <div className="mt-2">
                  <p className="text-red-600 mb-2">{categoriesError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadCategories}
                  >
                    Повторить попытку
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                          selectedCategories.includes(category.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                  {categories.length === 0 && (
                    <p className="mt-2 text-gray-500 text-sm">
                      Категорий пока нет. Создайте первую категорию!
                    </p>
                  )}
                  {selectedCategories.length === 0 && categories.length > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      Выберите хотя бы одну категорию
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isLoading || selectedCategories.length === 0}
              >
                {isLoading ? 'Создание...' : 'Создать пост'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

