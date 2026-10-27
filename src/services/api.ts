import {
  SecretPost,
  ClassStory,
  TeacherSecretLetter,
  AppNotification,
} from '../types';

export async function apiFetchPosts(): Promise<SecretPost[] | null> {
  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    console.warn('API /api/posts failed, using local cache:', e);
    return null;
  }
}

export async function apiCreatePost(post: any) {
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    return await res.json();
  } catch (e) {
    console.warn('API POST /api/posts failed:', e);
    return null;
  }
}

export async function apiToggleLike(postId: string, userId: string) {
  try {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  } catch (e) {
    console.warn('API like failed:', e);
    return null;
  }
}

export async function apiToggleBookmark(postId: string, userId: string) {
  try {
    const res = await fetch(`/api/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  } catch (e) {
    console.warn('API bookmark failed:', e);
    return null;
  }
}

export async function apiAddComment(postId: string, commentData: any) {
  try {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    return await res.json();
  } catch (e) {
    console.warn('API add comment failed:', e);
    return null;
  }
}

export async function apiDeletePost(postId: string) {
  try {
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    return await res.json();
  } catch (e) {
    console.warn('API delete post failed:', e);
    return null;
  }
}

export async function apiFetchStories(): Promise<ClassStory[] | null> {
  try {
    const res = await fetch('/api/stories');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    console.warn('API /api/stories failed:', e);
    return null;
  }
}

export async function apiCreateStory(story: any) {
  try {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story),
    });
    return await res.json();
  } catch (e) {
    console.warn('API create story failed:', e);
    return null;
  }
}

export async function apiFetchLetters(): Promise<TeacherSecretLetter[] | null> {
  try {
    const res = await fetch('/api/letters');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    console.warn('API /api/letters failed:', e);
    return null;
  }
}

export async function apiCreateLetter(letter: any) {
  try {
    const res = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letter),
    });
    return await res.json();
  } catch (e) {
    console.warn('API create letter failed:', e);
    return null;
  }
}

export async function apiReplyLetter(letterId: string, replyContent: string, teacherName: string) {
  try {
    const res = await fetch(`/api/letters/${letterId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyContent, teacherName }),
    });
    return await res.json();
  } catch (e) {
    console.warn('API reply letter failed:', e);
    return null;
  }
}

export async function apiFetchNotifications(userId: string): Promise<AppNotification[] | null> {
  try {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    console.warn('API /api/notifications failed:', e);
    return null;
  }
}

export async function apiCreateNotification(notif: any) {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif),
    });
    return await res.json();
  } catch (e) {
    console.warn('API create notification failed:', e);
    return null;
  }
}

export async function apiMarkNotificationRead(id: string) {
  try {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  } catch (e) {
    console.warn('API mark read failed:', e);
  }
}

export async function apiMarkAllNotificationsRead() {
  try {
    await fetch('/api/notifications/read-all', { method: 'POST' });
  } catch (e) {
    console.warn('API mark all read failed:', e);
  }
}

export async function apiClearNotifications() {
  try {
    await fetch('/api/notifications', { method: 'DELETE' });
  } catch (e) {
    console.warn('API clear notifs failed:', e);
  }
}
