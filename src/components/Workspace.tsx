import React, { useState, useEffect, useRef } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, PenTool, CheckCircle2, ChevronDown, ListFilter, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkspaceProps {
  bible: BibleState;
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
}

export function Workspace({ bible, episodes, setEpisodes }: WorkspaceProps) {
  const [userDirection, setUserDirection] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [writing, setWriting] = useState(false);
  const nextEpisodeNum = episodes.length + 1;
  
  const endRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new episodes are added
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [episodes]);

  const getPastSummary = () => {
    if (episodes.length === 0) return '';
    return episodes.map(ep => `[${ep.number}화] ${ep.summary}`).join('\n');
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bible,
          pastSummary: getPastSummary(),
          episodeNumber: nextEpisodeNum
        })
      });
      if (!res.ok) throw new Error('API 오류');
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      console.error(e);
      alert('제안을 불러오지 못했습니다.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleWrite = async () => {
    if (!userDirection.trim()) {
      alert('이번 화의 집필 방향을 입력해주세요.');
      return;
    }

    setWriting(true);
    try {
      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bible,
          pastSummary: getPastSummary(),
          episodeNumber: nextEpisodeNum,
          userDirection
        })
      });
      if (!res.ok) throw new Error('API 오류');
      const data = await res.json();
      
      const newEpisode: Episode = {
        id: `ep-${Date.now()}`,
        number: nextEpisodeNum,
        direction: userDirection,
        content: data.content,
        summary: data.summary
      };

      setEpisodes(prev => [...prev, newEpisode]);
      setUserDirection('');
      setSuggestions([]);
    } catch (e) {
      console.error(e);
      alert('집필 중 오류가 발생했습니다.');
    } finally {
      setWriting(false);
    }
  };

  const clearHistory = () => {
    if (confirm('모든 회차 기록을 초기화하시겠습니까?')) {
      setEpisodes([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
      
      {/* Header */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">연재 워크스페이스</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-inner">
            총 {episodes.length}화 작성됨
          </span>
          {episodes.length > 0 && (
            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-2" /> 기록 초기화
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-12 pb-32">
          
          {/* Previous Episodes */}
          {episodes.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-sm">
                <PenTool className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">아직 작성된 회차가 없습니다</h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                좌측 패널에서 작품 설정집(바이블)을 상세하게 작성한 후, 하단에 1화의 집필 방향을 입력하고 연재를 시작해보세요.
              </p>
            </div>
          ) : (
            episodes.map(ep => (
              <div key={ep.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-800">제 {ep.number} 화</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>저장됨</span>
                  </div>
                </div>
                
                {/* User Direction */}
                <div className="px-8 py-4 bg-indigo-50/50 border-b border-slate-100 border-l-4 border-l-indigo-400">
                  <p className="text-xs font-bold text-indigo-800 tracking-wide mb-1 uppercase">이 회차의 집필 지시사항</p>
                  <p className="text-slate-700 text-sm font-medium leading-relaxed">{ep.direction}</p>
                </div>

                {/* Content */}
                <div className="p-8 pb-10">
                  <div className="prose prose-slate max-w-none prose-p:leading-[2.2] prose-p:text-[17px] prose-p:text-slate-700 whitespace-pre-wrap font-serif">
                    {ep.content}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-start gap-4">
                  <ListFilter className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-500 mb-1 block">이 회차 요약 (다음 화 AI 컨텍스트용)</span>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{ep.summary}</p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* New Episode prompt form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden relative">
            <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shadow-sm">
              <h3 className="font-bold text-lg text-white">제 {nextEpisodeNum} 화 집필하기</h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">AI가 추천하는 집필 방향을 받아보실래요?</h4>
                  <p className="text-sm text-slate-500 pb-2">작성하신 설정과 이전 화 요약을 분석해 플롯 아이디어를 제안합니다.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleGetSuggestions} 
                  disabled={loadingSuggestions || writing}
                  className="bg-white hover:bg-slate-50 border-slate-200"
                >
                  {loadingSuggestions ? 'AI 제안 작성 중...' : <><Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> AI 방향 제안받기</>}
                </Button>
              </div>

              {/* Suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 gap-3"
                  >
                    {suggestions.map((sug, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setUserDirection((prev) => prev ? prev + '\n' + sug : sug)}
                        className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 text-sm text-slate-700 leading-relaxed cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors group"
                      >
                        <div className="font-bold text-indigo-600 mb-1 flex items-center justify-between">
                          <span>아이디어 {idx + 1}</span>
                          <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">클릭하여 입력창에 추가</span>
                        </div>
                        {sug}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-800">
                  집필 지시사항 직접 입력
                </label>
                <Textarea 
                  placeholder={`제 ${nextEpisodeNum}화에서 어떤 사건이 일어나나요? 누구의 시점에서 진행되며 어떤 분위기인지 자세히 적어주세요.\n(예: 주인공이 뒷골목에서 암살자들과 전투를 벌인다. 긴박한 액션 위주로 묘사해줘.)`}
                  className="h-32 bg-slate-50 border-slate-200 focus-visible:bg-white"
                  value={userDirection}
                  onChange={(e) => setUserDirection(e.target.value)}
                  disabled={writing}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleWrite} 
                  disabled={writing || !userDirection.trim()}
                  className="w-full sm:w-auto text-[15px] px-8 py-6 h-auto"
                >
                  {writing ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"/> 열혈 집필 중...</>
                  ) : (
                    <>제 {nextEpisodeNum}회 생성하기</>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
