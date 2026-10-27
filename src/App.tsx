/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Plus,
  Flame,
  Clock,
  MessageSquare,
  Search,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Mail,
  Bell,
  Heart,
  TrendingUp,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import {
  CurrentUser,
  SecretPost,
  ClassStory,
  TeacherSecretLetter,
  AppNotification,
  PostCategory,
  CardTheme,
} from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getPosts,
  savePosts,
  getStories,
  saveStories,
  getTeacherLetters,
  saveTeacherLetters,
  getNotifications,
  saveNotifications,
  addNotification,
  resetToDefaultData,
} from './services/storage';
import {
  apiFetchPosts,
  apiCreatePost,
  apiToggleLike,
  apiToggleBookmark,
  apiAddComment,
  apiDeletePost,
  apiFetchStories,
  apiCreateStory,
  apiFetchLetters,
  apiCreateLetter,
  apiReplyLetter,
  apiFetchNotifications,
  apiCreateNotification,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  apiClearNotifications,
} from './services/api';
import { isSupabaseConfigured } from './lib/supabase';
import {
  fetchPostsFromSupabase,
  createPostInSupabase,
  toggleLikeInSupabase,
  toggleBookmarkInSupabase,
  addCommentInSupabase,
  deletePostInSupabase,
  fetchStoriesFromSupabase,
  createStoryInSupabase,
  fetchLettersFromSupabase,
  createLetterInSupabase,
  replyLetterInSupabase,
  fetchNotificationsFromSupabase,
  createNotificationInSupabase,
  markNotificationReadInSupabase,
  subscribeToSupabase,
} from './services/supabaseService';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { StoriesBar } from './components/StoriesBar';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { TeacherMailbox } from './components/TeacherMailbox';
import { BookmarkVault } from './components/BookmarkVault';
import { NotificationCenter } from './components/NotificationCenter';
import { LoginModal } from './components/LoginModal';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';

