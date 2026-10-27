import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  posts,
  comments,
  stories,
  teacherLetters,
  notifications,
  users,
} from './schema.ts';
import {
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_TEACHER_LETTERS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData.ts';

// 1. Seed Initial Data if database is brand new
export async function seedIfEmpty() {
  try {
    const existingPosts = await db.select().from(posts).limit(1);
    if (existingPosts.length === 0) {
      console.log('Seeding initial classroom secrets to Cloud SQL...');
      for (const p of INITIAL_POSTS) {
        await db.insert(posts).values({
          id: p.id,
          authorId: p.authorId,
          authorAlias: p.authorAlias,
          authorEmoji: p.authorEmoji,
          authorBg: p.authorBg,
          category: p.category,
          content: p.content,
          theme: p.theme,
          isSpoiler: p.isSpoiler,
          likes: p.likes,
          likedBy: p.likedBy,
          bookmarks: p.bookmarks,
          bookmarkedBy: p.bookmarkedBy,
        });

        for (const c of p.comments) {
          await db.insert(comments).values({
            id: c.id,
            postId: p.id,
            authorId: c.authorId,
            authorAlias: c.authorAlias,
            authorEmoji: c.authorEmoji,
            authorBg: c.authorBg,
            isAuthor: c.isAuthor,
            isTeacher: c.isTeacher,
            content: c.content,
            likes: c.likes,
            likedBy: c.likedBy,
          });
        }
      }

      for (const s of INITIAL_STORIES) {
        await db.insert(stories).values({
          id: s.id,
          authorAlias: s.authorAlias,
          authorEmoji: s.authorEmoji,
          authorBg: s.authorBg,
          content: s.content,
          theme: s.theme,
        });
      }

      for (const l of INITIAL_TEACHER_LETTERS) {
        await db.insert(teacherLetters).values({
          id: l.id,
          studentToken: l.studentToken,
          studentAlias: l.studentAlias,
          studentEmoji: l.studentEmoji,
          studentBg: l.studentBg,
          topic: l.topic,
          content: l.content,
          isUrgent: l.isUrgent,
          status: l.status,
          teacherReplyName: l.teacherReply?.teacherName,
          teacherReplyContent: l.teacherReply?.replyContent,
          teacherRepliedAt: l.teacherReply ? new Date() : null,
        });
      }

      for (const n of INITIAL_NOTIFICATIONS) {
        await db.insert(notifications).values({
          id: n.id,
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          targetId: n.targetId,
          isRead: n.isRead,
        });
      }
      console.log('Seeding completed successfully.');
    }
  } catch (error) {
    console.error('Error seeding data to Cloud SQL:', error);
  }
}

// 2. Posts & Comments Queries
export async function getPostsWithComments() {
  try {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
    const allComments = await db.select().from(comments).orderBy(comments.createdAt);

    return allPosts.map((p) => ({
      id: p.id,
      authorId: p.authorId,
      authorAlias: p.authorAlias,
      authorEmoji: p.authorEmoji,
      authorBg: p.authorBg,
      category: p.category as any,
      content: p.content,
      theme: p.theme as any,
      isSpoiler: p.isSpoiler,
      createdAt: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
      likes: p.likes,
      likedBy: p.likedBy || [],
      bookmarks: p.bookmarks,
      bookmarkedBy: p.bookmarkedBy || [],
      comments: allComments
        .filter((c) => c.postId === p.id)
        .map((c) => ({
          id: c.id,
          postId: c.postId,
          authorId: c.authorId,
          authorAlias: c.authorAlias,
          authorEmoji: c.authorEmoji,
          authorBg: c.authorBg,
          isAuthor: c.isAuthor,
          isTeacher: c.isTeacher,
          content: c.content,
          createdAt: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
          likes: c.likes,
          likedBy: c.likedBy || [],
        })),
    }));
  } catch (error) {
    console.error('Database query failed (getPostsWithComments):', error);
    throw new Error('Failed to fetch posts from database', { cause: error });
  }
}

export async function createPost(postData: {
  id: string;
  authorId: string;
  authorAlias: string;
  authorEmoji: string;
  authorBg: string;
  category: string;
  content: string;
  theme: string;
  isSpoiler: boolean;
}) {
  try {
    const inserted = await db.insert(posts).values({
      id: postData.id,
      authorId: postData.authorId,
      authorAlias: postData.authorAlias,
      authorEmoji: postData.authorEmoji,
      authorBg: postData.authorBg,
      category: postData.category,
      content: postData.content,
      theme: postData.theme,
      isSpoiler: postData.isSpoiler,
      likes: 1,
      likedBy: [postData.authorId],
      bookmarks: 0,
      bookmarkedBy: [],
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed (createPost):', error);
    throw new Error('Failed to create post in database', { cause: error });
  }
}

export async function toggleLikePost(postId: string, userId: string) {
  try {
    const [existing] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!existing) throw new Error('Post not found');

    const hasLiked = (existing.likedBy || []).includes(userId);
    const updatedLikedBy = hasLiked
      ? existing.likedBy.filter((id) => id !== userId)
      : [...(existing.likedBy || []), userId];
    const updatedLikes = hasLiked ? Math.max(0, existing.likes - 1) : existing.likes + 1;

    const [updated] = await db
      .update(posts)
      .set({
        likes: updatedLikes,
        likedBy: updatedLikedBy,
      })
      .where(eq(posts.id, postId))
      .returning();

    return updated;
  } catch (error) {
    console.error('Database query failed (toggleLikePost):', error);
    throw new Error('Failed to update post like', { cause: error });
  }
}

export async function toggleBookmarkPost(postId: string, userId: string) {
  try {
    const [existing] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!existing) throw new Error('Post not found');

    const hasBookmarked = (existing.bookmarkedBy || []).includes(userId);
    const updatedBookmarkedBy = hasBookmarked
      ? existing.bookmarkedBy.filter((id) => id !== userId)
      : [...(existing.bookmarkedBy || []), userId];
    const updatedBookmarks = hasBookmarked
      ? Math.max(0, existing.bookmarks - 1)
      : existing.bookmarks + 1;

    const [updated] = await db
      .update(posts)
      .set({
        bookmarks: updatedBookmarks,
        bookmarkedBy: updatedBookmarkedBy,
      })
      .where(eq(posts.id, postId))
      .returning();

    return updated;
  } catch (error) {
    console.error('Database query failed (toggleBookmarkPost):', error);
    throw new Error('Failed to update bookmark', { cause: error });
  }
}

export async function addCommentToPost(commentData: {
  id: string;
  postId: string;
  authorId: string;
  authorAlias: string;
  authorEmoji: string;
  authorBg: string;
  isAuthor: boolean;
  isTeacher: boolean;
  content: string;
}) {
  try {
    const [inserted] = await db.insert(comments).values({
      id: commentData.id,
      postId: commentData.postId,
      authorId: commentData.authorId,
      authorAlias: commentData.authorAlias,
      authorEmoji: commentData.authorEmoji,
      authorBg: commentData.authorBg,
      isAuthor: commentData.isAuthor,
      isTeacher: commentData.isTeacher,
      content: commentData.content,
      likes: 0,
      likedBy: [],
    }).returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed (addCommentToPost):', error);
    throw new Error('Failed to add comment', { cause: error });
  }
}

export async function deletePostById(postId: string) {
  try {
    await db.delete(posts).where(eq(posts.id, postId));
    return { success: true };
  } catch (error) {
    console.error('Database query failed (deletePostById):', error);
    throw new Error('Failed to delete post', { cause: error });
  }
}

// 3. Stories Queries
export async function getStoriesList() {
  try {
    const storyList = await db.select().from(stories).orderBy(desc(stories.createdAt));
    return storyList.map((s) => ({
      id: s.id,
      authorAlias: s.authorAlias,
      authorEmoji: s.authorEmoji,
      authorBg: s.authorBg,
      content: s.content,
      theme: s.theme as any,
      createdAt: s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
      seen: false,
    }));
  } catch (error) {
    console.error('Database query failed (getStoriesList):', error);
    throw new Error('Failed to fetch stories', { cause: error });
  }
}

export async function createStory(storyData: {
  id: string;
  authorAlias: string;
  authorEmoji: string;
  authorBg: string;
  content: string;
  theme: string;
}) {
  try {
    const [inserted] = await db.insert(stories).values(storyData).returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed (createStory):', error);
    throw new Error('Failed to create story', { cause: error });
  }
}

// 4. Teacher Secret Letters
export async function getTeacherLettersList() {
  try {
    const letters = await db.select().from(teacherLetters).orderBy(desc(teacherLetters.createdAt));
    return letters.map((l) => ({
      id: l.id,
      studentToken: l.studentToken,
      studentAlias: l.studentAlias,
      studentEmoji: l.studentEmoji,
      studentBg: l.studentBg,
      topic: l.topic as any,
      content: l.content,
      isUrgent: l.isUrgent,
      status: l.status as any,
      createdAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '방금 전',
      teacherReply: l.teacherReplyContent ? {
        teacherName: l.teacherReplyName || '담임선생님',
        replyContent: l.teacherReplyContent,
        repliedAt: l.teacherRepliedAt ? new Date(l.teacherRepliedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '방금 전',
      } : undefined,
    }));
  } catch (error) {
    console.error('Database query failed (getTeacherLettersList):', error);
    throw new Error('Failed to fetch teacher letters', { cause: error });
  }
}

export async function createTeacherLetter(letterData: {
  id: string;
  studentToken: string;
  studentAlias: string;
  studentEmoji: string;
  studentBg: string;
  topic: string;
  content: string;
  isUrgent: boolean;
}) {
  try {
    const [inserted] = await db.insert(teacherLetters).values({
      ...letterData,
      status: 'unread',
    }).returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed (createTeacherLetter):', error);
    throw new Error('Failed to create teacher letter', { cause: error });
  }
}

export async function replyToTeacherLetter(letterId: string, replyContent: string, teacherName: string) {
  try {
    const [updated] = await db
      .update(teacherLetters)
      .set({
        status: 'replied',
        teacherReplyName: teacherName,
        teacherReplyContent: replyContent,
        teacherRepliedAt: new Date(),
      })
      .where(eq(teacherLetters.id, letterId))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database query failed (replyToTeacherLetter):', error);
    throw new Error('Failed to reply to teacher letter', { cause: error });
  }
}

// 5. Notifications
export async function getNotificationsList(userId: string) {
  try {
    const notifs = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
    return notifs.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type as any,
      title: n.title,
      message: n.message,
      targetId: n.targetId || undefined,
      createdAt: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
      isRead: n.isRead,
    }));
  } catch (error) {
    console.error('Database query failed (getNotificationsList):', error);
    throw new Error('Failed to fetch notifications', { cause: error });
  }
}

export async function createNotification(notifData: {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  targetId?: string;
}) {
  try {
    const [inserted] = await db.insert(notifications).values({
      ...notifData,
      isRead: false,
    }).returning();
    return inserted;
  } catch (error) {
    console.error('Database query failed (createNotification):', error);
    throw new Error('Failed to create notification', { cause: error });
  }
}

export async function markNotificationAsRead(notifId: string) {
  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notifId));
    return { success: true };
  } catch (error) {
    console.error('Database query failed (markNotificationAsRead):', error);
    throw new Error('Failed to mark notification as read', { cause: error });
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await db.update(notifications).set({ isRead: true });
    return { success: true };
  } catch (error) {
    console.error('Database query failed (markAllNotificationsAsRead):', error);
    throw new Error('Failed to mark all notifications as read', { cause: error });
  }
}

export async function clearAllNotifications() {
  try {
    await db.delete(notifications);
    return { success: true };
  } catch (error) {
    console.error('Database query failed (clearAllNotifications):', error);
    throw new Error('Failed to clear notifications', { cause: error });
  }
}
