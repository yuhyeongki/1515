import React, { useState } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  Mail,
  CheckCheck,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onNavigateToTarget: (targetId?: string, type?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
  onNavigateToTarget,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const unreadTotal = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-50" />;
      case 'teacher_reply':
        return <Mail className="w-4 h-4 text-emerald-600 fill-emerald-50" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header bar */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Bell className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 leading-tight">
              비밀글 알림함
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              내 글에 달린 공감과 댓글, 선생님의 비밀 답장 소식입니다
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadTotal > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>모두 읽음</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="px-2.5 py-1.5 rounded-xl text-neutral-400 hover:text-rose-600 text-xs transition-colors cursor-pointer"
              title="알림 전체 비우기"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-2xl w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-white text-neutral-900 shadow-xs font-bold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          전체 ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-white text-neutral-900 shadow-xs font-bold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          안 읽음 ({unreadTotal})
        </button>
      </div>

      {/* Notification List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-3">
            <Bell className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-bold text-neutral-800 mb-1">
            {filter === 'unread' ? '새로운 안 읽은 알림이 없습니다' : '알림 내역이 비어 있습니다'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            내 비밀글에 친구들이 공감하거나 댓글을 남기면 실시간으로 알려드립니다.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkAsRead(notif.id);
                onNavigateToTarget(notif.targetId, notif.type);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                notif.isRead
                  ? 'bg-white border-neutral-200/70 hover:border-neutral-300'
                  : 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50/70 shadow-xs'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold truncate ${
                      notif.isRead ? 'text-neutral-800' : 'text-neutral-950 font-extrabold'
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-neutral-400 whitespace-nowrap shrink-0 tabular-nums">
                    {notif.createdAt}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
