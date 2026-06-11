import React from 'react';
import { Book, PenTool, Settings, Sparkles } from 'lucide-react';

export function Home({ onNavigate }: { onNavigate: (section: 'bible' | 'workspace' | 'tools') => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 relative overflow-y-auto custom-scrollbar">
      {/* Subtle background decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full z-10 space-y-12 mb-16">
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/50 text-indigo-700 text-sm font-bold border border-indigo-200/60 shadow-sm">
             <Sparkles className="w-4 h-4 text-indigo-500" />
             AI 웹소설 창작 파트너
           </div>
           <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight pt-2">소설공장 스튜디오</h1>
           <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mt-4">
             단편적인 아이디어를 체계적인 설정집으로 구축하고, 4장면 플롯 분할 기법을 통해 5,000자 분량의 튼튼한 에피소드를 무한히 찍어내는 자동화 스튜디오입니다.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <button 
            onClick={() => onNavigate('bible')} 
            className="flex flex-col items-start p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 text-left group"
          >
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
              <Book className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">설정 공장</h3>
            <p className="text-[14px] text-slate-500 leading-relaxed font-medium">장기 연재를 위한 뼈대 구축 단계입니다. 세계관, 캐릭터 등 6가지의 최우선 설정 바이블을 작성합니다.</p>
          </button>

          <button 
            onClick={() => onNavigate('workspace')} 
            className="flex flex-col items-start p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 text-left group"
          >
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
              <PenTool className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">집필 공장</h3>
            <p className="text-[14px] text-slate-500 leading-relaxed font-medium">설정집과 문맥을 기반으로 한 4단계 플롯 분할 시스템. 파트별로 꼼꼼히 장면을 생성하여 회차를 완성합니다.</p>
          </button>

          <button 
            onClick={() => onNavigate('tools')} 
            className="flex flex-col items-start p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 text-left group"
          >
            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-100 transition-all duration-300">
              <Settings className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">기타</h3>
            <p className="text-[14px] text-slate-500 leading-relaxed font-medium">단어 수 등의 작업물 통계와 데이터를 확인하고 로컬 백업 및 복구를 안전하게 진행합니다.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
