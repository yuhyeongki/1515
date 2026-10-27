-- ==============================================================================
-- 우리반 시크릿 (Class Secret) - Supabase 테이블 생성 및 실시간(Realtime) 설정 스크립트
-- 복사해서 Supabase Dashboard > SQL Editor 에 붙여넣고 [RUN]을 누르시면 됩니다!
-- ==============================================================================

-- 1. 비밀 게시글 테이블 (posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_alias TEXT NOT NULL,
  author_emoji TEXT NOT NULL,
  author_bg TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'sunset',
  is_spoiler BOOLEAN NOT NULL DEFAULT false,
  likes INTEGER NOT NULL DEFAULT 0,
  liked_by TEXT[] NOT NULL DEFAULT '{}',
  bookmarks INTEGER NOT NULL DEFAULT 0,
  bookmarked_by TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 익명 댓글 테이블 (comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_alias TEXT NOT NULL,
  author_emoji TEXT NOT NULL,
  author_bg TEXT NOT NULL,
  is_author BOOLEAN NOT NULL DEFAULT false,
  is_teacher BOOLEAN NOT NULL DEFAULT false,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  liked_by TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 선생님 비밀 편지 테이블 (teacher_letters)
CREATE TABLE IF NOT EXISTS public.teacher_letters (
  id TEXT PRIMARY KEY,
  student_token TEXT NOT NULL,
  student_alias TEXT NOT NULL,
  student_emoji TEXT NOT NULL,
  student_bg TEXT NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'unread',
  teacher_reply_name TEXT,
  teacher_reply_content TEXT,
  teacher_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 24시간 우리반 한마디 스토리 테이블 (stories)
CREATE TABLE IF NOT EXISTS public.stories (
  id TEXT PRIMARY KEY,
  author_alias TEXT NOT NULL,
  author_emoji TEXT NOT NULL,
  author_bg TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'sunset',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. 알림 테이블 (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- Row Level Security (RLS) 활성화 및 공용 읽기/쓰기 정책 (우리반 익명 커뮤니티용)
-- ==============================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to teacher_letters" ON public.teacher_letters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to stories" ON public.stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Supabase Realtime(실시간) 복제 켜기
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_letters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
