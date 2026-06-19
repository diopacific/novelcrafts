import React from 'react';
import { Book, PenTool, Settings, Archive, TrendingUp, ChevronRight, PlayCircle, Sparkles } from 'lucide-react';
import { Episode } from '../types';
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

export function Home({ episodes, onNavigate }: { episodes: Episode[], onNavigate: (section: 'bible' | 'workspace' | 'tools') => void }) {
  const totalCharacters = episodes.reduce((acc, ep) => acc + ep.content.length, 0);
  
  // 플랫폼 유료화 평균 기준인 15만자를 1차 목표로 설정
  const TARGET_CHARS_VOLUME = 150000;
  const currentTarget = Math.ceil(Math.max(totalCharacters, 1) / TARGET_CHARS_VOLUME) * TARGET_CHARS_VOLUME;
  const progressPercent = Math.min(Math.round((totalCharacters / currentTarget) * 100), 100);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-50 relative overflow-y-auto custom-scrollbar">
      {/* Subtle background decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full z-10 space-y-12 my-auto"
      >
        <motion.div variants={itemVariants} className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/50 text-indigo-700 text-sm font-bold border border-indigo-200/60 shadow-sm">
             <Archive className="w-4 h-4 text-indigo-500" />
             웹소설 통합 매니지먼트 스튜디오
           </div>
           <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
             당신의 세계를 완성하는 곳,<br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">소설공장</span>
           </h1>
           <p className="text-[17px] text-slate-500 max-w-2xl mx-auto font-medium leading-[1.7]">
             산재되어 있는 설정과 원고 자산들을 통합하여 관리하세요. 세계관 구축부터 회차별 분량 조절, 데이터 백업까지 집필에 필요한 모든 것을 안전하게 보호합니다.
           </p>
        </motion.div>

        {episodes.length > 0 ? (
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute right-[-40px] top-[-40px] opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-110">
              <TrendingUp className="w-64 h-64" />
            </div>
            
            <div className="flex-1 w-full relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">현재 집필 진척도</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-indigo-600">{episodes.length}<span className="text-lg font-bold text-slate-400 ml-1">화</span></span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500">
                    {currentTarget === TARGET_CHARS_VOLUME ? '유료화 전환 목표 (15만자)' : `목표 (${(currentTarget/10000).toFixed(0)}만자)`}
                  </span>
                  <span className="font-black text-slate-700">{totalCharacters.toLocaleString()}<span className="text-sm font-bold text-slate-400 ml-1">자</span></span>
                </div>
                <div className="h-4 w-full bg-slate-200/50 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full relative transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full md:w-auto flex justify-center">
              <button 
                onClick={() => onNavigate('workspace')}
                className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300"
              >
                원고 쓰기 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-indigo-100 p-8 shadow-sm max-w-3xl mx-auto text-center border-dashed">
             <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">당신의 첫 번째 영감을 기록하세요</h3>
             <p className="text-slate-500 mb-6">설정을 다듬거나 바로 첫 원고를 작성할 수 있습니다.</p>
             <button 
                onClick={() => onNavigate('bible')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                설정 공장 시작하기
              </button>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <button 
            onClick={() => onNavigate('bible')} 
            className="flex flex-col items-start justify-start w-full h-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 hover:-translate-y-1 transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-sm border border-indigo-100/50 transition-all duration-300">
              <Book className="w-7 h-7" />
            </div>
            <h3 className="text-xl md:text-[22px] font-bold text-slate-900 mb-3 tracking-tight w-full flex justify-between items-center">
              설정 공장
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </h3>
            <p className="text-[14px] md:text-[14.5px] text-slate-600 leading-[1.6] font-medium w-full">장편 연재를 지탱하는 뼈대 구축 단계입니다. 세계관, 캐릭터 등 핵심 바이블을 설계합니다.</p>
          </button>

          <button 
            onClick={() => onNavigate('workspace')} 
            className="flex flex-col items-start justify-start w-full h-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 hover:-translate-y-1 transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-sm border border-emerald-100/50 transition-all duration-300">
              <PenTool className="w-7 h-7" />
            </div>
            <h3 className="text-xl md:text-[22px] font-bold text-slate-900 mb-3 tracking-tight w-full flex justify-between items-center">
              회차 보관함
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </h3>
            <p className="text-[14px] md:text-[14.5px] text-slate-600 leading-[1.6] font-medium w-full">작성한 원고를 보존하고 수정하세요. 회차 순서 재배열과 꼼꼼한 글자 수 계산을 지원합니다.</p>
          </button>

          <button 
            onClick={() => onNavigate('tools')} 
            className="flex flex-col items-start justify-start w-full h-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:ring-2 hover:ring-slate-100 hover:-translate-y-1 transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-slate-50 to-gray-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-sm border border-slate-200/50 transition-all duration-300">
              <Settings className="w-7 h-7" />
            </div>
            <h3 className="text-xl md:text-[22px] font-bold text-slate-900 mb-3 tracking-tight w-full flex justify-between items-center">
              데이터 관리
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </h3>
            <p className="text-[14px] md:text-[14.5px] text-slate-600 leading-[1.6] font-medium w-full">로컬 JSON 백업 기능과 다양한 플랫폼에 바로 올릴 수 있는 형태의 텍스트 다운로드를 제공합니다.</p>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

