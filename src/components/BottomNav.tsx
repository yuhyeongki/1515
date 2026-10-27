import React from 'react';
import { Home, Bookmark, PlusCircle, Mail, Bell } from 'lucide-react';
import { CurrentUser } from '../types';

interface BottomNavProps {
  currentTab: 'feed' | 'bookmarks' | 'mailbox' | 'notifications';
  setCurrentTab: (tab: 'feed' | 'bookmarks' | 'mailbox' | 'notifications') => void;
  unreadCount: number;
  unreadLettersCount: number;
  currentUser: CurrentUser;
  onOpenCreateModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  unreadCount,
  unreadLettersCount,
  currentUser,
  onOpenCreateModal,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* Feed Tab */}
        <button
          onClick={() => setCurrentTab('feed')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'feed' ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-700'
          }`}
          aria-label="비밀피드"
        >
          <Home className={`w-5 h-5 ${currentTab === 'feed' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">피드</span>
        </button>

        {/* Bookmarks Tab */}
        <button
          onClick={() => setCurrentTab('bookmarks')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'bookmarks' ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-700'
          }`}
          aria-label="즐겨찾기"
        >
          <Bookmark className={`w-5 h-5 ${currentTab === 'bookmarks' ? 'stroke-[2.5] fill-neutral-900' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">보관함</span>
        </button>

        {/* Create Post Center Action */}
        <button
          onClick={onOpenCreateModal}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-rose-500 hover:text-rose-600 active:scale-95 transition-transform"
          aria-label="비밀 작성"
        >
          <PlusCircle className="w-7 h-7 stroke-[2.2] fill-rose-50" />
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-rose-600">비밀글</span>
        </button>

        {/* Mailbox Tab */}
        <button
          onClick={() => setCurrentTab('mailbox')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] relative transition-colors ${
            currentTab === 'mailbox' ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-700'
          }`}
          aria-label="비밀우체통"
        >
          <div className="relative">
            <Mail className={`w-5 h-5 ${currentTab === 'mailbox' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {currentUser.role === 'teacher' && unreadLettersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">우체통</span>
        </button>

        {/* Notifications Tab */}
        <button
          onClick={() => setCurrentTab('notifications')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] relative transition-colors ${
            currentTab === 'notifications' ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-700'
          }`}
          aria-label="알림"
        >
          <div className="relative">
            <Bell className={`w-5 h-5 ${currentTab === 'notifications' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 px-1 py-0.2 min-w-[14px] text-[9px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">알림</span>
        </button>
      </div>
    </div>
  );
};
