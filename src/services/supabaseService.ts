import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SecretPost,
  ClassStory,
  TeacherSecretLetter,
  AppNotification,
  PostComment,
} from '../types';

// 1. Fetch Posts with Comments from Supabase
export async function fetchPostsFromSupabase(): Promise<SecretPost[] | null> {
  if (!supabase) return null;
  try {
    const { data: postsData, error: postsErr } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsErr) throw postsErr;
    if (!postsData) return [];

    const { data: commentsData, error: commentsErr } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (commentsErr) throw commentsErr;

    const allComments = (commentsData || []) as any[];

    return postsData.map((p: any) => ({
      id: p.id,
      authorId: p.author_id,
      authorAlias: p.author_alias,
      authorEmoji: p.author_emoji,
      authorBg: p.author_bg,
      category: p.category,
      content: p.content,
      theme: p.theme,
      isSpoiler: p.is_spoiler,
      createdAt: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
      likes: p.likes ?? 0,
      likedBy: p.liked_by || [],
      bookmarks: p.bookmarks ?? 0,
      bookmarkedBy: p.bookmarked_by || [],
      comments: allComments
        .filter((c) => c.post_id === p.id)
        .map((c) => ({
          id: c.id,
          postId: c.post_id,
          authorId: c.author_id,
          authorAlias: c.author_alias,
          authorEmoji: c.author_emoji,
          authorBg: c.author_bg,
          isAuthor: c.is_author,
          isTeacher: c.is_teacher,
          content: c.content,
          createdAt: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
          likes: c.likes ?? 0,
          likedBy: c.liked_by || [],
        })),
    }));
  } catch (error) {
    console.error('Supabase fetchPosts failed:', error);
    return null;
  }
}

// 2. Create Post in Supabase
export async function createPostInSupabase(post: SecretPost): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('posts').insert({
      id: post.id,
      author_id: post.authorId,
      author_alias: post.authorAlias,
      author_emoji: post.authorEmoji,
      author_bg: post.authorBg,
      category: post.category,
      content: post.content,
      theme: post.theme,
      is_spoiler: post.isSpoiler,
      likes: post.likes,
      liked_by: post.likedBy,
      bookmarks: post.bookmarks,
      bookmarked_by: post.bookmarkedBy,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase createPost failed:', error);
    return false;
  }
}

// 3. Toggle Like in Supabase
export async function toggleLikeInSupabase(postId: string, userId: string, currentLikedBy: string[], currentLikes: number) {
  if (!supabase) return false;
  try {
    const hasLiked = currentLikedBy.includes(userId);
    const updatedLikedBy = hasLiked
      ? currentLikedBy.filter((id) => id !== userId)
      : [...currentLikedBy, userId];
    const updatedLikes = hasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    const { error } = await supabase
      .from('posts')
      .update({
        likes: updatedLikes,
        liked_by: updatedLikedBy,
      })
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase toggleLike failed:', error);
    return false;
  }
}

// 4. Toggle Bookmark in Supabase
export async function toggleBookmarkInSupabase(postId: string, userId: string, currentBookmarkedBy: string[], currentBookmarks: number) {
  if (!supabase) return false;
  try {
    const hasBookmarked = currentBookmarkedBy.includes(userId);
    const updatedBookmarkedBy = hasBookmarked
      ? currentBookmarkedBy.filter((id) => id !== userId)
      : [...currentBookmarkedBy, userId];
    const updatedBookmarks = hasBookmarked ? Math.max(0, currentBookmarks - 1) : currentBookmarks + 1;

    const { error } = await supabase
      .from('posts')
      .update({
        bookmarks: updatedBookmarks,
        bookmarked_by: updatedBookmarkedBy,
      })
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase toggleBookmark failed:', error);
    return false;
  }
}

