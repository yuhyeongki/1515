import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Lock,
  Eye,
  Send,
  MoreHorizontal,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SecretPost, CurrentUser } from '../types';

interface PostCardProps {
  post: SecretPost;
  currentUser: CurrentUser;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onDeletePost?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onToggleLike,
  onToggleBookmark,
  onAddComment,
  onDeletePost,
}) => {
  const [isSpoilerRevealed, setIsSpoilerRevealed] = useState(!post.isSpoiler);
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const isLiked = post.likedBy.includes(currentUser.id);
  const isBookmarked = post.bookmarkedBy.includes(currentUser.id);

  // Instagram-style double tap to like
  const handleCardTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        onToggleLike(post.id);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
    setLastTap(now);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(post.id);
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
    setShowAllComments(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(
      `[우리반 시크릿] "${post.content.slice(0, 40)}..." - 우리반 익명 게시판에서 확인해보세요!`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Card background styling based on theme
  const getThemeStyles = () => {
    switch (post.theme) {
      case 'sunset':
        return 'bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 border-rose-100/80';
      case 'chalkboard':
        return 'bg-neutral-900 text-neutral-100 border-neutral-800 shadow-inner';
      case 'lavender':
        return 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-indigo-50 border-purple-100';
      case 'mint':
        return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-teal-100';
      case 'notebook':
        return 'bg-amber-50/50 border-amber-200/60 font-sans';
      case 'warm':
        return 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-100';
      case 'minimal':
      default:
        return 'bg-white border-neutral-200/80';
    }
  };

  const displayedComments = showAllComments ? post.comments : post.comments.slice(0, 2);

  return (
    <article className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden transition-all duration-200 hover:border-neutral-300 mb-6">
      {/* 1. Card Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring */}
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-rose-400 via-amber-400 to-indigo-500">
            <div className="w-full h-full rounded-full bg-white p-[1.5px] flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-lg ${post.authorBg}`}
              >
                {post.authorEmoji}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900 tracking-tight">
                {post.authorAlias}
              </span>
              {post.authorId === currentUser.id && (
                <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded-md">
                  내가 쓴 글
                </span>
              )}
            </div>
            {/* Zero-Pill metadata: unboxed text with bullet separators */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
              <span className="font-medium text-neutral-700">{post.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{post.createdAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {post.isSpoiler && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
              <Lock className="w-3 h-3" /> 스포일러 방지
            </span>
          )}
          {post.authorId === currentUser.id && onDeletePost && (
            <button
              onClick={() => onDeletePost(post.id)}
              className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors rounded-lg cursor-pointer text-xs"
              title="비밀글 삭제"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* 2. Card Content / Secret Box */}
      <div
        onClick={handleCardTap}
        className={`relative p-6 sm:p-8 cursor-pointer select-none transition-colors border-y ${getThemeStyles()}`}
      >
        {/* Double-tap heart pop animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-heart-burst drop-shadow-lg" />
          </div>
        )}

        {/* Secret content with spoiler blur support */}
        {post.isSpoiler && !isSpoilerRevealed ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-inner">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900 mb-1">
              비밀 내용이 가려져 있습니다
            </h4>
            <p className="text-xs text-neutral-500 mb-4 max-w-xs">
              중요한 정보나 깜짝 고백이 담겨 있어요. 터치하면 비밀이 공개됩니다.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSpoilerRevealed(true);
              }}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Eye className="w-4 h-4" /> 비밀 잠금 해제하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p
              className={`text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap break-keep ${
                post.theme === 'chalkboard' ? 'text-neutral-100 font-mono' : 'text-neutral-800'
              }`}
            >
              {post.content}
            </p>

            {post.isSpoiler && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSpoilerRevealed(false);
                  }}
                  className={`text-[11px] underline transition-colors cursor-pointer ${
                    post.theme === 'chalkboard'
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  비밀 다시 가리기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Action Bar (Instagram style: Heart, Comment, Share, Bookmark) */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Heart Button */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-transform active:scale-125 cursor-pointer ${
                isLiked
                  ? 'text-rose-500 hover:text-rose-600 bg-rose-50'
                  : 'text-neutral-700 hover:text-rose-500 hover:bg-neutral-100'
              }`}
              aria-label="공감하기"
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  isLiked ? 'fill-rose-500 stroke-rose-500 scale-105' : 'stroke-[1.9]'
                }`}
              />
            </button>

            {/* Comment Bubble Button */}
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="flex items-center justify-center w-9 h-9 rounded-full text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="댓글 보기"
            >
              <MessageCircle className="w-6 h-6 stroke-[1.9]" />
            </button>

            {/* Share / Copy button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-9 h-9 rounded-full text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors relative cursor-pointer"
              aria-label="공유하기"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              ) : (
                <Share2 className="w-5 h-5 stroke-[1.9]" />
              )}
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(post.id)}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-transform active:scale-110 cursor-pointer ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            aria-label="즐겨찾기 보관함 저장"
          >
            <Bookmark
              className={`w-6 h-6 ${
                isBookmarked ? 'fill-amber-500 stroke-amber-500' : 'stroke-[1.9]'
              }`}
            />
          </button>
        </div>

        {/* Likes Count & Feedback */}
        <div className="mb-3 text-xs sm:text-sm text-neutral-800 font-semibold tracking-tight">
          익명의 친구 <span className="tabular-nums font-bold text-neutral-900">{post.likes}</span>명이 공감했어요
          {isBookmarked && (
            <span className="ml-2 font-normal text-amber-700 text-xs">· 보관함에 저장됨</span>
          )}
        </div>

        {/* 4. Comments Section */}
        {post.comments.length > 0 && (
          <div className="space-y-2 mb-3">
            {post.comments.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer block"
              >
                댓글 {post.comments.length}개 모두 보기
              </button>
            )}

            <div className="space-y-2 divide-y divide-neutral-50">
              {displayedComments.map((comment) => (
                <div key={comment.id} className="pt-2 first:pt-0 flex items-start gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${comment.authorBg}`}
                  >
                    {comment.authorEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-neutral-900">
                        {comment.authorAlias}
                      </span>
                      {comment.isTeacher && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                          <ShieldCheck className="w-3 h-3" /> 선생님
                        </span>
                      )}
                      {comment.isAuthor && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                          글쓴이
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-400 tabular-nums">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 mt-0.5 leading-relaxed break-keep">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Add Comment Input Bar */}
        <form
          onSubmit={handleCommentSubmit}
          className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${currentUser.avatarBg}`}
          >
            {currentUser.avatarEmoji}
          </div>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              currentUser.role === 'teacher'
                ? '선생님으로서 따뜻한 격려 댓글 남기기...'
                : `${currentUser.name}(으)로 익명 댓글 달기...`
            }
            className="flex-1 text-xs py-2 px-3 bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white rounded-xl border border-transparent focus:border-neutral-300 focus:outline-none transition-all placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 text-rose-500 hover:text-rose-600 disabled:text-neutral-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="댓글 등록"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </article>
  );
};
