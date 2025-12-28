import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { SavedPage } from './pages/SavedPage';
import { PostDetailsPage } from './pages/PostDetailsPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { EditPostPage } from './pages/EditPostPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { UserProfilePage } from './pages/UserProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <FeedPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Layout>
                  <SearchPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Layout>
                  <SavedPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/posts/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreatePostPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/posts/:postId"
            element={
              <ProtectedRoute>
                <Layout>
                  <PostDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/posts/:postId/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditPostPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoriesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/:userId"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
