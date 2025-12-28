import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </div>
              <h1 className="font-bold text-xl text-gray-900">МикроБлог</h1>
            </Link>
            
            {user && (
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-500 transition-colors"
                >
                  Главная
                </Link>
                <Link
                  to="/search"
                  className="text-gray-700 hover:text-blue-500 transition-colors"
                >
                  Поиск
                </Link>
                <Link
                  to="/categories"
                  className="text-gray-700 hover:text-blue-500 transition-colors"
                >
                  Категории
                </Link>
                <Link
                  to="/saved"
                  className="text-gray-700 hover:text-blue-500 transition-colors"
                >
                  Избранное
                </Link>
                <Link
                  to="/posts/new"
                  className="text-gray-700 hover:text-blue-500 transition-colors"
                >
                  Создать пост
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-500 transition-colors"
                >
                  Профиль
                </Link>
              </nav>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}


