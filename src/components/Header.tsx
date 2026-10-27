import React from 'react';
import { Lock, Heart, Bookmark, Mail, Bell, Plus, User, ShieldCheck } from 'lucide-react';
import { CurrentUser } from '../types';

interface HeaderProps {
  currentTab: 'feed' | 'bookmarks' | 'mailbox' | 'notifications';
  setCurrentTab: (tab: 'feed' | 'bookmarks' | 'mailbox' | 'notifications') => void;
  currentUser: CurrentUser;
  unreadCount: number;
  unreadLettersCount: number;
  onOpenCreateModal: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  unreadCount,
  unreadLettersCount,
  onOpenCreateModal,
  onOpenLoginModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (One-line single element) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentTab('feed')}
            className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-[2px] shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Lock className="w-4 h-4 text-rose-500 stroke-[2.2]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 leading-none">
                우리반 시크릿
              </span>
              <span className="text-[11px] text-neutral-400 font-medium tracking-tight mt-0.5">
                {currentUser.classCode} 익명 소통망
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed text links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 shrink-0">
          <button
            onClick={() => setCurrentTab('feed')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentTab === 'feed'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            비밀피드
          </button>

          <button
            onClick={() => setCurrentTab('bookmarks')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentTab === 'bookmarks'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            즐겨찾기 보관함
          </button>

          <button
            onClick={() => setCurrentTab('mailbox')}
            className={`whitespace-nowrap transition-colors py-1 relative cursor-pointer ${
              currentTab === 'mailbox'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            선생님 비밀우체통
            {currentUser.role === 'teacher' && unreadLettersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                {unreadLettersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('notifications')}
            className={`whitespace-nowrap transition-colors py-1 relative cursor-pointer ${
              currentTab === 'notifications'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            알림
            {unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Profile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>비밀 작성</span>
          </button>

          {/* User persona switcher */}
          <button
            onClick={onOpenLoginModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-300 text-xs font-medium transition-colors cursor-pointer shrink-0 ${currentUser.avatarBg}`}
            title="사용자 전환 / 로그인 설정"
          >
            <span className="text-sm leading-none">{currentUser.avatarEmoji}</span>
            <span className="hidden sm:inline font-semibold text-neutral-800 max-w-[90px] truncate">
              {currentUser.role === 'teacher' ? '담임선생님' : currentUser.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
