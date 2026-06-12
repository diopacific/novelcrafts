import React, { useState, useEffect, useRef } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, PenTool, CheckCircle2, ListFilter, Trash2, Edit3, Save, X, Layers, Play, Check, ChevronDown, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkspaceProps {
  bible: BibleState;
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
}

interface DraftScene {
  id: string;
  title: string;
  plot: string;
  emotion: string;
  content: string;
  status: 'idle' | 'generating' | 'done';
  validationScore?: number;
  validationFeedback?: string;
}

export function Workspace({ bible, episodes, setEpisodes }: WorkspaceProps) {
  const [userDirection, setUserDirection] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [composing, setComposing] = useState(false);
  const [episodeGoal, setEpisodeGoal] = useState('');
  const [draftScenes, setDraftScenes] = useState<DraftScene[] | null>(null);
  const nextEpisodeNum = episodes.length + 1;
  
  const endRef = useRef<HTMLDivElement>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editSummary, setEditSummary] = useState('');

  // Scroll to bottom when new episodes are added
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [episodes.length]);

  const getPastSummary = () => {
    if (episodes.length === 0) return '';
    // 토큰 관리를 위해 최근 5개의 핵심 요약만 슬라이딩 윈도우 방식으로 제공 + 최근 회차 강조
    const recentEpisodes = episodes.slice(-5);
    return recentEpisodes.map((ep, index) => {
      const isLast = index === recentEpisodes.length - 1;
      return `[제 ${ep.number}화] ${ep.summary} ${isLast ? '(가장 최근 상황)' : ''}`;
    }).join('\n');
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

  const handlePlanScenes = async () => {
    if (!userDirection.trim()) {
      alert('이번 화의 전체 방항을 입력해주세요.');
      return;
    }

    setPlanning(true);
    try {
      const res = await fetch('/api/plan-scenes', {
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
      
      const mappedScenes: DraftScene[] = data.scenes.map((s: any, idx: number) => ({
        id: `draft-${idx}`,
        title: s.title,
        plot: s.plot,
        emotion: s.emotion || '',
        content: '',
        status: 'idle'
      }));
      setDraftScenes(mappedScenes);
      if (data.episodeGoal) {
        setEpisodeGoal(data.episodeGoal);
      }
    } catch (e) {
      console.error(e);
      alert('플롯 기획 중 오류가 발생했습니다.');
    } finally {
      setPlanning(false);
    }
  };

  const handleWriteScene = async (sceneId: string) => {
    if (!draftScenes) return;

    setDraftScenes(prev => prev!.map(s => s.id === sceneId ? { ...s, status: 'generating' } : s));
    
    try {
      const currentIdx = draftScenes.findIndex(s => s.id === sceneId);
      const targetScene = draftScenes[currentIdx];
      
      const previousScenesContent = draftScenes
        .slice(0, currentIdx)
        .filter(s => s.content)
        .map(s => `[${s.title}]\n${s.content}`)
        .join('\n\n');

      const res = await fetch('/api/write-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bible,
          pastSummary: getPastSummary(),
          episodeNumber: nextEpisodeNum,
          sceneTitle: targetScene.title,
          scenePlot: targetScene.plot,
          sceneEmotion: targetScene.emotion,
          previousScenesContent
        })
      });
      if (!res.ok) throw new Error('API 오류');
      const data = await res.json();
      
      setDraftScenes(prev => prev!.map(s => s.id === sceneId ? { 
        ...s, 
        content: data.content, 
        status: 'done',
        validationScore: data.validationScore,
        validationFeedback: data.validationFeedback 
      } : s));
    } catch (e) {
      console.error(e);
      alert('장면 집필 중 오류가 발생했습니다.');
      setDraftScenes(prev => prev!.map(s => s.id === sceneId ? { ...s, status: 'idle' } : s));
    }
  };

  const handleComposeEpisode = async () => {
    if (!draftScenes) return;
    
    // Convert drafts to string format for Composer
    const draftsPayload = draftScenes.map(s => 
      `--- [${s.title}] ---\n<플롯>\n${s.plot}\n\n<감정선>\n${s.emotion}\n\n<본문 초안>\n${s.content}`
    ).join('\n\n');
    
    setComposing(true);
    try {
      const res = await fetch('/api/compose-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeNumber: nextEpisodeNum,
          fullContent: draftsPayload
        })
      });
      if (!res.ok) throw new Error('API 컴포징 오류');
      const data = await res.json();
      
      const newEpisode: Episode = {
        id: `ep-${Date.now()}`,
        number: nextEpisodeNum,
        direction: userDirection,
        content: data.finalContent || '본문 생성에 실패했습니다.',
        summary: data.summary || '요약 생성에 실패했습니다.'
      };

      setEpisodes(prev => [...prev, newEpisode]);
      setUserDirection('');
      setSuggestions([]);
      setDraftScenes(null);
      setEpisodeGoal('');
    } catch (e) {
      console.error(e);
      alert('에피소드 완성 중 오류가 발생했습니다.');
    } finally {
      setComposing(false);
    }
  };

  const startEdit = (ep: Episode) => {
    setEditingId(ep.id);
    setEditContent(ep.content);
    setEditSummary(ep.summary);
  };

  const saveEdit = (id: string) => {
    setEpisodes(prev => prev.map(ep => 
      ep.id === id ? { ...ep, content: editContent, summary: editSummary } : ep
    ));
    setEditingId(null);
  };

  const deleteEpisode = (id: string) => {
    if (confirm('이 회차를 삭제하시겠습니까? 삭제 후 회차 번호가 자동으로 재정렬됩니다.')) {
      setEpisodes(prev => {
        const filtered = prev.filter(ep => ep.id !== id);
        return filtered.map((ep, idx) => ({ ...ep, number: idx + 1 }));
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
      
      {/* Header */}
      <header className="h-[72px] shrink-0 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">집필 공장</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
            총 {episodes.length}화 진행 중
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-12 pb-32">
          
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
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-lg text-slate-800">제 {ep.number} 화</h3>
                    {editingId !== ep.id && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium text-emerald-600">클라우드 저장됨</span>
                      </div>
                    )}
                  </div>
                  
                  {editingId === ep.id ? (
                     <div className="flex gap-2">
                       <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => setEditingId(null)}>
                         <X className="w-4 h-4 mr-1"/> 취소
                       </Button>
                       <Button variant="primary" size="sm" onClick={() => saveEdit(ep.id)}>
                         <Save className="w-4 h-4 mr-1"/> 저장
                       </Button>
                     </div>
                  ) : (
                    <div className="flex gap-2">
                       <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600" onClick={() => startEdit(ep)}>
                         <Edit3 className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500" onClick={() => deleteEpisode(ep.id)}>
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  )}
                </div>
                
                {/* User Direction (Read-only) */}
                <div className="px-8 py-3.5 bg-indigo-50/50 border-b border-slate-100 border-l-4 border-l-indigo-400 flex flex-col justify-center">
                  <p className="text-[11px] font-bold text-indigo-800 tracking-wider mb-1 uppercase opacity-80">이 회차의 집필 지시사항</p>
                  <p className="text-slate-700 text-[13px] font-medium leading-relaxed">{ep.direction}</p>
                </div>

                {/* Content */}
                <div className="p-8 pb-10">
                  {editingId === ep.id ? (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">본문 원고 수정</label>
                      <Textarea 
                        className="h-96 text-[15px] font-serif leading-relaxed"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none prose-p:leading-[2.2] prose-p:text-[17px] prose-p:text-slate-800 whitespace-pre-wrap font-serif">
                      {ep.content}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-start gap-4">
                  <ListFilter className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-[12px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">이 회차 요약 (다음 화 AI 컨텍스트 참고용)</span>
                    {editingId === ep.id ? (
                      <Textarea 
                        className="h-20 text-[13px]"
                        value={editSummary}
                        onChange={(e) => setEditSummary(e.target.value)}
                      />
                    ) : (
                      <p className="text-[14px] text-slate-600 leading-relaxed font-medium">{ep.summary}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* New Episode prompt form */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
            <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shadow-sm">
              <h3 className="font-bold text-lg text-white">제 {nextEpisodeNum} 화 집필하기</h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">AI가 추천하는 집필 방향을 받아보실래요?</h4>
                  <p className="text-[13px] text-slate-500 pb-2">작성하신 설정과 이전 화 요약을 분석해 플롯 아이디어를 제안합니다.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleGetSuggestions} 
                  disabled={loadingSuggestions || planning || !!draftScenes}
                  className="bg-white hover:bg-slate-50 border-slate-200"
                >
                  {loadingSuggestions ? 'AI 제안 생성 중...' : <><Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> AI 방향 제안받기</>}
                </Button>
              </div>

              {/* Suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && !draftScenes && (
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
                        className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 text-[14px] text-slate-700 leading-relaxed cursor-pointer hover:bg-indigo-100/50 hover:border-indigo-200 transition-all group shadow-sm"
                      >
                        <div className="font-bold text-indigo-600 mb-2 flex items-center justify-between">
                          <span>스토리 방향 아이디어 {idx + 1}</span>
                          <span className="text-[11px] font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-100 px-2 py-0.5 rounded">클릭하여 반영하기</span>
                        </div>
                        {sug}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-[14px] font-bold text-slate-800">
                  집필 지시사항 직접 입력
                </label>
                <Textarea 
                  placeholder={`제 ${nextEpisodeNum}화에서 어떤 사건이 일어나나요? 누구의 시점에서 진행되며 어떤 분위기인지 자세히 적어주세요.\n(예: 주인공이 뒷골목에서 암살자들과 전투를 벌인다. 긴박한 액션 위주로 묘사하고, 새로운 퇴마 스킬을 각성하는 장면을 포함해줘.)`}
                  className="h-32 bg-slate-50 border-slate-200 focus-visible:bg-white text-[14px]"
                  value={userDirection}
                  onChange={(e) => setUserDirection(e.target.value)}
                  disabled={planning || !!draftScenes}
                />
              </div>

              {!draftScenes ? (
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handlePlanScenes} 
                    disabled={planning || !userDirection.trim()}
                    className="w-full sm:w-auto text-[15px] px-8 py-6 h-auto shadow-md bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {planning ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"/> 파이프라인 엔진 가동 중...</>
                    ) : (
                      <><Layers className="w-5 h-5 mr-2" /> Stage 1~3: 에피소드 및 감정선 기획</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="pt-8 border-t border-indigo-100 mt-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-500" /> 세부 장면 단위 집필 (Scene Planner)
                      </h4>
                      <p className="text-[13px] text-slate-500 mt-1">각 장면의 플롯과 감정선을 확인하고 개별적으로 집필하여 안정적인 분량을 확보하세요.</p>
                      {episodeGoal && (
                        <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-800 text-sm font-medium">
                          🎯 이번 화 목표: {episodeGoal}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" className="text-slate-500 text-sm" onClick={() => setDraftScenes(null)}>
                      <X className="w-4 h-4 mr-1" /> 기획 취소
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {draftScenes.map((scene, index) => (
                      <div key={scene.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
                          <h5 className="font-bold text-[15px] text-indigo-700">{scene.title}</h5>
                          {scene.status === 'done' && <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"><Check className="w-3 h-3 mr-1" /> 검증 완료 ({scene.validationScore || 0}점)</span>}
                        </div>
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[12px] font-bold text-slate-500 uppercase">장면 플롯 (Stage 2)</label>
                              <Textarea 
                                className="h-24 text-[13px] bg-white border-slate-200 resize-none leading-relaxed"
                                value={scene.plot}
                                onChange={(e) => setDraftScenes(prev => prev!.map(s => s.id === scene.id ? { ...s, plot: e.target.value } : s))}
                                disabled={scene.status !== 'idle'}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[12px] font-bold text-slate-500 uppercase">감정선 흐름 (Stage 3)</label>
                              <Textarea 
                                className="h-24 text-[13px] bg-white border-slate-200 resize-none leading-relaxed"
                                value={scene.emotion}
                                onChange={(e) => setDraftScenes(prev => prev!.map(s => s.id === scene.id ? { ...s, emotion: e.target.value } : s))}
                                disabled={scene.status !== 'idle'}
                              />
                            </div>
                          </div>

                          {scene.status === 'done' && scene.content ? (
                            <div className="space-y-4 pt-2">
                              {scene.validationFeedback && (
                                <div className="text-sm bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-lg flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                  <p>{scene.validationFeedback}</p>
                                </div>
                              )}
                              <div className="space-y-2">
                                <label className="text-[12px] font-bold text-slate-500 uppercase flex items-center gap-1"><AlignLeft className="w-3.5 h-3.5"/> 작성된 본문 ({(scene.content.length).toLocaleString()}자)</label>
                                <Textarea 
                                  className="h-64 text-[14px] bg-white border-slate-200 font-serif leading-relaxed"
                                  value={scene.content}
                                  onChange={(e) => setDraftScenes(prev => prev!.map(s => s.id === scene.id ? { ...s, content: e.target.value } : s))}
                                />
                              </div>
                            </div>
                          ) : (
                             <div className="flex justify-end pt-2">
                                <Button 
                                  onClick={() => handleWriteScene(scene.id)} 
                                  disabled={scene.status === 'generating' || index > 0 && draftScenes[index - 1].status !== 'done'}
                                  variant="secondary"
                                  className="shadow-sm border-slate-200 bg-white hover:bg-slate-50 text-indigo-600"
                                >
                                  {scene.status === 'generating' ? (
                                    <><div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin mr-2"/> 작성 및 검증 중...</>
                                  ) : (
                                    <><Play className="w-4 h-4 mr-1.5" /> Stage 4~5: 장면 집필 및 검증</>
                                  )}
                                </Button>
                             </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 flex justify-end">
                    <Button 
                      onClick={handleComposeEpisode}
                      disabled={composing || draftScenes.some(s => s.status !== 'done')}
                      className="w-full sm:w-auto text-[15px] px-8 py-6 h-auto shadow-md bg-slate-800 hover:bg-slate-900 text-white"
                    >
                      {composing ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"/> 병합 및 호흡 조절 중...</>
                      ) : (
                        <><CheckCircle2 className="w-5 h-5 mr-2" /> Stage 6: 전체 회차 컴포징 (Composer 가동)</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}

