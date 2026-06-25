import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PenTool, CheckCircle2, ListFilter, Trash2, Edit3, Save, X, Plus, ChevronUp, ChevronDown, ChevronRight, FileText, Search, Replace, BookOpen, Sparkles, Copy, Wand2, Maximize2, Minimize2, MoreVertical, LayoutPanelLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface WorkspaceProps {
  bible: BibleState;
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
}

export function Workspace({ bible, episodes, setEpisodes }: WorkspaceProps) {
  const { user } = useAuth();
  
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>('new');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'revision' | 'completed'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickBible, setShowQuickBible] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(16);

  // Search & Replace State
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchTarget, setSearchTarget] = useState('');
  const [replaceValue, setReplaceValue] = useState('');

  const nextEpisodeNum = episodes.length + 1;

  const [formState, setFormState] = useState({
    direction: '',
    content: '',
    summary: '',
    authorNote: '',
    status: 'draft' as 'draft' | 'revision' | 'completed'
  });

  // Switch active episode
  useEffect(() => {
    if (activeEpisodeId === 'new') {
      setFormState({
        direction: '',
        content: '',
        summary: '',
        authorNote: '',
        status: 'draft'
      });
    } else if (activeEpisodeId) {
      const ep = episodes.find(e => e.id === activeEpisodeId);
      if (ep) {
        setFormState({
          direction: ep.direction || '',
          content: ep.content || '',
          summary: ep.summary || '',
          authorNote: ep.authorNote || '',
          status: ep.status || 'draft'
        });
      }
    }
  }, [activeEpisodeId, episodes]);

  const cleanAIText = (text: string) => {
    if (!text) return '';
    let cleaned = text;
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/^#+\s+/gm, '');
    cleaned = cleaned.replace(/^>\s+/gm, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
    return cleaned;
  };

  const handleSave = () => {
    if (!formState.content.trim()) {
      alert('본문 내용을 입력해주세요.');
      return;
    }

    if (activeEpisodeId === 'new') {
      const newEpisode: Episode = {
        id: `ep-${Date.now()}`,
        number: nextEpisodeNum,
        direction: formState.direction.trim() || `제 ${nextEpisodeNum}화`,
        content: formState.content,
        summary: formState.summary.trim() || '요약이 없습니다.',
        authorNote: formState.authorNote.trim(),
        status: formState.status
      };
      setEpisodes(prev => [...prev, newEpisode]);
      setActiveEpisodeId(newEpisode.id);
    } else {
      setEpisodes(prev => prev.map(ep => 
        ep.id === activeEpisodeId ? { 
          ...ep, 
          direction: formState.direction.trim() || `제 ${ep.number}화`,
          content: formState.content,
          summary: formState.summary.trim(),
          authorNote: formState.authorNote.trim(),
          status: formState.status
        } : ep
      ));
      alert('저장되었습니다.');
    }
  };

  const deleteEpisode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 회차를 삭제하시겠습니까? 삭제 후 회차 번호가 자동으로 재정렬됩니다.')) {
      setEpisodes(prev => {
        const filtered = prev.filter(ep => ep.id !== id);
        return filtered.map((ep, idx) => ({ ...ep, number: idx + 1 }));
      });
      if (activeEpisodeId === id) {
        setActiveEpisodeId('new');
      }
    }
  };

  const executeGlobalReplace = () => {
    if (!searchTarget) return;
    if (confirm(`모든 회차에서 "${searchTarget}"을(를) "${replaceValue}"(으)로 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      setEpisodes(prev => prev.map(ep => ({
        ...ep,
        content: ep.content.split(searchTarget).join(replaceValue),
        direction: ep.direction.split(searchTarget).join(replaceValue),
        summary: ep.summary.split(searchTarget).join(replaceValue),
      })));
      alert('일괄 치환이 완료되었습니다.');
      setShowSearchReplace(false);
      setSearchTarget('');
      setReplaceValue('');
    }
  };

  const moveEpisode = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === episodes.length - 1) return;

    setEpisodes(prev => {
      const newEps = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      // Swap elements
      const temp = newEps[index];
      newEps[index] = newEps[targetIndex];
      newEps[targetIndex] = temp;
      
      // Re-number
      return newEps.map((ep, idx) => ({ ...ep, number: idx + 1 }));
    });
  };

  const downloadEpisode = () => {
    const title = activeEpisodeId === 'new' ? `제${nextEpisodeNum}화` : `제${activeEpInfo?.number}화`;
    const fileName = `${title}_${formState.direction || '제목없음'}.txt`;
    const content = `${title} ${formState.direction}\n\n${formState.content}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredEpisodes = useMemo(() => episodes.filter(ep => {
    const matchesSearch = searchTerm === '' || 
      ep.direction.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ep.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ep.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ep.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [episodes, searchTerm, statusFilter]);

  const totalCharacters = useMemo(() => episodes.reduce((acc, ep) => acc + ep.content.length, 0), [episodes]);
  const progressPercent = useMemo(() => Math.min(100, Math.round((totalCharacters / 150000) * 100)), [totalCharacters]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('본문이 복사되었습니다.');
  };

  const activeEpInfo = episodes.find(e => e.id === activeEpisodeId);

  const generatePrompt = (type: 'continue' | 'interactive' | 'build') => {
    const baseBible = `\n[현행 작품 설정 바이블]\n- 핵심/로그라인: ${bible.logline}\n- 스토리: ${bible.story}\n- 세계관/장소: ${bible.world}\n- 능력: ${bible.system}\n- 아이템/유물: ${bible.item}\n- 캐릭터: ${bible.character}\n- 빌런: ${bible.villain}\n- 연표/타임라인: ${bible.timeline}\n- 집필지침: ${bible.structure}\n- 에피소드: ${bible.episode}\n`;
    
    let prompt = '';
    if (type === 'continue') {
      prompt = `아래의 '설정 바이블'과 제공하는 '최근 원고'를 기반으로, 다음 장면을 [소설 창작 및 이어 쓰기 모드]로 이어서 작성해줘.\n${baseBible}\n[최근 원고 내용]\n(여기에 최근 원고를 붙여넣으세요)\n\n<지시사항>\n1. 가독성을 위해 문장은 짧고 간결하게 쓰며, 2~3문장마다 줄바꿈할 것.\n2. 대사와 묘사를 균형 있게 배치하고, 사건 중심으로 전개할 것.`;
    } else if (type === 'interactive') {
      prompt = `아래의 '설정 바이블'에 명시된 세계관과 캐릭터를 바탕으로, 나를 주인공으로 한 [인터랙티브 선택지 게임 모드]를 진행해줘.\n${baseBible}\n\n<지시사항>\n1. 나(주인공)의 시점인 2인칭(~당신은, ~너는)으로 묘사할 것.\n2. 현재 상황 묘사 직후, 항상 마지막엔 3가지의 명확한 행동 선택지를 제공해 줄 것.`;
    } else if (type === 'build') {
      prompt = `아래는 내가 구상 중인 웹소설의 초기 아이디어 및 단편적 설정 구조물(바이블)이야.\n${baseBible}\n\n이 내용을 바탕으로 [소설 설정 및 시놉시스 빌딩 모드]를 수행하여, 아래 포맷에 맞춰 대중적이고 트렌디한 웹소설 기획안으로 확장/보완해줘.\n\n<출력 포맷>\n- 제목 추천 (3개)\n- 로그라인\n- 매력 포인트 (2개)\n- 주요 등장인물 요약\n- 초반 전개 방향`;
    }

    navigator.clipboard.writeText(prompt);
    alert('AI 프롬프트가 클립보드에 복사되었습니다! 외부 AI 툴(ChatGPT, Claude, Gemini 등)에 붙여넣기 하세요.');
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-white overflow-hidden">
      
      {/* Header */}
      <header className="h-[72px] shrink-0 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">회차 보관함</h1>
          <p className="text-sm text-slate-500">원고를 체계적으로 관리하고 편집하세요.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-4 hidden md:flex">
            <span className="text-[11px] font-bold text-slate-500 mb-1">유료화 목표 (15만자) 달성률 {progressPercent}%</span>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <Button variant="outline" size="sm" onClick={() => generatePrompt('continue')} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" title="다음 화 이어쓰기 프롬프트 복사">
               <Sparkles className="w-4 h-4 mr-1.5" /> 이어쓰기 AI
            </Button>
            <Button variant="outline" size="sm" onClick={() => generatePrompt('interactive')} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" title="인터랙티브 소설 게임 프롬프트 복사">
               <Sparkles className="w-4 h-4 mr-1.5" /> 소설 게임 AI
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className={`border-indigo-200 ${showSearchReplace ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
            onClick={() => setShowSearchReplace(!showSearchReplace)}
          >
            <Replace className="w-4 h-4 mr-1.5" /> 전체 단어 치환
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`border-indigo-200 ${showQuickBible ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
            onClick={() => setShowQuickBible(!showQuickBible)}
          >
            <BookOpen className="w-4 h-4 mr-1.5" /> 설정집 퀵뷰
          </Button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Episode List */}
        <div className={`w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 transition-transform ${isFullscreen ? 'hidden' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <Button 
              onClick={() => setActiveEpisodeId('new')}
              className={`w-full py-5 text-[15px] shadow-sm font-bold flex items-center justify-center gap-2 ${activeEpisodeId === 'new' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              <PenTool className="w-4 h-4" /> 제 {nextEpisodeNum} 화 새로 쓰기
            </Button>
            
            <div className="mt-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="회차 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            
            <div className="flex gap-1 mt-3 overflow-x-auto pb-1 custom-scrollbar">
              {['all', 'draft', 'revision', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-colors ${
                    statusFilter === status 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {status === 'all' ? '전체' : status === 'draft' ? '초고' : status === 'revision' ? '수정중' : '완성'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 custom-scrollbar">
            {filteredEpisodes.length === 0 ? (
              <p className="text-center text-sm text-slate-400 mt-10">내용이 없습니다.</p>
            ) : (
              filteredEpisodes.map((ep) => (
                <div 
                  key={ep.id}
                  onClick={() => setActiveEpisodeId(ep.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all text-left group ${
                    activeEpisodeId === ep.id 
                    ? 'border-indigo-300 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500/20' 
                    : 'border-transparent hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className={`text-[15px] font-bold ${activeEpisodeId === ep.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {ep.number}화
                    </span>
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                         ep.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                         ep.status === 'revision' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                         'bg-slate-50 text-slate-600 border-slate-200'
                       }`}>
                         {ep.status === 'completed' ? '완성' : ep.status === 'revision' ? '수정' : '초고'}
                       </span>
                       <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => moveEpisode(filteredEpisodes.findIndex(e => e.id === ep.id), 'up', e)} className="text-slate-300 hover:text-indigo-500 p-0.5">
                           <ChevronUp className="w-3.5 h-3.5" />
                         </button>
                         <button onClick={(e) => moveEpisode(filteredEpisodes.findIndex(e => e.id === ep.id), 'down', e)} className="text-slate-300 hover:text-indigo-500 p-0.5">
                           <ChevronDown className="w-3.5 h-3.5" />
                         </button>
                         <button onClick={(e) => deleteEpisode(ep.id, e)} className="text-slate-300 hover:text-red-500 ml-1 p-0.5">
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       </div>
                    </div>
                  </div>
                  <h4 className="text-[13px] font-medium text-slate-600 truncate">{ep.direction || '제목 없음'}</h4>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center">
                    <FileText className="w-3 h-3 mr-1" /> {ep.content.length.toLocaleString()}자
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Editor Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* Find/Replace Top Banner */}
          {showSearchReplace && (
            <div className="bg-indigo-50 border-b border-indigo-100 p-4 shrink-0 flex items-center gap-3 w-full animate-in slide-in-from-top-2">
              <Replace className="w-5 h-5 text-indigo-500 hidden sm:block" />
              <input type="text" placeholder="기존 단어" className="h-9 px-3 text-sm rounded bg-white border border-indigo-200 focus:ring-1 focus:ring-indigo-500 outline-none flex-1 max-w-[200px]" value={searchTarget} onChange={e => setSearchTarget(e.target.value)} />
              <span className="text-indigo-300"><ChevronRight className="w-4 h-4"/></span>
              <input type="text" placeholder="새 단어" className="h-9 px-3 text-sm rounded bg-white border border-indigo-200 focus:ring-1 focus:ring-indigo-500 outline-none flex-1 max-w-[200px]" value={replaceValue} onChange={e => setReplaceValue(e.target.value)} />
              <Button size="sm" onClick={executeGlobalReplace} disabled={!searchTarget} className="bg-indigo-600 text-white hover:bg-indigo-700 h-9 shrink-0">일괄 변경 실행</Button>
              <div className="flex-1" />
              <button onClick={() => setShowSearchReplace(false)} className="text-indigo-400 hover:text-indigo-700"><X className="w-5 h-5" /></button>
            </div>
          )}

          {/* Tools Area */}
          <div className="border-b border-slate-100 px-8 py-3 flex justify-between items-center bg-white shrink-0 shadow-[0_4px_20px_rgb(0,0,0,0.02)] z-10">
            <div className="flex items-center gap-3">
               <span className="text-sm font-bold text-slate-800">
                 {activeEpisodeId === 'new' ? `새 제 ${nextEpisodeNum} 화 기획 및 작성` : `제 ${activeEpInfo?.number} 화 편집 (저장됨)`}
               </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-md overflow-hidden h-8 mr-2">
                <button onClick={() => setEditorFontSize(f => Math.max(12, f - 2))} className="px-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold" title="글꼴 작게">A-</button>
                <div className="w-px h-4 bg-slate-200"></div>
                <button onClick={() => setEditorFontSize(f => Math.min(24, f + 2))} className="px-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-sm" title="글꼴 크게">A+</button>
              </div>
              <Button variant="outline" size="sm" onClick={downloadEpisode} className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 hidden sm:flex">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> TXT 다운로드
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(formState.content)} className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 hidden sm:flex">
                <Copy className="w-3.5 h-3.5 mr-1.5" /> 복사
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFormState(f => ({...f, content: cleanAIText(f.content)}))} className="h-8 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">
                <Wand2 className="w-3.5 h-3.5 mr-1.5" /> 텍스트 정제
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50" title="전체화면 집중 모드">
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" onClick={handleSave} className="h-8 bg-slate-900 text-white hover:bg-slate-800 shadow-sm ml-2">
                <Save className="w-4 h-4 mr-1.5" /> 저장하기
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full custom-scrollbar scroll-smooth">
            <div className={`mx-auto ${isFullscreen ? 'max-w-5xl px-12 py-10' : 'max-w-4xl px-8 py-8'} space-y-6 pb-32`}>
              
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[13px] font-bold text-slate-700 block">회차 제목 / 목표 메모</label>
                  <input 
                    type="text"
                    placeholder="(선택) 이 회차의 부제나 달성 목표를 적어보세요"
                    className="w-full text-lg font-bold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-colors"
                    value={formState.direction}
                    onChange={(e) => setFormState(f => ({...f, direction: e.target.value}))}
                  />
                </div>
                <div className="w-40 shrink-0 space-y-2 hidden sm:block">
                  <label className="text-[13px] font-bold text-slate-700 block">상태</label>
                  <select 
                    className="w-full text-sm font-medium border border-slate-200 rounded-xl py-3 px-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={formState.status}
                    onChange={(e) => setFormState(f => ({...f, status: e.target.value as any}))}
                  >
                    <option value="draft">초고</option>
                    <option value="revision">수정중</option>
                    <option value="completed">완성</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-slate-700 block">본문 원고</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-32 hidden sm:flex" title="목표 글자수 (5500자)">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${formState.content.length >= 5500 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(100, (formState.content.length / 5500) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                      {formState.content.length.toLocaleString()} 자 (<span className="opacity-70">공백제외 </span>{formState.content.replace(/\s/g, '').length.toLocaleString()} 자)
                    </span>
                  </div>
                </div>
                <Textarea 
                  className={`${isFullscreen ? 'min-h-[600px]' : 'min-h-[500px] h-[500px]'} bg-slate-50 focus:bg-white border-slate-200 font-medium leading-[2] font-serif shadow-inner resize-y transition-colors`}
                  style={{ fontSize: `${editorFontSize}px` }}
                  value={formState.content}
                  onChange={(e) => setFormState(f => ({...f, content: e.target.value}))}
                  placeholder="당신의 빛나는 이야기를 시작해 보세요..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><ListFilter className="w-4 h-4 text-slate-400"/> 회차 요약</label>
                  <Textarea 
                    className="h-28 text-[13px] leading-relaxed bg-slate-50/80"
                    placeholder="나중 검색과 흐름 파악을 위해 핵심 사건을 요약해 두면 편리합니다."
                    value={formState.summary}
                    onChange={(e) => setFormState(f => ({...f, summary: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><PenTool className="w-4 h-4 text-indigo-400"/> 작가의 말 / 메모</label>
                  <Textarea 
                    className="h-28 text-[13px] leading-relaxed bg-indigo-50/30 border-indigo-100 focus:ring-indigo-500/30 focus:border-indigo-300"
                    placeholder="업로드 시 덧붙일 작가의 말이나, 개인적인 수정 아이디어를 기록합니다."
                    value={formState.authorNote}
                    onChange={(e) => setFormState(f => ({...f, authorNote: e.target.value}))}
                  />
                </div>
                
                {/* Mobile only status select */}
                <div className="sm:hidden space-y-2">
                  <label className="text-[13px] font-bold text-slate-700 block">초안 상태 기록</label>
                  <select 
                    className="w-full text-sm font-medium border border-slate-200 rounded-lg py-2.5 px-3 bg-slate-50"
                    value={formState.status}
                    onChange={(e) => setFormState(f => ({...f, status: e.target.value as any}))}
                  >
                    <option value="draft">초고</option>
                    <option value="revision">수정중</option>
                    <option value="completed">완성</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Bible Viewer Sidebar */}
        {showQuickBible && (
          <div className="w-80 shrink-0 bg-white border-l border-slate-200 overflow-y-auto custom-scrollbar flex flex-col items-stretch animate-in slide-in-from-right-4 duration-200 z-20 shadow-xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                설정집 퀵뷰
              </h3>
              <button onClick={() => setShowQuickBible(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {[
                { title: '핵심/로그라인', content: bible.logline },
                { title: '스토리', content: bible.story },
                { title: '세계관/장소', content: bible.world },
                { title: '능력', content: bible.system },
                { title: '아이템/유물', content: bible.item },
                { title: '캐릭터', content: bible.character },
                { title: '빌런', content: bible.villain },
                { title: '연표/타임라인', content: bible.timeline },
                { title: '집필지침', content: bible.structure },
                { title: '에피소드', content: bible.episode }
              ].map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{section.title}</h4>
                  {section.content ? (
                    <div className="text-[13px] text-slate-700 leading-relaxed font-medium bg-slate-50/80 rounded-xl p-3 border border-slate-100 whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ) : (
                    <p className="text-[13px] text-slate-400 italic px-1">설정이 없습니다.</p>
                  )}
                </div>
              ))}
              {(bible.customTabs || []).map((tab, idx) => (
                <div key={`c-${idx}`} className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{tab.label}</h4>
                  {tab.content ? (
                    <div className="text-[13px] text-slate-700 leading-relaxed font-medium bg-slate-50/80 rounded-xl p-3 border border-slate-100 whitespace-pre-wrap">
                      {tab.content}
                    </div>
                  ) : (
                    <p className="text-[13px] text-slate-400 italic px-1">설정이 없습니다.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
