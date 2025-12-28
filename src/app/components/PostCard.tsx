import React from 'react';
import { Link } from 'react-router-dom';
import type { Post, User, Category } from '@/lib/types';

interface PostCardProps {
  post: Post;
  author?: User;
  categories: Category[];
  onLike: (id: string) => void;
  isSaved?: boolean;
  onSave?: (id: string) => void;
}

export function PostCard({ post, author, categories, onLike, isSaved, onSave }: PostCardProps) {
  const getCategoryColor = (categoryId: string) => {
    const colors: string[] = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-red-100 text-red-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-pink-100 text-pink-700',
    ];
    // Use category ID to get a consistent color
    const index = parseInt(categoryId.split('-')[0], 16) % colors.length;
    return colors[index] || 'bg-gray-100 text-gray-700';
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} д назад`;
  };

  const postCategories = post.categories
    ? categories.filter((c) => post.categories!.includes(c.id))
    : [];

  return (
    <Link to={`/posts/${post.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
            {author?.login?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/users/${post.author_id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {author?.login || 'Загрузка...'}
              </Link>
              <span className="text-gray-500">@{author?.login || '...'}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{formatTimestamp(post.created_at)}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
            <p className="text-gray-800 mb-3 whitespace-pre-wrap line-clamp-3">
              {post.content}
            </p>
            
            {postCategories.length > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {postCategories.map((category) => (
                  <span
                    key={category.id}
                    className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(category.id)}`}
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 text-gray-500">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onLike(post.id);
                }}
                className="flex items-center gap-2 hover:text-red-500 transition-colors group"
              >
                <svg
                  className="w-5 h-5 group-hover:fill-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              
              {onSave && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onSave(post.id);
                  }}
                  className={`flex items-center gap-2 transition-colors ml-auto ${
                    isSaved
                      ? 'text-blue-500 hover:text-blue-600'
                      : 'hover:text-blue-500'
                  }`}
                  title={isSaved ? 'Удалить из избранного' : 'Сохранить'}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
