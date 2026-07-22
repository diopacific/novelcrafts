import React, { useMemo, memo } from 'react';
import { Book, PenTool, Settings, Archive, TrendingUp, ChevronRight, PlayCircle, Sparkles, BookOpen, Clock, FileText, CheckCircle2, Zap } from 'lucide-react';
import { Episode, BibleState } from '../types';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

export const Home = memo(function Home({ episodes, bible, onNavigate }: { episodes: Episode[], bible: BibleState, onNavigate: (section: 'bible' | 'workspace' | 'tools') => void }) {
  const totalCharacters = episodes.reduce((acc, ep) => acc + ep.content.length, 0);
  
  // 플랫폼 유료화 평균 기준인 15만자를 1차 목표로 설정
  const TARGET_CHARS_VOLUME = 150000;
  const currentTarget = Math.ceil(Math.max(totalCharacters, 1) / TARGET_CHARS_VOLUME) * TARGET_CHARS_VOLUME;
  const progressPercent = Math.min(Math.round((totalCharacters / currentTarget) * 100), 100);

  // 최근 작성한 회차 추출 (가장 높은 번호 순)
  const recentEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => b.number - a.number).slice(0, 4);
  }, [episodes]);

  // 설정 완성도 계산
  const bibleCompletion = useMemo(() => {
    const fields = ['logline', 'story', 'world', 'system', 'character', 'villain', 'timeline', 'structure', 'episode'];
    let filled = 0;
    fields.forEach(field => {
      if (bible[field as keyof BibleState] && (bible[field as keyof BibleState] as string).trim().length > 10) {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
  }, [bible]);

  const TIPS = [
    "웹소설은 가독성이 생명입니다. 한 문단은 2~3문장을 넘지 않게 하세요.",
    "주인공의 목적과 결핍이 명확할수록 독자는 쉽게 몰입합니다.",
    "클리프행어(절단신공)는 위기뿐만 아니라 보상 직전에도 효과적입니다.",
    "조연은 주인공의 매력을 돋보이게 하는 거울 역할을 해야 합니다."
  ];
  const todayTip = TIPS[new Date().getDay() % TIPS.length];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 lg:p-16 bg-[#f8fafc] relative overflow-y-auto custom-scrollbar w-full h-full">
      {/* Subtle background decoration */}
      <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1200px] w-full z-10 space-y-12"
      >
        <motion.div variants={itemVariants} className="text-left space-y-5 pt-8 mb-12">
           <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-100/50 text-indigo-700 text-sm font-bold border border-indigo-200/60 shadow-sm backdrop-blur-md">
             <Archive className="w-4 h-4 text-indigo-500" />
             웹소설 통합 매니지먼트 스튜디오
           </div>
           <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
             당신의 세계를 완성하는 곳,<br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">소설공장</span>
           </h1>
           <p className="text-[17px] text-slate-500 font-medium max-w-2xl leading-relaxed">
             세계관 구축부터 회차별 분량 조절, 통합 백업까지 완벽한 집필 환경을 제공합니다. 체계적인 관리로 연재의 부담을 덜어보세요.
           </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* 집필 진척도 카드 (메인) */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-white rounded-[32px] border border-slate-200/80 p-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute right-[-40px] top-[-40px] opacity-[0.02] pointer-events-none transition-transform duration-1000 group-hover:scale-110">
              <TrendingUp className="w-96 h-96" />
            </div>
            
            <div className="flex flex-col h-full relative z-10">
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
                    <Sparkles className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xl tracking-tight">현재 집필 진척도</h3>
                    <p className="text-[15px] font-medium text-slate-500 mt-1">누적된 작업 분량을 확인하세요</p>
                  </div>
                </div>
                <div className="text-right flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-slate-800 tracking-tighter">{episodes.length}</span>
                  <span className="text-xl font-bold text-slate-400">화</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[24px] p-8 border border-slate-100 mb-8">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[15px] font-black text-indigo-900/80">
                    {currentTarget === TARGET_CHARS_VOLUME ? '유료화 전환 목표 (15만자)' : `다음 목표 (${(currentTarget/10000).toFixed(0)}만자)`}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-indigo-600 tracking-tight">{totalCharacters.toLocaleString()}</span>
                    <span className="text-[15px] font-bold text-slate-400">자</span>
                  </div>
                </div>
                <div className="h-4 w-full bg-indigo-100/50 rounded-full overflow-hidden border border-indigo-100/50 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full relative transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onNavigate('workspace')}
                className="mt-auto w-full py-4.5 bg-slate-900 text-white rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 duration-300"
              >
                원고 이어서 쓰기 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* 우측 상단 팁 & 설정 통계 */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-8">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-[32px] p-8 shadow-sm text-white relative overflow-hidden group flex-1 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300" onClick={() => onNavigate('bible')}>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                <Book className="w-40 h-40" />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2.5 mb-3 text-indigo-100">
                  <BookOpen className="w-6 h-6" />
                  <span className="font-bold text-[15px]">설정 공장 완성도</span>
                </div>
                <div className="text-5xl font-black mb-5 tracking-tight">{bibleCompletion}%</div>
                <p className="text-[15px] font-medium text-indigo-100/90 leading-relaxed mb-8">
                  탄탄한 설정은 연재의 원동력입니다.<br/>설정을 채워 세계를 구체화하세요.
                </p>
                <div className="mt-auto inline-flex items-center text-[15px] font-bold bg-white/10 w-fit px-5 py-2.5 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition-colors border border-white/10">
                  설정 다듬기 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200/80 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
              <div className="flex items-center gap-2.5 mb-4">
                <Zap className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-[16px]">오늘의 작법 팁</h3>
              </div>
              <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
                "{todayTip}"
              </p>
            </div>
          </motion.div>

          {/* 최근 회차 섹션 */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-white rounded-[32px] border border-slate-200/80 p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-xl tracking-tight">최근 작업 회차</h3>
              </div>
              <button onClick={() => onNavigate('workspace')} className="text-[15px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
                전체 보기 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {recentEpisodes.length > 0 ? (
              <div className="space-y-4">
                {recentEpisodes.map(ep => (
                  <div key={ep.id} onClick={() => onNavigate('workspace')} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all duration-200 group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm font-black text-slate-700 text-lg group-hover:border-indigo-200 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                        {ep.number}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-[16px] mb-1.5 group-hover:text-indigo-900 transition-colors">
                          {ep.summary ? ep.summary : `${ep.number}화`}
                        </div>
                        <div className="flex items-center gap-4 text-[13px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {ep.content.length.toLocaleString()}자</span>
                          {ep.status === 'completed' && <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> 탈고 완료</span>}
                          {ep.status === 'revision' && <span className="text-amber-600 flex items-center gap-1.5"><PenTool className="w-4 h-4" /> 퇴고 중</span>}
                          {ep.status === 'draft' && <span className="text-slate-400 flex items-center gap-1.5"><Book className="w-4 h-4" /> 초안</span>}
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium flex flex-col items-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <FileText className="w-14 h-14 mb-4 text-slate-300" />
                <span className="text-[15px]">아직 작성된 회차가 없습니다.<br/>첫 번째 원고를 시작해보세요.</span>
              </div>
            )}
          </motion.div>

          {/* 하단 퀵 내비게이션 (도구 및 기타) */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-8">
            <button 
              onClick={() => onNavigate('tools')} 
              className="flex items-center p-8 bg-white rounded-[32px] border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 text-left group h-[160px]"
            >
              <div className="w-16 h-16 shrink-0 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 border border-slate-200 transition-all duration-300">
                <Settings className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-900 transition-colors">데이터 관리</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">로컬 백업 및 TXT, 마크다운 내보내기</p>
              </div>
            </button>
            
            <button 
              onClick={() => onNavigate('workspace')} 
              className="flex items-center p-8 bg-white rounded-[32px] border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 text-left group h-[160px]"
            >
              <div className="w-16 h-16 shrink-0 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 group-hover:bg-emerald-100 border border-emerald-100 transition-all duration-300">
                <PenTool className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-900 transition-colors">회차 보관함</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">AI 보조 기능과 함께 원고 작성하기</p>
              </div>
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
});