const CATEGORIES: PostCategory[] = [
  '전체',
  '속마음',
  '짝사랑',
  '고민',
  '시험/공부',
  '급식',
  '웃긴일',
  '선생님',
];

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'feed' | 'bookmarks' | 'mailbox' | 'notifications'>('feed');

  // Core Data State
  const [currentUser, setCurrentUserState] = useState<CurrentUser>(() => getCurrentUser());
  const [posts, setPosts] = useState<SecretPost[]>(() => getPosts());
  const [stories, setStories] = useState<ClassStory[]>(() => getStories());
  const [teacherLetters, setTeacherLetters] = useState<TeacherSecretLetter[]>(() => getTeacherLetters());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications());

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'comments'>('latest');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Sync to Database (Supabase if configured, or Server API / LocalStorage)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (isSupabaseConfigured) {
        const [sbPosts, sbStories, sbLetters, sbNotifs] = await Promise.all([
          fetchPostsFromSupabase(),
          fetchStoriesFromSupabase(),
          fetchLettersFromSupabase(),
          fetchNotificationsFromSupabase(currentUser.id),
        ]);
        if (!isMounted) return;
        if (sbPosts && sbPosts.length > 0) {
          setPosts(sbPosts);
          savePosts(sbPosts);
        }
        if (sbStories && sbStories.length > 0) {
          setStories(sbStories);
          saveStories(sbStories);
        }
        if (sbLetters && sbLetters.length > 0) {
          setTeacherLetters(sbLetters);
          saveTeacherLetters(sbLetters);
        }
        if (sbNotifs && sbNotifs.length > 0) {
          setNotifications(sbNotifs);
          saveNotifications(sbNotifs);
        }
      } else {
        const [remotePosts, remoteStories, remoteLetters, remoteNotifs] = await Promise.all([
          apiFetchPosts(),
          apiFetchStories(),
          apiFetchLetters(),
          apiFetchNotifications(currentUser.id),
        ]);
        if (!isMounted) return;
        if (remotePosts && remotePosts.length > 0) {
          setPosts(remotePosts);
          savePosts(remotePosts);
        }
        if (remoteStories && remoteStories.length > 0) {
          setStories(remoteStories);
          saveStories(remoteStories);
        }
        if (remoteLetters && remoteLetters.length > 0) {
          setTeacherLetters(remoteLetters);
          saveTeacherLetters(remoteLetters);
        }
        if (remoteNotifs && remoteNotifs.length > 0) {
          setNotifications(remoteNotifs);
          saveNotifications(remoteNotifs);
        }
      }
    }

    loadData();

    // Setup Supabase Realtime channel if configured
    let unsubscribe = () => {};
    if (isSupabaseConfigured) {
      unsubscribe = subscribeToSupabase(() => {
        loadData();
      });
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser.id]);

  // Sync to localStorage
  const handleUpdateCurrentUser = (user: CurrentUser) => {
    setCurrentUserState(user);
    setCurrentUser(user);
  };

  const updatePosts = (newPosts: SecretPost[]) => {
    setPosts(newPosts);
    savePosts(newPosts);
  };

  const updateStories = (newStories: ClassStory[]) => {
    setStories(newStories);
    saveStories(newStories);
  };

  const updateLetters = (newLetters: TeacherSecretLetter[]) => {
    setTeacherLetters(newLetters);
    saveTeacherLetters(newLetters);
  };

  const updateNotifs = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    saveNotifications(newNotifs);
  };

  // 1. Post Creation
  const handleCreatePost = (data: {
    category: Exclude<PostCategory, '전체'>;
    content: string;
    theme: CardTheme;
    isSpoiler: boolean;
    authorAlias: string;
    authorEmoji: string;
    authorBg: string;
  }) => {
    const newPost: SecretPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorAlias: data.authorAlias,
      authorEmoji: data.authorEmoji,
      authorBg: data.authorBg,
      category: data.category,
      content: data.content,
      theme: data.theme,
      isSpoiler: data.isSpoiler,
      createdAt: '방금 전',
      likes: 1,
      likedBy: [currentUser.id],
      bookmarks: 0,
      bookmarkedBy: [],
      comments: [],
    };

    const next = [newPost, ...posts];
    updatePosts(next);

    // Call Cloud SQL / Server API & Supabase
    apiCreatePost(newPost);
    createPostInSupabase(newPost);

    // Add notification
    const newNotif = addNotification({
      userId: currentUser.id,
      type: 'system',
      title: '비밀글이 성공적으로 공유되었습니다',
      message: `"${data.content.slice(0, 30)}..." 글이 우리반 피드에 등록되었습니다.`,
      targetId: newPost.id,
    });
    setNotifications((prev) => [newNotif, ...prev]);
    apiCreateNotification(newNotif);
    createNotificationInSupabase(newNotif);
  };

  // 2. Toggle Like (with notification to post author)
  const handleToggleLike = (postId: string) => {
    // Call Cloud SQL API
    apiToggleLike(postId, currentUser.id);

    const post = posts.find((p) => p.id === postId);
    if (post) {
      toggleLikeInSupabase(postId, currentUser.id, post.likedBy, post.likes);
    }

    const updated = posts.map((post) => {
      if (post.id === postId) {
        const hasLiked = post.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked
          ? post.likedBy.filter((id) => id !== currentUser.id)
          : [...post.likedBy, currentUser.id];
        const newLikes = hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1;

        // If newly liked and not author's own post, trigger notification
        if (!hasLiked && post.authorId !== currentUser.id) {
          const newNotif = addNotification({
            userId: post.authorId,
            type: 'like',
            title: '내 비밀글에 새로운 공감이 달렸어요!',
            message: `익명의 친구가 회원님의 비밀글에 ❤️ 공감을 남겼습니다.`,
            targetId: post.id,
          });
          setNotifications((prev) => [newNotif, ...prev]);
          apiCreateNotification(newNotif);
          createNotificationInSupabase(newNotif);
        }

        return {
          ...post,
          likes: newLikes,
          likedBy: newLikedBy,
        };
      }
      return post;
    });

    updatePosts(updated);
  };

  // 3. Toggle Bookmark
  const handleToggleBookmark = (postId: string) => {
    apiToggleBookmark(postId, currentUser.id);

    const post = posts.find((p) => p.id === postId);
    if (post) {
      toggleBookmarkInSupabase(postId, currentUser.id, post.bookmarkedBy, post.bookmarks);
    }

    const updated = posts.map((post) => {
      if (post.id === postId) {
        const hasBookmarked = post.bookmarkedBy.includes(currentUser.id);
        const newBookmarkedBy = hasBookmarked
          ? post.bookmarkedBy.filter((id) => id !== currentUser.id)
          : [...post.bookmarkedBy, currentUser.id];
        const newCount = hasBookmarked
          ? Math.max(0, post.bookmarks - 1)
          : post.bookmarks + 1;

        return {
          ...post,
          bookmarks: newCount,
          bookmarkedBy: newBookmarkedBy,
        };
      }
      return post;
    });

    updatePosts(updated);
  };

  // 4. Add Comment (with notification to post author)
  const handleAddComment = (postId: string, commentContent: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorAlias: currentUser.name,
      authorEmoji: currentUser.avatarEmoji,
      authorBg: currentUser.avatarBg,
      isAuthor: post.authorId === currentUser.id,
      isTeacher: currentUser.role === 'teacher',
      content: commentContent,
      createdAt: '방금 전',
      likes: 0,
      likedBy: [],
    };

    apiAddComment(postId, newComment);
    addCommentInSupabase(newComment);

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      }
      return p;
    });

    updatePosts(updated);

    // Send notification to author if someone else commented
    if (post.authorId !== currentUser.id) {
      const newNotif = addNotification({
        userId: post.authorId,
        type: 'comment',
        title: currentUser.role === 'teacher' ? '담임선생님께서 댓글을 남기셨어요!' : '내 글에 새로운 익명 댓글이 달렸어요',
        message: `${currentUser.name}: "${commentContent.slice(0, 35)}..."`,
        targetId: postId,
      });
      setNotifications((prev) => [newNotif, ...prev]);
      apiCreateNotification(newNotif);
      createNotificationInSupabase(newNotif);
    }
  };

  // 5. Delete Post
  const handleDeletePost = (postId: string) => {
    apiDeletePost(postId);
    deletePostInSupabase(postId);
    const updated = posts.filter((p) => p.id !== postId);
    updatePosts(updated);
  };

  // 6. Add Story
  const handleAddStory = (content: string, theme: CardTheme) => {
    const newStory: ClassStory = {
      id: `story_${Date.now()}`,
      authorAlias: currentUser.name,
      authorEmoji: currentUser.avatarEmoji,
      authorBg: currentUser.avatarBg,
      content,
      createdAt: '방금 전',
      seen: false,
      theme,
    };
    apiCreateStory(newStory);
    createStoryInSupabase(newStory);
    updateStories([newStory, ...stories]);
  };

  // 7. Send Secret Letter to Teacher
  const handleSendLetter = (data: {
    topic: '학업/진로' | '친구/교우관계' | '마음/스트레스' | '학교생활건의' | '감사/기타';
    content: string;
    isUrgent: boolean;
  }) => {
    const newLetter: TeacherSecretLetter = {
      id: `letter_${Date.now()}`,
      studentToken: currentUser.token,
      studentAlias: currentUser.name,
      studentEmoji: currentUser.avatarEmoji,
      studentBg: currentUser.avatarBg,
      topic: data.topic,
      content: data.content,
      isUrgent: data.isUrgent,
      createdAt: '방금 전',
      status: 'unread',
    };

    apiCreateLetter(newLetter);
    createLetterInSupabase(newLetter);
    updateLetters([newLetter, ...teacherLetters]);

    // Send notification for teacher
    const newNotif = addNotification({
      userId: 'usr_teacher_01',
      type: 'new_letter',
      title: '새로운 학생 비밀 편지가 도착했습니다',
      message: `[${data.topic}] 익명의 학생이 담임선생님께 편지를 보냈습니다.`,
      targetId: newLetter.id,
    });
    setNotifications((prev) => [newNotif, ...prev]);
    apiCreateNotification(newNotif);
    createNotificationInSupabase(newNotif);
  };

  // 8. Teacher Replies to Letter
  const handleReplyLetter = (letterId: string, replyContent: string) => {
    apiReplyLetter(letterId, replyContent, currentUser.name);
    replyLetterInSupabase(letterId, replyContent, currentUser.name);

    const updated = teacherLetters.map((l) => {
      if (l.id === letterId) {
        return {
          ...l,
          status: 'replied' as const,
          teacherReply: {
            teacherName: currentUser.name,
            repliedAt: '방금 전',
            replyContent,
          },
        };
      }
      return l;
    });

    updateLetters(updated);

    // Notify the student
    const targetLetter = teacherLetters.find((l) => l.id === letterId);
    if (targetLetter) {
      const newNotif = addNotification({
        userId: targetLetter.studentToken,
        type: 'teacher_reply',
        title: '담임선생님의 따뜻한 답장이 도착했어요',
        message: `"${replyContent.slice(0, 40)}..."`,
        targetId: letterId,
      });
      setNotifications((prev) => [newNotif, ...prev]);
      apiCreateNotification(newNotif);
      createNotificationInSupabase(newNotif);
    }
  };

  // 9. Notifications Management
  const handleMarkAsRead = (id: string) => {
    apiMarkNotificationRead(id);
    markNotificationReadInSupabase(id);
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    updateNotifs(updated);
  };

  const handleMarkAllAsRead = () => {
    apiMarkAllNotificationsRead();
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    updateNotifs(updated);
  };

  const handleClearNotifications = () => {
    apiClearNotifications();
    updateNotifs([]);
  };

  const handleNavigateFromNotif = (targetId?: string, type?: string) => {
    if (type === 'teacher_reply' || type === 'new_letter') {
      setCurrentTab('mailbox');
    } else {
      setCurrentTab('feed');
    }
  };

  // Filtered & Sorted Feed Posts
  const filteredPosts = posts
    .filter((post) => {
      const matchCategory = selectedCategory === '전체' || post.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'comments') return b.comments.length - a.comments.length;
      return 0; // 'latest' keeps natural order
    });

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const unreadLettersCount = teacherLetters.filter((l) => l.status === 'unread').length;
  const bookmarkedTotal = posts.filter((p) => p.bookmarkedBy.includes(currentUser.id)).length;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col antialiased text-neutral-900 pb-20 md:pb-12">
      {/* 1. Header (Strict Top Bar Contract) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        unreadCount={unreadNotificationsCount}
        unreadLettersCount={unreadLettersCount}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        isSupabaseConfigured={isSupabaseConfigured}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-8">
        {/* VIEW A: FEED */}
        {currentTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left / Center Column: Stories & Posts Feed (7 cols) */}
            <div className="lg:col-span-8 max-w-2xl mx-auto w-full">
              {/* Instagram Stories Bar */}
              <StoriesBar
                stories={stories}
                currentUser={currentUser}
                onAddStory={handleAddStory}
              />

              {/* Feed Controls: Search, Category Filters, Sort Options */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xs mb-6 space-y-3">
                {/* Search Bar & Sort Dropdown */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="비밀글 내용, 키워드, 가명 검색..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 focus:outline-none transition-all placeholder:text-neutral-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                      >
                        지우기
                      </button>
                    )}
                  </div>

                  {/* Sort Segmented Button */}
                  <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl shrink-0">
                    <button
                      onClick={() => setSortBy('latest')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        sortBy === 'latest'
                          ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                      title="최신순"
                    >
                      최신순
                    </button>
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        sortBy === 'popular'
                          ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                      title="인기순"
                    >
                      공감순
                    </button>
                    <button
                      onClick={() => setSortBy('comments')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        sortBy === 'comments'
                          ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                      title="댓글순"
                    >
                      댓글순
                    </button>
                  </div>
                </div>

                {/* Categories Tab Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed List */}
              {filteredPosts.length === 0 ? (
                <div className="bg-white border border-neutral-200/80 rounded-3xl p-12 text-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800 mb-1">
                    {searchQuery
                      ? `'${searchQuery}'에 대한 비밀글이 없습니다`
                      : '등록된 비밀글이 없습니다'}
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5 leading-relaxed">
                    우리반 첫 번째 비밀의 주인공이 되어보세요. 100% 익명으로 안전하게 공유됩니다.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    지금 비밀 남기기
                  </button>
                </div>
              ) : (
                <div>
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onToggleLike={handleToggleLike}
                      onToggleBookmark={handleToggleBookmark}
                      onAddComment={handleAddComment}
                      onDeletePost={handleDeletePost}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar: Classroom Bulletin & Quick Stats (4 cols on lg) */}
            <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-22">
              {/* Profile Card & Role Notice */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${currentUser.avatarBg}`}
                    >
                      {currentUser.avatarEmoji}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>{currentUser.name}</span>
                        {currentUser.role === 'teacher' && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                            교사
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {currentUser.classCode} · 익명 상태
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 font-medium underline cursor-pointer"
                  >
                    프로필 변경
                  </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button
                    onClick={() => setCurrentTab('bookmarks')}
                    className="p-3 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200/60 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Bookmark className="w-4 h-4 text-amber-600 fill-amber-500/20" />
                      <span className="text-xs font-bold text-amber-900 tabular-nums">
                        {bookmarkedTotal}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-neutral-900">내 보관함</div>
                    <div className="text-[10px] text-neutral-500">저장한 비밀</div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('mailbox')}
                    className="p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/60 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Mail className="w-4 h-4 text-emerald-700" />
                      {currentUser.role === 'teacher' && unreadLettersCount > 0 && (
                        <span className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
                          {unreadLettersCount}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-neutral-900">비밀우체통</div>
                    <div className="text-[10px] text-neutral-500">담임선생님 직통</div>
                  </button>
                </div>
              </div>

              {/* Weekly Best Secrets Spotlight */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold text-neutral-900">
                    우리반 실시간 인기 비밀 TOP 3
                  </h3>
                </div>

                <div className="space-y-3 divide-y divide-neutral-100">
                  {posts
                    .slice()
                    .sort((a, b) => b.likes - a.likes)
                    .slice(0, 3)
                    .map((topPost, i) => (
                      <div
                        key={topPost.id}
                        onClick={() => {
                          setSelectedCategory('전체');
                          setSearchQuery('');
                          setSortBy('popular');
                        }}
                        className="pt-3 first:pt-0 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                          <span className="font-bold text-rose-600">#{i + 1}</span>
                          <span className="font-medium text-neutral-700">{topPost.category}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-rose-500 font-semibold tabular-nums">
                            <Heart className="w-3 h-3 fill-rose-500" /> {topPost.likes}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 font-medium line-clamp-2 leading-relaxed group-hover:text-neutral-900 transition-colors">
                          {topPost.content}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Supabase Integration Card */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <h3 className="text-xs font-bold">Supabase 클라우드 DB</h3>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                    {isSupabaseConfigured ? '실시간 동기화' : '설정 필요'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {isSupabaseConfigured
                    ? '현재 Supabase와 실시간(Realtime) 연결되어 모든 비밀 데이터가 클라우드에 영구 저장됩니다.'
                    : 'Supabase 프로젝트 URL과 API 키를 .env에 입력하면 즉시 실시간 동기화가 활성화됩니다.'}
                </p>
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>{isSupabaseConfigured ? 'Supabase 연동 정보 보기' : 'Supabase 설정 가이드 & SQL'}</span>
                </button>
              </div>

              {/* Classroom Guidelines & Reset */}
              <div className="p-4 rounded-2xl bg-neutral-100/80 border border-neutral-200 text-neutral-600 text-[11px] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>우리반 안심 클린 가이드</span>
                </div>
                <p className="leading-relaxed">
                  비밀글은 재미와 따뜻한 공감을 위해 마련된 공간입니다. 특정 학우를 비방하거나 상처 주는 언행은 자제해 주세요.
                </p>
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                  <span>데모 데이터가 필요할 땐</span>
                  <button
                    onClick={() => {
                      if (confirm('초기 데모 데이터로 복원하시겠습니까?')) {
                        resetToDefaultData();
                        window.location.reload();
                      }
                    }}
                    className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> 초기화
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* VIEW B: BOOKMARK VAULT */}
        {currentTab === 'bookmarks' && (
          <BookmarkVault
            posts={posts}
            currentUser={currentUser}
            onToggleLike={handleToggleLike}
            onToggleBookmark={handleToggleBookmark}
            onAddComment={handleAddComment}
            onBackToFeed={() => setCurrentTab('feed')}
          />
        )}

        {/* VIEW C: TEACHER SECRET MAILBOX */}
        {currentTab === 'mailbox' && (
          <TeacherMailbox
            letters={teacherLetters}
            currentUser={currentUser}
            onSendLetter={handleSendLetter}
            onReplyLetter={handleReplyLetter}
          />
        )}

        {/* VIEW D: NOTIFICATIONS CENTER */}
        {currentTab === 'notifications' && (
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearNotifications={handleClearNotifications}
            onNavigateToTarget={handleNavigateFromNotif}
          />
        )}
      </main>

      {/* 3. Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        unreadCount={unreadNotificationsCount}
        unreadLettersCount={unreadLettersCount}
        currentUser={currentUser}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* 4. Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSubmit={handleCreatePost}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleUpdateCurrentUser}
      />

      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
