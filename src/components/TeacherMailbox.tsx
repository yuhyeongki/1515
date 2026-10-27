import React, { useState } from 'react';
import {
  Mail,
  Send,
  ShieldCheck,
  Clock,
  CheckCircle2,
  MessageCircleHeart,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { TeacherSecretLetter, CurrentUser } from '../types';

interface TeacherMailboxProps {
  letters: TeacherSecretLetter[];
  currentUser: CurrentUser;
  onSendLetter: (data: {
    topic: '학업/진로' | '친구/교우관계' | '마음/스트레스' | '학교생활건의' | '감사/기타';
    content: string;
    isUrgent: boolean;
  }) => void;
  onReplyLetter: (letterId: string, replyContent: string) => void;
}

const TOPICS = [
  '학업/진로',
  '친구/교우관계',
  '마음/스트레스',
  '학교생활건의',
  '감사/기타',
] as const;

export const TeacherMailbox: React.FC<TeacherMailboxProps> = ({
  letters,
  currentUser,
  onSendLetter,
  onReplyLetter,
}) => {
  const isTeacher = currentUser.role === 'teacher';

  // Student compose state
  const [topic, setTopic] = useState<typeof TOPICS[number]>('학업/진로');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  // Teacher reply state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSendLetter({
      topic,
      content: content.trim(),
      isUrgent,
    });

    setContent('');
    setIsSentSuccess(true);
    setTimeout(() => setIsSentSuccess(false), 4000);
  };

  const handleTeacherReplySubmit = (letterId: string) => {
    if (!replyText.trim()) return;
    onReplyLetter(letterId, replyText.trim());
    setReplyText('');
    setActiveReplyId(null);
  };

  // Filter letters: if teacher, see all letters for this class; if student, see letters sent from their token
  const visibleLetters = isTeacher
    ? letters
    : letters.filter((l) => l.studentToken === currentUser.token);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Intro Hero Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>100% 비밀 보장 선생님 우체통</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            {isTeacher ? '선생님 안심 상담 우체통 관리' : '담임선생님께 보내는 비밀 편지'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed break-keep">
            {isTeacher
              ? '학생들이 털어놓은 솔직한 고민과 마음에 귀 기울이고, 따뜻한 조언과 지지의 답장을 전해주세요.'
              : '친구들에게는 말하기 힘든 학업 고민, 진로 걱정, 교우관계 문제 등을 담임선생님께 편하게 털어놓으세요. 다른 학생들에게는 일절 공개되지 않습니다.'}
          </p>
        </div>

        {/* Ambient watermark illustration */}
        <div className="absolute -right-6 -bottom-6 w-44 h-44 rounded-full bg-emerald-700/20 pointer-events-none blur-2xl" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block text-emerald-600/30">
          <Mail className="w-32 h-32 stroke-[1]" />
        </div>
      </div>

      {/* Student View: Compose New Letter */}
      {!isTeacher && (
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">새 비밀 편지 쓰기</h3>
              <p className="text-xs text-neutral-500">
                작성자: <span className="font-semibold text-neutral-800">{currentUser.name}</span> (가명으로 전달됨)
              </p>
            </div>
          </div>

          {isSentSuccess && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>담임선생님께 비밀 편지가 안전하게 전달되었습니다. 답장이 오면 알림함에서 확인하실 수 있습니다.</span>
            </div>
          )}

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            {/* Topic Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                상담 주제
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      topic === t
                        ? 'bg-emerald-800 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Content */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                선생님께 드리는 이야기
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="선생님 안녕하세요. 사실 요즘..."
                rows={5}
                required
                className="w-full px-4 py-3 text-sm rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 resize-none leading-relaxed"
              />
            </div>

            {/* Urgent Request Checkbox */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-neutral-700">
                  선생님과의 1:1 대면 상담을 원해요
                </span>
              </div>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-neutral-300 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>담임선생님께 편지 보내기</span>
            </button>
          </form>
        </div>
      )}

      {/* Letters List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-neutral-900">
            {isTeacher ? `접수된 학생 비밀 편지 (${visibleLetters.length})` : '내가 보낸 비밀 편지함'}
          </h3>
          <span className="text-xs text-neutral-500">
            {visibleLetters.length}개의 대화
          </span>
        </div>

        {visibleLetters.length === 0 ? (
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-bold text-neutral-800 mb-1">
              {isTeacher ? '도착한 학생 편지가 없습니다' : '아직 보낸 비밀 편지가 없습니다'}
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {isTeacher
                ? '학생들이 고민을 남기면 이곳에 익명으로 안전하게 표시됩니다.'
                : '선생님께 고민이나 전하고 싶은 이야기를 첫 번째 비밀 편지로 적어보세요.'}
            </p>
          </div>
        ) : (
          visibleLetters.map((letter) => (
            <div
              key={letter.id}
              className="bg-white border border-neutral-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Letter Header */}
              <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${letter.studentBg}`}
                  >
                    {letter.studentEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">
                        {letter.studentAlias}
                      </span>
                      {letter.isUrgent && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                          대면상담 요청
                        </span>
                      )}
                    </div>
                    {/* Zero-Pill metadata: unboxed text */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                      <span className="font-medium text-emerald-800">{letter.topic}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{letter.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div>
                  {letter.status === 'replied' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 답장 완료
                    </span>
                  ) : letter.status === 'read' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> 선생님 확인
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> 답변 대기
                    </span>
                  )}
                </div>
              </div>

              {/* Letter Body */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap break-keep">
                  {letter.content}
                </p>
              </div>

              {/* Teacher Reply Section */}
              {letter.teacherReply ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                        쌤
                      </div>
                      <span className="text-xs font-bold text-emerald-950">
                        {letter.teacherReply.teacherName}의 답장
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-800/80 tabular-nums">
                      {letter.teacherReply.repliedAt}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap break-keep pl-9">
                    {letter.teacherReply.replyContent}
                  </p>
                </div>
              ) : isTeacher ? (
                /* Teacher Reply Composer */
                <div className="pt-2">
                  {activeReplyId === letter.id ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                      <label className="block text-xs font-bold text-neutral-800">
                        학생에게 전할 따뜻한 조언과 답장
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="따뜻한 마음으로 학생의 고민에 공감해주고 구체적인 조언이나 상담 일정을 적어주세요..."
                        rows={3}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTeacherReplySubmit(letter.id)}
                          disabled={!replyText.trim()}
                          className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-neutral-300 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>답장 보내기</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveReplyId(letter.id);
                        setReplyText('');
                      }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageCircleHeart className="w-4 h-4" />
                      <span>학생에게 답장 작성하기</span>
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
