import React, { useState } from 'react';
import { X, Lock, Sparkles, Shuffle, ShieldCheck } from 'lucide-react';
import { PostCategory, CardTheme, CurrentUser } from '../types';
import { getRandomAnonymousPersona } from '../services/storage';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onSubmit: (data: {
    category: Exclude<PostCategory, '전체'>;
    content: string;
    theme: CardTheme;
    isSpoiler: boolean;
    authorAlias: string;
    authorEmoji: string;
    authorBg: string;
  }) => void;
}

const CATEGORIES: Exclude<PostCategory, '전체'>[] = [
  '속마음',
  '짝사랑',
  '고민',
  '시험/공부',
  '급식',
  '웃긴일',
  '선생님',
];

const THEMES: { id: CardTheme; label: string; previewClass: string }[] = [
  { id: 'sunset', label: '노을 감성', previewClass: 'bg-gradient-to-r from-rose-400 to-amber-400' },
  { id: 'chalkboard', label: '교실 칠판', previewClass: 'bg-neutral-800' },
  { id: 'lavender', label: '라벤더', previewClass: 'bg-gradient-to-r from-purple-400 to-indigo-400' },
  { id: 'mint', label: '민트 칠', previewClass: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
  { id: 'notebook', label: '노트 필기', previewClass: 'bg-amber-100 border border-amber-300' },
  { id: 'minimal', label: '클린 화이트', previewClass: 'bg-white border border-neutral-300' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
}) => {
  const [category, setCategory] = useState<Exclude<PostCategory, '전체'>>('속마음');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<CardTheme>('sunset');
  const [isSpoiler, setIsSpoiler] = useState(false);

  // Temporary persona for this specific post (allows user to re-roll pseudonym if desired!)
  const [customAlias, setCustomAlias] = useState(currentUser.name);
  const [customEmoji, setCustomEmoji] = useState(currentUser.avatarEmoji);
  const [customBg, setCustomBg] = useState(currentUser.avatarBg);

  if (!isOpen) return null;

  const handleRerollPersona = () => {
    const random = getRandomAnonymousPersona();
    setCustomAlias(random.name);
    setCustomEmoji(random.emoji);
    setCustomBg(random.bg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      category,
      content: content.trim(),
      theme,
      isSpoiler,
      authorAlias: customAlias,
      authorEmoji: customEmoji,
      authorBg: customBg,
    });

    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">새 비밀 작성하기</h3>
              <p className="text-[11px] text-neutral-500">우리반 친구들에게 100% 익명으로 전달됩니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Persona Strip */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${customBg}`}>
                {customEmoji}
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <span>{customAlias}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">(익명 가명)</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  {currentUser.classCode} 학생
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRerollPersona}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors shadow-xs cursor-pointer"
              title="다른 익명 캐릭터로 변경"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>닉네임 재추첨</span>
            </button>
          </div>

          {/* Category Selector (Buttons) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              카테고리 선택
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secret Content */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              비밀 속마음 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="친구들에게 털어놓고 싶었던 속마음, 좋아하는 친구에 대한 고백, 학업 고민, 재미있는 썰 등을 자유롭게 적어보세요..."
              rows={5}
              maxLength={600}
              required
              className="w-full px-4 py-3 text-sm rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
              <span>욕설, 비방, 실명 비하는 삼가주세요.</span>
              <span className="tabular-nums font-mono">{content.length}/600자</span>
            </div>
          </div>

          {/* Card Theme Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              카드 배경 스타일
            </label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium border-2 flex items-center gap-2 transition-all cursor-pointer ${
                    theme === t.id
                      ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${t.previewClass} shrink-0`} />
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Spoiler Protection Toggle */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-700" />
              <div>
                <div className="text-xs font-bold text-amber-900">비밀 가리기 (스포일러 잠금)</div>
                <div className="text-[11px] text-amber-700">
                  피드에서 블러 처리되며, 친구가 탭해야만 내용이 보여요
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex-2 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              비밀 공유하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
