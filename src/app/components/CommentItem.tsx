import React, { useState } from 'react';
import { toast } from 'sonner';
import { commentsAPI } from '@/lib/api';
import type { Comment, User } from '@/lib/types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { APIClientError } from '@/lib/api-client';

interface CommentItemProps {
  comment: Comment;
  author: User | undefined;
  currentUserId: string | undefined;
  onUpdate: (commentId: string, newContent: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentCommentId: string, content: string) => void;
}

export function CommentItem({
  comment,
  author,
  currentUserId,
  onUpdate,
  onDelete,
  onReply,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = currentUserId === comment.author_id;

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error('Комментарий не может быть пустым');
      return;
    }

    setSubmitting(true);
    try {
      await commentsAPI.updateComment(comment.id, { content: editContent });
      onUpdate(comment.id, editContent);
      setIsEditing(false);
      toast.success('Комментарий обновлен');
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка обновления комментария');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    setSubmitting(true);
    try {
      await commentsAPI.deleteComment(comment.id);
      onDelete(comment.id);
      toast.success('Комментарий удален');
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка удаления комментария');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Ответ не может быть пустым');
      return;
    }

    setSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
      toast.success('Ответ добавлен');
    } catch (error) {
      if (error instanceof APIClientError) {
        toast.error(error.detail);
      } else {
        toast.error('Ошибка добавления ответа');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
          {author?.login?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-gray-900">
              {author?.login || 'Загрузка...'}
            </span>
            <span className="text-gray-500 text-sm">
              {new Date(comment.created_at).toLocaleDateString('ru-RU')}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-gray-400 text-xs">(изменено)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={submitting || !editContent.trim()}
                >
                  {submitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={submitting}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-800 break-words">{comment.content}</p>
              
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Ответить
                </button>
                
                {isOwner && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-sm text-red-600 hover:text-red-700"
                      disabled={submitting}
                    >
                      Удалить
                    </button>
                  </>
                )}
              </div>

              {isReplying && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Напишите ответ..."
                    className="w-full"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={submitting || !replyContent.trim()}
                    >
                      {submitting ? 'Отправка...' : 'Ответить'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent('');
                      }}
                      disabled={submitting}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

