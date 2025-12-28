import React, { useState } from 'react';
import type { Category } from '@/lib/types';

interface CreatePostProps {
  categories: Category[];
  onCreatePost: (title: string, content: string, categoryIds: string[]) => void;
}

export function CreatePost({ categories, onCreatePost }: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim() && selectedCategories.length > 0) {
      onCreatePost(title, content, selectedCategories);
      setTitle('');
      setContent('');
      setSelectedCategories([]);
      setIsExpanded(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const maxTitleChars = 200;
  const maxContentChars = 1000;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
            Я
          </div>
          <div className="flex-1">
            {!isExpanded ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="Что нового?"
                className="w-full resize-none outline-none text-gray-800 placeholder-gray-400"
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Заголовок"
                  className="w-full outline-none text-gray-900 font-semibold placeholder-gray-400"
                  maxLength={maxTitleChars}
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="О чем вы думаете?"
                  className="w-full resize-none outline-none text-gray-800 placeholder-gray-400"
                  rows={4}
                  maxLength={maxContentChars}
                />
              </div>
            )}
            
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {categories.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-4 py-2 rounded-full text-sm transition-colors ${
                            selectedCategories.includes(cat.id)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    {selectedCategories.length === 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Выберите хотя бы одну категорию
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      {title.length}/{maxTitleChars} | {content.length}/{maxContentChars}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('');
                        setContent('');
                        setSelectedCategories([]);
                        setIsExpanded(false);
                      }}
                      className="px-6 py-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={!title.trim() || !content.trim() || selectedCategories.length === 0}
                      className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Опубликовать
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
