import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { ClassStory, CurrentUser, CardTheme } from '../types';

interface StoriesBarProps {
  stories: ClassStory[];
  currentUser: CurrentUser;
  onAddStory: (content: string, theme: CardTheme) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories, currentUser, onAddStory }) => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTheme, setNewTheme] = useState<CardTheme>('sunset');
  const [storyLiked, setStoryLiked] = useState(false);

  // Auto-advance story
  useEffect(() => {
    if (selectedStoryIndex === null) {
      setProgress(0);
      return;
    }

    setStoryLiked(false);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          if (selectedStoryIndex < stories.length - 1) {
            setSelectedStoryIndex(selectedStoryIndex + 1);
            return 0;
          } else {
            setSelectedStoryIndex(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [selectedStoryIndex, stories.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedStoryIndex !== null) {
      if (selectedStoryIndex < stories.length - 1) {
        setSelectedStoryIndex(selectedStoryIndex + 1);
      } else {
        setSelectedStoryIndex(null);
      }
    }
  };

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddStory(newContent.trim(), newTheme);
    setNewContent('');
    setIsAddModalOpen(false);
  };

  const activeStory = selectedStoryIndex !== null ? stories[selectedStoryIndex] : null;

  return (
    <>
      {/* Horizontal Story Tray */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {/* Add story button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div className="relative w-15 h-15 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50 group-hover:bg-neutral-100 transition-colors">
              <div className="text-xl">{currentUser.avatarEmoji}</div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-neutral-600 truncate max-w-[64px]">
              내 스토리
            </span>
          </button>

          {/* Stories list */}
          {stories.map((story, idx) => (
            <button
              key={story.id}
              onClick={() => setSelectedStoryIndex(idx)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="w-15 h-15 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center">
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center text-xl shadow-inner ${story.authorBg}`}
                  >
                    {story.authorEmoji}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-neutral-700 truncate max-w-[68px]">
                {story.authorAlias}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setSelectedStoryIndex(null)}
        >
          <div
            className="relative w-full max-w-sm h-[580px] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between bg-neutral-900 border border-neutral-800 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bars */}
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
              {stories.map((s, idx) => (
                <div key={s.id} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 rounded-full"
                    style={{
                      width:
                        idx < (selectedStoryIndex ?? 0)
                          ? '100%'
                          : idx === selectedStoryIndex
                          ? `${progress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="relative z-20 p-4 pt-7 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${activeStory.authorBg}`}>
                  {activeStory.authorEmoji}
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">{activeStory.authorAlias}</div>
                  <div className="text-[10px] text-white/70">{activeStory.createdAt}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStoryIndex(null)}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Story Body Card */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-6 text-center">
              <div
                className={`w-full rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[220px] ${
                  activeStory.theme === 'sunset'
                    ? 'bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 text-white'
                    : activeStory.theme === 'mint'
                    ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white'
                    : activeStory.theme === 'lavender'
                    ? 'bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white'
                    : 'bg-neutral-800 text-white border border-neutral-700'
                }`}
              >
                <div className="text-3xl mb-3">{activeStory.authorEmoji}</div>
                <p className="text-base sm:text-lg font-medium leading-relaxed break-keep">
                  "{activeStory.content}"
                </p>
                <div className="mt-4 text-[11px] text-white/80 font-mono">
                  3학년 2반 시크릿 스토리
                </div>
              </div>
            </div>

            {/* Navigation click zones on left and right */}
            <button
              onClick={handlePrev}
              disabled={selectedStoryIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center disabled:opacity-0 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Story Bottom Reaction Bar */}
            <div className="relative z-20 p-4 pb-5 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex-1 bg-white/15 rounded-full px-4 py-2 text-xs text-white/70">
                우리반 스토리 답장 보내기...
              </div>
              <button
                onClick={() => setStoryLiked(!storyLiked)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-125 cursor-pointer ${
                  storyLiked ? 'text-rose-500 bg-white/20' : 'text-white bg-white/10'
                }`}
              >
                <Heart className={`w-5 h-5 ${storyLiked ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-neutral-900">오늘의 한마디 스토리 올리기</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStory}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                  오늘 우리반에게 전하고 싶은 짧은 이야기
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="예: 오늘 5교시 자습 실화냐?! 매점 갈 사람 구함 🏃‍♂️"
                  rows={3}
                  maxLength={120}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
                <div className="text-right text-[11px] text-neutral-400 mt-1">
                  {newContent.length}/120자
                </div>
              </div>

              {/* Theme Picker */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-neutral-600 mb-2">
                  배경 테마 선택
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTheme('sunset')}
                    className={`h-10 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-semibold cursor-pointer border-2 transition-all ${
                      newTheme === 'sunset' ? 'border-neutral-900 scale-105' : 'border-transparent'
                    }`}
                  >
                    노을
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTheme('mint')}
                    className={`h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-semibold cursor-pointer border-2 transition-all ${
                      newTheme === 'mint' ? 'border-neutral-900 scale-105' : 'border-transparent'
                    }`}
                  >
                    민트
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTheme('lavender')}
                    className={`h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-semibold cursor-pointer border-2 transition-all ${
                      newTheme === 'lavender' ? 'border-neutral-900 scale-105' : 'border-transparent'
                    }`}
                  >
                    라벤더
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTheme('warm')}
                    className={`h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[11px] font-semibold cursor-pointer border-2 transition-all ${
                      newTheme === 'warm' ? 'border-neutral-900 scale-105' : 'border-transparent'
                    }`}
                  >
                    웜톤
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!newContent.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  스토리 게시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
