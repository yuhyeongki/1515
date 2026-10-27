import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, X, AlertTriangle, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const envSample = `VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"`;

  const sqlSample = `-- 1. 테이블 생성
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

CREATE TABLE IF NOT EXISTS public.stories (
  id TEXT PRIMARY KEY,
  author_alias TEXT NOT NULL,
  author_emoji TEXT NOT NULL,
  author_bg TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'sunset',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_letters" ON public.teacher_letters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_stories" ON public.stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_notifs" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_letters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;`;

  const handleCopySql = () => {
    navigator.clipboard?.writeText(sqlSample);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyEnv = () => {
    navigator.clipboard?.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">
                Supabase 데이터베이스 연동 안내
              </h3>
              <p className="text-[11px] text-neutral-500">
                {isSupabaseConfigured
                  ? '🟢 Supabase 연결이 활성화되었습니다.'
                  : '3단계로 Supabase에 API 키를 연결하고 실시간 DB를 사용하세요'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isSupabaseConfigured
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            {isSupabaseConfigured ? (
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <div className="font-bold">
                {isSupabaseConfigured
                  ? 'Supabase 클라이언트가 정상 연결되었습니다!'
                  : 'Supabase API 키 설정이 대기 중입니다'}
              </div>
              <p className="mt-0.5 text-neutral-600">
                {isSupabaseConfigured
                  ? '게시글, 댓글, 비밀 편지, 알림이 Supabase 데이터베이스와 실시간으로 동기화됩니다.'
                  : '아래 3단계를 따라 Supabase 프로젝트에 테이블을 생성하고 API 키를 설정해주세요.'}
              </p>
            </div>
          </div>

          {/* Step 1: SQL Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                Supabase SQL Editor에 테이블 스키마 실행
              </span>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL 복사됨!' : 'SQL 전체 복사'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              Supabase Dashboard &gt; <strong>SQL Editor</strong> 메뉴에서 [New query]를 누르고 붙여넣은 뒤 <strong>Run</strong>을 누릅니다. (`supabase-schema.sql` 파일로도 저장되어 있습니다)
            </p>
          </div>

          {/* Step 2: Get API Keys */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              Supabase 대시보드에서 Project URL과 anon Key 복사
            </span>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Supabase Dashboard &gt; <strong>Project Settings</strong> &gt; <strong>API</strong> 탭에서 <strong>Project URL</strong>과 <strong>anon / public</strong> 키를 복사합니다.
            </p>
          </div>

          {/* Step 3: Put into .env */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                .env 파일 또는 Secrets 패널에 키 입력
              </span>
              <button
                onClick={handleCopyEnv}
                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? '환경변수 복사됨!' : '환경변수 형식 복사'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto">
              {envSample}
            </pre>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              프로젝트 루트의 <code>.env</code> 파일에 복사한 값들을 입력해 주시거나, 파일 내용을 알려주시면 즉시 연결해 드립니다.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
