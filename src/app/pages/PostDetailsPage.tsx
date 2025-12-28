import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { postsAPI, commentsAPI, usersAPI, categoriesAPI } from '@/lib/api';
import type { Post, Comment, User, Category } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import { CommentItem } from '../components/CommentItem';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { APIClientError } from '@/lib/api-client';

export function PostDetailsPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState<User | null>(null);
  const [commentAuthors, setCommentAuthors] = useState<Map<string, User>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
      loadCategories();
      checkIfSaved();
    }
  }, [postId]);

  const checkIfSaved = async () => {
    try {
      const saved = await usersAPI.getSavedPosts();
      setIsSaved(saved.some((p) => p.id === postId));
    } catch (error) {
      console.error('Error checking saved status:', error);
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

  const loadPost = async () => {
    try {
      const postData = await postsAPI.getPost(postId!);
      setPost(postData);
      
      // Load author
      const authorData = await usersAPI.getUserById(postData.author_id);
      setAuthor(authorData);
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка загрузки поста');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentsData = await commentsAPI.getCommentsByPost(postId!);
      setComments(commentsData);
      
      // Load comment authors
      const authorIds = [...new Set(commentsData.map((c) => c.author_id))];
      await loadCommentAuthors(authorIds);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadCommentAuthors = async (authorIds: string[]) => {
    const newAuthors = new Map(commentAuthors);
    
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
    
    setCommentAuthors(newAuthors);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await commentsAPI.createComment(postId!, {
        content: newComment,
      });
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Комментарий добавлен!');
      
      // Reload comment authors
      if (!commentAuthors.has(comment.author_id)) {
        const author = await usersAPI.getUserById(comment.author_id);
        setCommentAuthors(new Map(commentAuthors.set(comment.author_id, author)));
      }
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка добавления комментария');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    console.log('Like post:', id);
  };

  const handleSave = async (postId: string) => {
    try {
      if (isSaved) {
        await usersAPI.unsavePost(postId);
        setIsSaved(false);
        toast.success('Пост удален из избранного');
      } else {
        await usersAPI.savePost(postId);
        setIsSaved(true);
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

  const handleUpdateComment = (commentId: string, newContent: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, content: newContent, updated_at: new Date().toISOString() } : c
      )
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  const handleReplyToComment = async (parentCommentId: string, content: string) => {
    try {
      const newComment = await commentsAPI.replyToComment(parentCommentId, { content });
      setComments([...comments, newComment]);
      
      // Load author for new comment if needed
      if (!commentAuthors.has(newComment.author_id)) {
        const author = await usersAPI.getUserById(newComment.author_id);
        setCommentAuthors(new Map(commentAuthors.set(newComment.author_id, author)));
      }
    } catch (error) {
      throw error; // Let CommentItem handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Пост не найден</div>
      </div>
    );
  }

  const isAuthor = user && post && user.id === post.author_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostCard
          post={post}
          author={author || undefined}
          categories={categories}
          onLike={handleLike}
          isSaved={isSaved}
          onSave={handleSave}
        />

        {isAuthor && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => navigate(`/posts/${postId}/edit`)}
            >
              Редактировать пост
            </Button>
          </div>
        )}

        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Комментарии ({comments.length})
          </h2>

          {user && (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите комментарий..."
                className="mb-2"
                rows={3}
              />
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Отправка...' : 'Отправить'}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            {comments.map((comment) => {
              const commentAuthor = commentAuthors.get(comment.author_id);
              return (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  author={commentAuthor}
                  currentUserId={user?.id}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                  onReply={handleReplyToComment}
                />
              );
            })}

            {comments.length === 0 && (
              <p className="text-gray-500 text-center py-8">Пока нет комментариев</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


