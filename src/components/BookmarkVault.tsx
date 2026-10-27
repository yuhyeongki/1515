import React, { useState } from 'react';
import { Bookmark, Lock, ArrowLeft, Heart, MessageCircle } from 'lucide-react';
import { SecretPost, CurrentUser, PostCategory } from '../types';
import { PostCard } from './PostCard';

interface BookmarkVaultProps {
  posts: SecretPost[];
  currentUser: CurrentUser;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onBackToFeed: () => void;
}

export const BookmarkVault: React.FC<BookmarkVaultProps> = ({
  posts,
  currentUser,
  onToggleLike,
  onToggleBookmark,
  onAddComment,
  onBackToFeed,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('전체');

  // Filter bookmarked posts for this current user
  const bookmarkedPosts = posts.filter((p) => p.bookmarkedBy.includes(currentUser.id));

  const filteredPosts =
    selectedCategory === '전체'
      ? bookmarkedPosts
      : bookmarkedPosts.filter((p) => p.category === selectedCategory);

  const categories: PostCategory[] = [
    '전체',
    '짝사랑',
    '고민',
    '시험/공부',
    '급식',
    '웃긴일',
    '속마음',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-amber-500 stroke-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 leading-tight">
              나의 비밀 즐겨찾기 보관함
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              공감되거나 나중에 다시 보고 싶은 비밀글들만 모아뒀어요
            </p>
          </div>
        </div>

        <button
          onClick={onBackToFeed}
          className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>피드로 이동</span>
        </button>
      </div>

      {/* Category filter segmented control */}
      {bookmarkedPosts.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1.5 bg-neutral-100 rounded-2xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-neutral-900 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Posts Feed or Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
            <Bookmark className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-neutral-800 mb-1">
            {selectedCategory === '전체'
              ? '보관된 비밀글이 없습니다'
              : `'${selectedCategory}' 카테고리에 보관된 글이 없습니다`}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5 leading-relaxed">
            비밀 피드를 둘러보다가 마음에 드는 글의 오른쪽 하단 북마크 아이콘을 누르면 이곳에 나만의 비밀 컬렉션으로 보관됩니다.
          </p>
          <button
            onClick={onBackToFeed}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            피드에서 비밀글 보러가기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onToggleLike={onToggleLike}
              onToggleBookmark={onToggleBookmark}
              onAddComment={onAddComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
