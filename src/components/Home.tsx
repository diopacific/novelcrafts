import React, { useMemo, memo } from 'react';
import { 
  Book, PenTool, Plus, Settings, TrendingUp, ChevronRight, 
  Sparkles, BookOpen, Clock, FileText, CheckCircle2, Zap, 
  ArrowRight, RefreshCw, Search, BookmarkCheck, Feather
} from 'lucide-react';
import { Episode, BibleState } from '../types';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export const Home = memo(function Home({ 
  episodes, 
  bible, 
  onNavigate,
  onSelectEpisode,
  onOpenCommand
}: { 
  episodes: Episode[], 
  bible: BibleState, 
  onNavigate: (section: 'bible' | 'workspace' | 'tools') => void,
  onSelectEpisode?: (episodeId: string) => void,
  onOpenCommand?: () => void
}) {
  const totalCharacters = episodes.reduce((acc, ep) => acc + ep.content.length, 0);
  const TARGET_CHARS_VOLUME = 150000; // 웹소설 1권 분량 (약 25~30화)
  const currentTarget = Math.max(TARGET_CHARS_VOLUME, Math.ceil(Math.max(totalCharacters, 1) / TARGET_CHARS_VOLUME) * TARGET_CHARS_VOLUME);
  const progressPercent = Math.min(Math.round((totalCharacters / currentTarget) * 100), 100);

  const recentEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => b.number - a.number).slice(0, 4);
  }, [episodes]);

  const bibleCompletion = useMemo(() => {
    const fields = ['logline', 'story', 'world', 'system', 'item', 'character', 'villain', 'timeline', 'structure', 'episode'];
    let filled = 0;
    fields.forEach(field => {
      if (bible[field as keyof BibleState] && (bible[field as keyof BibleState] as string).trim().length > 10) {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
  }, [bible]);

  const [todayTip, setTodayTip] = React.useState("웹소설은 가독성이 생명입니다. 한 문단은 2~3문장을 넘지 않게 줄바꿈하세요.");
  const TIPS = [
    "웹소설은 가독성이 생명입니다. 한 문단은 2~3문장을 넘지 않게 줄바꿈하세요.",
    "주인공의 결핍과 욕망이 명확할수록 독자는 첫 화부터 몰입합니다.",
    "클리프행어(절단신공)는 위기뿐만 아니라 막대한 보상 직전에도 강력합니다.",
    "조연은 주인공의 매력과 세계관의 규칙을 자연스럽게 드러내는 거울입니다.",
    "시스템 창이나 상태창 메시지는 너무 길지 않게 2~3줄로 핵심만 보여주세요.",
    "첫 5화 안에 주인공의 독점적인 기연이나 히든 피스를 확실히 각인시키세요."
  ];

  const handleEpisodeClick = (epId: string) => {
    if (onSelectEpisode) {
      onSelectEpisode(epId);
    }
    onNavigate('workspace');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-10 lg:p-14 bg-transparent text-slate-100 relative overflow-y-auto custom-scrollbar w-full h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1140px] w-full z-10 space-y-8">
        
        {/* Hero Header */}
        <motion.div variants={itemVariants} className="text-left space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-amber-300 text-xs font-bold border border-white/[0.08] shadow-[0_0_20px_rgba(251,191,36,0.1)] backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>천공의 도서관 스튜디오 · Pro Edition</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            당신의 세계를 완성하는 곳,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]">
              NovelCraft AI
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
            탄탄한 세계관 설정집부터 회차별 5,500자 페이싱 조절, 문체 교정 AI까지 완벽한 몰입형 웹소설 집필 환경을 제공합니다.
          </p>
          
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => {
                onNavigate('workspace');
                setTimeout(() => window.dispatchEvent(new CustomEvent('createNewEpisode')), 100);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-black text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
            >
              <PenTool className="w-4 h-4" />
              <span>새 회차 집필 시작</span>
            </button>
            
            {onOpenCommand && (
              <button
                onClick={onOpenCommand}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 font-semibold text-xs sm:text-sm transition-all active:scale-95"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>커맨드 센터</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/[0.08]">⌘K</kbd>
              </button>
            )}
            
            <button
              onClick={() => onNavigate('bible')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>설정 바이블 점검</span>
            </button>
          </div>
        </motion.div>

        {/* Top Grid: Progress + Bible Completion & Tip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Main Progress Card */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-[#070913]/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] p-6 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/[0.14] transition-all">
            <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-105">
              <TrendingUp className="w-72 h-72 text-amber-300" />
            </div>
            
            <div className="flex flex-col h-full relative z-10 justify-between gap-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg tracking-tight">집필 진척도 (유료화 목표)</h3>
                    <p className="text-xs text-slate-400">웹소설 1권 분량 (150,000자 기준)</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                    {totalCharacters.toLocaleString()}<span className="text-sm font-normal text-slate-400 ml-1">자</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    목표 {currentTarget.toLocaleString()}자
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                  <span className="text-amber-300 font-bold">달성률 {progressPercent}%</span>
                  <span>남은 분량 {Math.max(0, currentTarget - totalCharacters).toLocaleString()}자</span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>총 {episodes.length}개 회차 등록됨</span>
                  <span>평균 화당 {episodes.length > 0 ? Math.round(totalCharacters / episodes.length).toLocaleString() : 0}자</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Bible Completion + Writing Tip */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-5">
            
            {/* Bible Completion Card */}
            <div 
              onClick={() => onNavigate('bible')} 
              className="bg-[#070913]/90 backdrop-blur-2xl rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/[0.08] cursor-pointer group hover:border-amber-500/30 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs">설정 바이블 완성도</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {bibleCompletion}%
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700" 
                  style={{ width: `${bibleCompletion}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                체계적인 설정은 연재 중 설정 붕괴를 막고 사이다 전개의 든든한 밑거름이 됩니다.
              </p>
              
              <div className="inline-flex items-center text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                설정집 관리하러 가기 <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Writing Tip Card */}
            <div className="bg-[#070913]/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-xs">오늘의 작법 가이드</h3>
                </div>
                <button 
                  onClick={() => setTodayTip(TIPS[Math.floor(Math.random() * TIPS.length)])}
                  className="text-[11px] font-bold text-slate-400 hover:text-amber-300 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 border border-white/[0.06]"
                  title="다른 팁 보기"
                >
                  <RefreshCw className="w-3 h-3" /> 새로고침
                </button>
              </div>
              <p className="text-xs font-medium text-slate-300 leading-relaxed italic border-l-2 border-amber-500/50 pl-3 py-0.5">
                "{todayTip}"
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Recent Episodes & Fast Access */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Recent Episodes (8 cols) */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-[#070913]/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">최근 작성 회차</h3>
                  <p className="text-[11px] text-slate-400">클릭하여 해당 회차 에디터로 바로 이동</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { 
                    onNavigate('workspace'); 
                    setTimeout(() => window.dispatchEvent(new CustomEvent('createNewEpisode')), 100); 
                  }} 
                  className="text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center px-3 py-1.5 rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> 새 회차
                </button>
                <button 
                  onClick={() => onNavigate('workspace')} 
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-white/[0.06]"
                >
                  전체 보기 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>

            {recentEpisodes.length > 0 ? (
              <div className="space-y-2.5">
                {recentEpisodes.map(ep => (
                  <div 
                    key={ep.id} 
                    onClick={() => handleEpisodeClick(ep.id)} 
                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-amber-500/[0.04] hover:border-amber-500/30 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 bg-white/[0.04] rounded-xl border border-white/[0.08] flex items-center justify-center font-black font-mono text-amber-300 text-sm group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition-colors shrink-0">
                        {ep.number}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-amber-200 transition-colors">
                          {ep.direction ? ep.direction : `제 ${ep.number}화 (제목 미정)`}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <FileText className="w-3 h-3 text-slate-500" /> {ep.content.length.toLocaleString()}자
                          </span>
                          <span className="text-slate-600">·</span>
                          {ep.status === 'completed' && (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> 탈고
                            </span>
                          )}
                          {ep.status === 'revision' && (
                            <span className="flex items-center gap-1 text-amber-300 font-bold">
                              <Feather className="w-3 h-3" /> 퇴고
                            </span>
                          )}
                          {ep.status === 'draft' && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Book className="w-3 h-3 text-slate-500" /> 초안
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-white/[0.08] transition-colors shrink-0 ml-2">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center bg-white/[0.01] rounded-xl border border-white/[0.06] border-dashed">
                <FileText className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                <span className="text-xs text-slate-400 mb-3">등록된 회차가 없습니다.<br/>첫 번째 에피소드를 작성해보세요.</span>
                <button 
                  onClick={() => { 
                    onNavigate('workspace'); 
                    setTimeout(() => window.dispatchEvent(new CustomEvent('createNewEpisode')), 100); 
                  }} 
                  className="text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  1화 작성 시작하기
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick Hub Navigation Cards (4 cols) */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-4">
            <button 
              onClick={() => onNavigate('workspace')} 
              className="flex items-center p-5 bg-[#070913]/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-amber-500/40 hover:-translate-y-0.5 transition-all text-left group"
            >
              <div className="w-12 h-12 shrink-0 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 border border-amber-500/20 transition-transform">
                <PenTool className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">집필 스튜디오</h3>
                <p className="text-xs text-slate-400 mt-0.5">5,500자 페이싱 미터 및 AI 실시간 코파일럿</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-300 transition-colors shrink-0" />
            </button>
            
            <button 
              onClick={() => onNavigate('bible')} 
              className="flex items-center p-5 bg-[#070913]/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-amber-500/40 hover:-translate-y-0.5 transition-all text-left group"
            >
              <div className="w-12 h-12 shrink-0 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 border border-amber-500/20 transition-transform">
                <Book className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">설정 바이블 공장</h3>
                <p className="text-xs text-slate-400 mt-0.5">장르 프리셋, AI 설정 감사, 인물 관계도</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-300 transition-colors shrink-0" />
            </button>

            <button 
              onClick={() => onNavigate('tools')} 
              className="flex items-center p-5 bg-[#070913]/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-amber-500/40 hover:-translate-y-0.5 transition-all text-left group"
            >
              <div className="w-12 h-12 shrink-0 bg-white/[0.04] text-slate-300 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 border border-white/[0.08] transition-transform">
                <Settings className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">데이터 센터 & 통계</h3>
                <p className="text-xs text-slate-400 mt-0.5">JSON 백업, TXT/MD 내보내기, 정밀 통계</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-300 transition-colors shrink-0" />
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
});