// 5. Add Comment in Supabase
export async function addCommentInSupabase(comment: PostComment) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('comments').insert({
      id: comment.id,
      post_id: comment.postId,
      author_id: comment.authorId,
      author_alias: comment.authorAlias,
      author_emoji: comment.authorEmoji,
      author_bg: comment.authorBg,
      is_author: comment.isAuthor,
      is_teacher: comment.isTeacher,
      content: comment.content,
      likes: comment.likes,
      liked_by: comment.likedBy,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase addComment failed:', error);
    return false;
  }
}

// 6. Delete Post in Supabase
export async function deletePostInSupabase(postId: string) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase deletePost failed:', error);
    return false;
  }
}

// 7. Stories
export async function fetchStoriesFromSupabase(): Promise<ClassStory[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((s: any) => ({
      id: s.id,
      authorAlias: s.author_alias,
      authorEmoji: s.author_emoji,
      authorBg: s.author_bg,
      content: s.content,
      theme: s.theme,
      createdAt: s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
      seen: false,
    }));
  } catch (error) {
    console.error('Supabase fetchStories failed:', error);
    return null;
  }
}

export async function createStoryInSupabase(story: ClassStory) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('stories').insert({
      id: story.id,
      author_alias: story.authorAlias,
      author_emoji: story.authorEmoji,
      author_bg: story.authorBg,
      content: story.content,
      theme: story.theme,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase createStory failed:', error);
    return false;
  }
}

// 8. Teacher Letters
export async function fetchLettersFromSupabase(): Promise<TeacherSecretLetter[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('teacher_letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((l: any) => ({
      id: l.id,
      studentToken: l.student_token,
      studentAlias: l.student_alias,
      studentEmoji: l.student_emoji,
      studentBg: l.student_bg,
      topic: l.topic,
      content: l.content,
      isUrgent: l.is_urgent,
      status: l.status,
      createdAt: l.created_at ? new Date(l.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '방금 전',
      teacherReply: l.teacher_reply_content ? {
        teacherName: l.teacher_reply_name || '담임선생님',
        replyContent: l.teacher_reply_content,
        repliedAt: l.teacher_replied_at ? new Date(l.teacher_replied_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '방금 전',
      } : undefined,
    }));
  } catch (error) {
    console.error('Supabase fetchLetters failed:', error);
    return null;
  }
}

export async function createLetterInSupabase(letter: TeacherSecretLetter) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('teacher_letters').insert({
      id: letter.id,
      student_token: letter.studentToken,
      student_alias: letter.studentAlias,
      student_emoji: letter.studentEmoji,
      student_bg: letter.studentBg,
      topic: letter.topic,
      content: letter.content,
      is_urgent: letter.isUrgent,
      status: 'unread',
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase createLetter failed:', error);
    return false;
  }
}

export async function replyLetterInSupabase(letterId: string, replyContent: string, teacherName: string) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('teacher_letters')
      .update({
        status: 'replied',
        teacher_reply_name: teacherName,
        teacher_reply_content: replyContent,
        teacher_replied_at: new Date().toISOString(),
      })
      .eq('id', letterId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase replyLetter failed:', error);
    return false;
  }
}

// 9. Notifications
export async function fetchNotificationsFromSupabase(userId: string): Promise<AppNotification[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      targetId: n.target_id || undefined,
      isRead: n.is_read,
      createdAt: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
    }));
  } catch (error) {
    console.error('Supabase fetchNotifications failed:', error);
    return null;
  }
}

export async function createNotificationInSupabase(notif: AppNotification) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('notifications').insert({
      id: notif.id,
      user_id: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      target_id: notif.targetId,
      is_read: false,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase createNotification failed:', error);
    return false;
  }
}

export async function markNotificationReadInSupabase(notifId: string) {
  if (!supabase) return false;
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    return true;
  } catch (error) {
    console.error('Supabase markNotificationRead failed:', error);
    return false;
  }
}

// 10. Realtime Subscription
export function subscribeToSupabase(callback: () => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('classroom_secret_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'teacher_letters' }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => callback())
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}
