import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  seedIfEmpty,
  getPostsWithComments,
  createPost,
  toggleLikePost,
  toggleBookmarkPost,
  addCommentToPost,
  deletePostById,
  getStoriesList,
  createStory,
  getTeacherLettersList,
  createTeacherLetter,
  replyToTeacherLetter,
  getNotificationsList,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from './src/db/queries.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Seed data on server start
seedIfEmpty().catch(console.error);

// 1. API: Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await getPostsWithComments();
    res.json(posts);
  } catch (error: any) {
    console.error('API Error /api/posts:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const newPost = await createPost(req.body);
    res.status(201).json(newPost);
  } catch (error: any) {
    console.error('API Error POST /api/posts:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const updated = await toggleLikePost(req.params.id, userId);
    res.json(updated);
  } catch (error: any) {
    console.error('API Error POST /api/posts/:id/like:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/posts/:id/bookmark', async (req, res) => {
  try {
    const { userId } = req.body;
    const updated = await toggleBookmarkPost(req.params.id, userId);
    res.json(updated);
  } catch (error: any) {
    console.error('API Error POST /api/posts/:id/bookmark:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const comment = await addCommentToPost({
      ...req.body,
      postId: req.params.id,
    });
    res.status(201).json(comment);
  } catch (error: any) {
    console.error('API Error POST /api/posts/:id/comments:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const result = await deletePostById(req.params.id);
    res.json(result);
  } catch (error: any) {
    console.error('API Error DELETE /api/posts/:id:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. API: Stories
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await getStoriesList();
    res.json(stories);
  } catch (error: any) {
    console.error('API Error /api/stories:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/stories', async (req, res) => {
  try {
    const newStory = await createStory(req.body);
    res.status(201).json(newStory);
  } catch (error: any) {
    console.error('API Error POST /api/stories:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 3. API: Teacher Letters
app.get('/api/letters', async (req, res) => {
  try {
    const letters = await getTeacherLettersList();
    res.json(letters);
  } catch (error: any) {
    console.error('API Error /api/letters:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/letters', async (req, res) => {
  try {
    const newLetter = await createTeacherLetter(req.body);
    res.status(201).json(newLetter);
  } catch (error: any) {
    console.error('API Error POST /api/letters:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/letters/:id/reply', async (req, res) => {
  try {
    const { replyContent, teacherName } = req.body;
    const updated = await replyToTeacherLetter(req.params.id, replyContent, teacherName);
    res.json(updated);
  } catch (error: any) {
    console.error('API Error POST /api/letters/:id/reply:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 4. API: Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || '';
    const notifs = await getNotificationsList(userId);
    res.json(notifs);
  } catch (error: any) {
    console.error('API Error /api/notifications:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const newNotif = await createNotification(req.body);
    res.status(201).json(newNotif);
  } catch (error: any) {
    console.error('API Error POST /api/notifications:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/notifications/:id/read', async (req, res) => {
  try {
    const result = await markNotificationAsRead(req.params.id);
    res.json(result);
  } catch (error: any) {
    console.error('API Error POST /api/notifications/:id/read:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/notifications/read-all', async (req, res) => {
  try {
    const result = await markAllNotificationsAsRead();
    res.json(result);
  } catch (error: any) {
    console.error('API Error POST /api/notifications/read-all:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    const result = await clearAllNotifications();
    res.json(result);
  } catch (error: any) {
    console.error('API Error DELETE /api/notifications:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 5. Mount Vite in Dev or Serve Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Classroom Secret Server running on port ${PORT}`);
  });
}

startServer();
