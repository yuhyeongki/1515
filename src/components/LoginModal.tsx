import React, { useState } from 'react';
import { X, User, ShieldCheck, Sparkles, Shuffle, KeyRound, Check } from 'lucide-react';
import { CurrentUser, UserRole } from '../types';
import { ANONYMOUS_MASCOTS, getRandomAnonymousPersona } from '../services/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onSaveUser: (user: CurrentUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [classCode, setClassCode] = useState(currentUser.classCode || '3학년 2반');
  const [studentName, setStudentName] = useState(
    currentUser.role === 'student' ? currentUser.name : '익명의 쿼카'
  );
  const [selectedMascot, setSelectedMascot] = useState(
    ANONYMOUS_MASCOTS.find((m) => m.emoji === currentUser.avatarEmoji) || ANONYMOUS_MASCOTS[0]
  );
  const [teacherPasscode, setTeacherPasscode] = useState('');
  const [teacherName, setTeacherName] = useState('김은지 선생님 (담임)');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRandomizeStudent = () => {
    const random = getRandomAnonymousPersona();
    setStudentName(random.name);
    const matchedMascot = ANONYMOUS_MASCOTS.find((m) => m.emoji === random.emoji);
    if (matchedMascot) setSelectedMascot(matchedMascot);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedRole === 'teacher') {
      // Simple teacher validation
      if (teacherPasscode && teacherPasscode !== '1234') {
        setErrorMsg('선생님 확인 비밀번호가 일치하지 않습니다. (테스트용: 1234)');
        return;
      }

      onSaveUser({
        id: 'usr_teacher_01',
        role: 'teacher',
        name: teacherName.trim() || '김은지 선생님 (담임)',
        avatarEmoji: '👩‍🏫',
        avatarBg: 'bg-emerald-100 text-emerald-800',
        classCode: classCode.trim() || '3학년 2반',
        token: 'token_teacher_01',
      });
    } else {
      if (!studentName.trim()) {
        setErrorMsg('익명 닉네임을 입력하거나 자동 생성 버튼을 눌러주세요.');
        return;
      }

      onSaveUser({
        id: currentUser.role === 'student' ? currentUser.id : `usr_student_${Date.now()}`,
        role: 'student',
        name: studentName.trim(),
        avatarEmoji: selectedMascot.emoji,
        avatarBg: selectedMascot.bg,
        classCode: classCode.trim() || '3학년 2반',
        token: currentUser.token || `token_student_${Date.now()}`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              간편 로그인 & 역할 설정
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              학생 익명 프로필 또는 담임선생님 모드를 선택하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-5 pb-0">
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <User className="w-4 h-4 text-amber-500" />
              <span>학생 (익명 크루)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('teacher');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'teacher'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>담임선생님 모드</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Class Code */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              우리반 학급 코드
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="예: 3학년 2반"
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            />
          </div>

          {selectedRole === 'student' ? (
            /* Student Mode Setup */
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">
                    익명 닉네임
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeStudent}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>랜덤 닉네임 추천</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="예: 수줍은 곰돌이, 3분단 꿀벌"
                  maxLength={15}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>

              {/* Mascot Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  익명 캐릭터 마스코트
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {ANONYMOUS_MASCOTS.map((m) => {
                    const isSelected = selectedMascot.emoji === m.emoji;
                    return (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => setSelectedMascot(m)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer ${m.bg} ${
                          isSelected
                            ? 'ring-2 ring-neutral-900 scale-105 shadow-sm'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                        title={m.name}
                      >
                        {m.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Persona Preview Card */}
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${selectedMascot.bg}`}
                >
                  {selectedMascot.emoji}
                </div>
                <div className="text-xs">
                  <span className="font-bold text-neutral-900">{studentName}</span>
                  <div className="text-[11px] text-neutral-500">
                    비밀글과 댓글에 100% 익명으로 표시됩니다.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Teacher Mode Setup */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  선생님 성함 / 호칭
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="예: 김은지 선생님 (담임)"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    교사 인증 비밀번호
                  </label>
                  <span className="text-[11px] text-neutral-400">기본값: 1234</span>
                </div>
                <input
                  type="password"
                  value={teacherPasscode}
                  onChange={(e) => setTeacherPasscode(e.target.value)}
                  placeholder="비밀번호 1234 입력"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>담임선생님 인증 권한 안내</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900/80">
                  학생들이 보낸 비밀 편지를 비공개로 열람하고 개별 상담 답장을 작성할 수 있으며, 댓글 작성 시 공식 교사 인증 뱃지가 부착됩니다.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className={`flex-2 py-2.5 rounded-xl text-white text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                selectedRole === 'teacher'
                  ? 'bg-emerald-800 hover:bg-emerald-900'
                  : 'bg-neutral-900 hover:bg-neutral-800'
              }`}
            >
              {selectedRole === 'teacher' ? '선생님으로 로그인' : '익명 학생으로 시작하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
