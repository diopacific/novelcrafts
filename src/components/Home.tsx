import React from 'react';
import { Book, PenTool, Settings, Archive, Star, TrendingUp } from 'lucide-react';
import { Episode } from '../types';

export function Home({ episodes, onNavigate }: { episodes: Episode[], onNavigate: (section: 'bible' | 'workspace' | 'tools') => void }) {
  const totalCharacters = episodes.reduce((acc, ep) => acc + ep.content.length, 0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 relative overflow-y-auto custom-scrollbar">
      {/* Subtle background decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full z-10 space-y-12 mb-16 pt-8">
        <div className="text-center space-y-5">
           <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/50 text-indigo-700 text-sm font-bold border border-indigo-200/60 shadow-sm">
             <Archive className="w-4 h-4 text-indigo-500" />
             웹소설 원고 관리 보관함
           </div>
           <h1 className="text-4xl sm:text-[54px] font-black text-slate-900 tracking-tight pt-2">
             소설공장 스튜디오
           </h1>
           <p className="text-[17px] text-slate-500 max-w-2xl mx-auto font-medium leading-[1.7] mt-5">
             외부 툴이나 워드프로세서에서 작성된 웹소설 원고를 정리하고 안전하게 클라우드에 보관하며, 글자 수와 회차 순서를 유연하게 편집/관리하는 에디터 공간입니다.
           </p>
        </div>

        {episodes.length > 0 && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 flex items-center justify-between shadow-sm max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 mb-0.5">현재 나의 집필 진척도</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-slate-800">{episodes.length}화</span>
                  <span className="text-slate-400 font-medium pb-1">/</span>
                  <span className="text-xl font-bold text-slate-700">{totalCharacters.toLocaleString()}자</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('workspace')}
              className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors"
            >
              이어서 집필하기
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          <div 
            onClick={() => onNavigate('bible')} 
            role="button"
            tabIndex={0}
            className="flex flex-col items-start justify-start w-full h-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 text-left group cursor-pointer"
          >
            <div className="w-14 h-14 shrink-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
              <Book className="w-7 h-7" />
            </div>
            <h3 className="text-[22px] font-bold text-slate-900 mb-3 tracking-tight w-full">설정 공장</h3>
            <p className="text-[14.5px] text-slate-600 leading-[1.6] font-medium w-full">장편 연재를 지탱하는 뼈대 구축 단계입니다. 카테고리별 세계관, 캐릭터 등 설정 바이블을 작성합니다.</p>
          </div>

          <div 
            onClick={() => onNavigate('workspace')} 
            role="button"
            tabIndex={0}
            className="flex flex-col items-start justify-start w-full h-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 text-left group cursor-pointer"
          >
            <div className="w-14 h-14 shrink-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
              <PenTool className="w-7 h-7" />
            </div>
            <h3 className="text-[22px] font-bold text-slate-900 mb-3 tracking-tight w-full">회차 보관함</h3>
            <p className="text-[14.5px] text-slate-600 leading-[1.6] font-medium w-full">원고 본문을 붙여넣어 영구적으로 보존하고 자유롭게 수정하세요. 회차 순서 재배열과 글자 수 계산을 지원합니다.</p>
          </div>

          <div 
            onClick={() => onNavigate('tools')} 
            role="button"
            tabIndex={0}
            className="flex flex-col items-start justify-start w-full h-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 text-left group cursor-pointer"
          >
            <div className="w-14 h-14 shrink-0 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-100 transition-all duration-300">
              <Settings className="w-7 h-7" />
            </div>
            <h3 className="text-[22px] font-bold text-slate-900 mb-3 tracking-tight w-full">데이터 관리</h3>
            <p className="text-[14.5px] text-slate-600 leading-[1.6] font-medium w-full">백업 본문을 JSON으로 내려받거나, 전체 설정과 원고를 열람하기 편안하게 TXT 파일로 변환하여 내보냅니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
