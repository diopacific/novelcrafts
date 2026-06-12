import React, { useState, useEffect, useRef } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PenTool, CheckCircle2, ListFilter, Trash2, Edit3, Save, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';

interface WorkspaceProps {
  bible: BibleState;
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
}

export function Workspace({ bible, episodes, setEpisodes }: WorkspaceProps) {
  const { user } = useAuth();
  
  // New episode form state
  const [newDirection, setNewDirection] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSummary, setNewSummary] = useState('');
  
  const nextEpisodeNum = episodes.length + 1;
  const endRef = useRef<HTMLDivElement>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDirection, setEditDirection] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSummary, setEditSummary] = useState('');

  // Scroll to bottom when new episodes are added
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [episodes.length]);

  const handleSaveNewEpisode = () => {
    if (!newContent.trim()) {
      alert('본문 내용을 입력해주세요.');
      return;
    }

    const newEpisode: Episode = {
      id: `ep-${Date.now()}`,
      number: nextEpisodeNum,
      direction: newDirection.trim() || `제 ${nextEpisodeNum}화`,
      content: newContent,
      summary: newSummary.trim() || '요약이 없습니다.'
    };

    setEpisodes(prev => [...prev, newEpisode]);
    setNewDirection('');
    setNewContent('');
    setNewSummary('');
  };

  const startEdit = (ep: Episode) => {
    setEditingId(ep.id);
    setEditDirection(ep.direction);
    setEditContent(ep.content);
    setEditSummary(ep.summary);
  };

  const saveEdit = (id: string) => {
    setEpisodes(prev => prev.map(ep => 
      ep.id === id ? { ...ep, direction: editDirection, content: editContent, summary: editSummary } : ep
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
          <p className="text-sm text-slate-500">다른 툴에서 집필한 원고를 보관하고 관리하세요.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
            총 {episodes.length}화 저장됨
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
              <h2 className="text-xl font-bold text-slate-700 mb-2">아직 저장된 회차가 없습니다</h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                외부 AI 툴이나 워드프로세서에서 작성하신 원고를 아래 폼에 입력해 영구적으로 보관하세요.
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
                       <Button variant="outline" size="sm" onClick={() => saveEdit(ep.id)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                         <Save className="w-4 h-4 mr-1"/> 변경사항 저장
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
                
                {/* User Direction / Title */}
                <div className="px-8 py-3.5 bg-indigo-50/50 border-b border-slate-100 border-l-4 border-l-indigo-400 flex flex-col justify-center">
                  <p className="text-[11px] font-bold text-indigo-800 tracking-wider mb-1 uppercase opacity-80">제목 또는 방향 메모</p>
                  {editingId === ep.id ? (
                    <input 
                      className="text-slate-700 text-[13px] font-medium leading-relaxed bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full"
                      value={editDirection}
                      onChange={(e) => setEditDirection(e.target.value)}
                    />
                  ) : (
                    <p className="text-slate-700 text-[13px] font-medium leading-relaxed">{ep.direction}</p>
                  )}
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
                    <span className="text-[12px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">이 회차 요약</span>
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

          {/* New Episode Input Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
            <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shadow-sm">
              <h3 className="font-bold text-lg text-white">제 {nextEpisodeNum} 화 업로드</h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-[14px] font-bold text-slate-800">
                  제목 또는 핵심 메모 (선택사항)
                </label>
                <input 
                  type="text"
                  placeholder="예: 주인공의 각성, 비밀 조직의 등장 등"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white text-[14px]"
                  value={newDirection}
                  onChange={(e) => setNewDirection(e.target.value)}
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-[14px] font-bold text-slate-800">
                  본문 원고
                </label>
                <Textarea 
                  placeholder={`외부에서 집필하신 본문 내용을 이곳에 붙여넣기 하세요.`}
                  className="h-64 bg-slate-50 border-slate-200 focus-visible:bg-white text-[15px] font-serif leading-relaxed"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-[14px] font-bold text-slate-800">
                  회차 요약 (선택사항)
                </label>
                <Textarea 
                  placeholder={`작성된 회차의 핵심 내용을 간략하게 요약해두면 나중에 참고하기 좋습니다.`}
                  className="h-24 bg-slate-50 border-slate-200 focus-visible:bg-white text-[13px] leading-relaxed"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button 
                  onClick={handleSaveNewEpisode} 
                  disabled={!newContent.trim()}
                  className="w-full sm:w-auto text-[15px] px-8 py-6 h-auto shadow-md bg-slate-800 hover:bg-slate-900 text-white"
                >
                  <Save className="w-5 h-5 mr-2" /> 새 회차 저장하기
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


