import {
  CurrentUser,
  SecretPost,
  TeacherSecretLetter,
  ClassStory,
  AppNotification,
  PostCategory,
  CardTheme,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_TEACHER,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_TEACHER_LETTERS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

const KEYS = {
  USER: 'class_secret_current_user',
  POSTS: 'class_secret_posts',
  STORIES: 'class_secret_stories',
  LETTERS: 'class_secret_letters',
  NOTIFICATIONS: 'class_secret_notifications',
};

// Animal avatars and color palettes for anonymous student generation
export const ANONYMOUS_MASCOTS = [
  { emoji: '🐹', name: '쿼카', bg: 'bg-amber-100 text-amber-800' },
  { emoji: '🐻', name: '곰돌이', bg: 'bg-orange-100 text-orange-800' },
  { emoji: '🐰', name: '토끼', bg: 'bg-rose-100 text-rose-800' },
  { emoji: '🦊', name: '여우', bg: 'bg-red-100 text-red-800' },
  { emoji: '🐼', name: '판다', bg: 'bg-neutral-200 text-neutral-800' },
  { emoji: '🐥', name: '병아리', bg: 'bg-yellow-100 text-yellow-800' },
  { emoji: '🐨', name: '코알라', bg: 'bg-emerald-100 text-emerald-800' },
  { emoji: '🐱', name: '고양이', bg: 'bg-purple-100 text-purple-800' },
  { emoji: '🐶', name: '강아지', bg: 'bg-sky-100 text-sky-800' },
  { emoji: '🦔', name: '고슴도치', bg: 'bg-stone-200 text-stone-800' },
  { emoji: '🦦', name: '수달', bg: 'bg-teal-100 text-teal-800' },
  { emoji: '🦉', name: '부엉이', bg: 'bg-indigo-100 text-indigo-800' },
];

export const ADJECTIVES = [
  '익명의', '수줍은', '새벽의', '당당한', '뒷자리', '비밀의',
  '감성적인', '샤프심', '졸린눈', '체육관', '창가자리', '매점단골',
];

export function getRandomAnonymousPersona() {
  const mascot = ANONYMOUS_MASCOTS[Math.floor(Math.random() * ANONYMOUS_MASCOTS.length)];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  return {
    name: `${adj} ${mascot.name}`,
    emoji: mascot.emoji,
    bg: mascot.bg,
  };
}

export function getCurrentUser(): CurrentUser {
  try {
    const saved = localStorage.getItem(KEYS.USER);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_USER;
}

export function setCurrentUser(user: CurrentUser): void {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
}

export function getPosts(): SecretPost[] {
  try {
    const saved = localStorage.getItem(KEYS.POSTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_POSTS;
}

export function savePosts(posts: SecretPost[]): void {
  try {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  } catch (e) {
    console.error(e);
  }
}

export function getStories(): ClassStory[] {
  try {
    const saved = localStorage.getItem(KEYS.STORIES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_STORIES;
}

export function saveStories(stories: ClassStory[]): void {
  try {
    localStorage.setItem(KEYS.STORIES, JSON.stringify(stories));
  } catch (e) {
    console.error(e);
  }
}

export function getTeacherLetters(): TeacherSecretLetter[] {
  try {
    const saved = localStorage.getItem(KEYS.LETTERS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_TEACHER_LETTERS;
}

export function saveTeacherLetters(letters: TeacherSecretLetter[]): void {
  try {
    localStorage.setItem(KEYS.LETTERS, JSON.stringify(letters));
  } catch (e) {
    console.error(e);
  }
}

export function getNotifications(): AppNotification[] {
  try {
    const saved = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error(e);
  }
}

export function addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): AppNotification {
  const current = getNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif_${Date.now()}`,
    createdAt: '방금 전',
    isRead: false,
  };
  saveNotifications([newNotif, ...current]);
  return newNotif;
}

export function resetToDefaultData(): void {
  try {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.POSTS);
    localStorage.removeItem(KEYS.STORIES);
    localStorage.removeItem(KEYS.LETTERS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
  } catch (e) {
    console.error(e);
  }
}
