import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or anonymous token
  email: text('email'),
  name: text('name').notNull(),
  role: text('role').notNull().default('student'),
  avatarEmoji: text('avatar_emoji').notNull().default('🐹'),
  avatarBg: text('avatar_bg').notNull().default('bg-amber-100 text-amber-800'),
  classCode: text('class_code').notNull().default('3학년 2반'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Secret Posts Table
export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull(),
  authorAlias: text('author_alias').notNull(),
  authorEmoji: text('author_emoji').notNull(),
  authorBg: text('author_bg').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  theme: text('theme').notNull().default('sunset'),
  isSpoiler: boolean('is_spoiler').notNull().default(false),
  likes: integer('likes').notNull().default(0),
  likedBy: text('liked_by').array().notNull().default([]),
  bookmarks: integer('bookmarks').notNull().default(0),
  bookmarkedBy: text('bookmarked_by').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Comments Table
export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(),
  authorAlias: text('author_alias').notNull(),
  authorEmoji: text('author_emoji').notNull(),
  authorBg: text('author_bg').notNull(),
  isAuthor: boolean('is_author').notNull().default(false),
  isTeacher: boolean('is_teacher').notNull().default(false),
  content: text('content').notNull(),
  likes: integer('likes').notNull().default(0),
  likedBy: text('liked_by').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Teacher Secret Letters Table
export const teacherLetters = pgTable('teacher_letters', {
  id: text('id').primaryKey(),
  studentToken: text('student_token').notNull(),
  studentAlias: text('student_alias').notNull(),
  studentEmoji: text('student_emoji').notNull(),
  studentBg: text('student_bg').notNull(),
  topic: text('topic').notNull(),
  content: text('content').notNull(),
  isUrgent: boolean('is_urgent').notNull().default(false),
  status: text('status').notNull().default('unread'),
  teacherReplyName: text('teacher_reply_name'),
  teacherReplyContent: text('teacher_reply_content'),
  teacherRepliedAt: timestamp('teacher_replied_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Class Stories Table
export const stories = pgTable('stories', {
  id: text('id').primaryKey(),
  authorAlias: text('author_alias').notNull(),
  authorEmoji: text('author_emoji').notNull(),
  authorBg: text('author_bg').notNull(),
  content: text('content').notNull(),
  theme: text('theme').notNull().default('sunset'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Notifications Table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  targetId: text('target_id'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
