export type UserRole = 'student' | 'teacher';

export type PostCategory = '전체' | '짝사랑' | '고민' | '급식' | '선생님' | '시험/공부' | '웃긴일' | '속마음';

export type CardTheme = 'minimal' | 'sunset' | 'chalkboard' | 'lavender' | 'mint' | 'notebook' | 'warm';

export interface CurrentUser {
  id: string;
  role: UserRole;
  name: string;
  avatarEmoji: string;
  avatarBg: string;
  classCode: string;
  token: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorAlias: string;
  authorEmoji: string;
  authorBg: string;
  isAuthor: boolean;
  isTeacher: boolean;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface SecretPost {
  id: string;
  authorId: string;
  authorAlias: string;
  authorEmoji: string;
  authorBg: string;
  category: Exclude<PostCategory, '전체'>;
  content: string;
  theme: CardTheme;
  isSpoiler: boolean;
  createdAt: string;
  likes: number;
  likedBy: string[];
  bookmarks: number;
  bookmarkedBy: string[];
  comments: PostComment[];
}

export interface TeacherSecretLetter {
  id: string;
  studentToken: string;
  studentAlias: string;
  studentEmoji: string;
  studentBg: string;
  topic: '학업/진로' | '친구/교우관계' | '마음/스트레스' | '학교생활건의' | '감사/기타';
  content: string;
  isUrgent: boolean;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
  teacherReply?: {
    replyContent: string;
    repliedAt: string;
    teacherName: string;
  };
}

export interface ClassStory {
  id: string;
  authorAlias: string;
  authorEmoji: string;
  authorBg: string;
  content: string;
  createdAt: string;
  seen: boolean;
  theme: CardTheme;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'teacher_reply' | 'new_letter' | 'system';
  title: string;
  message: string;
  targetId?: string;
  createdAt: string;
  isRead: boolean;
}
