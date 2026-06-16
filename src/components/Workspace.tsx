import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PenTool, CheckCircle2, ListFilter, Trash2, Edit3, Save, X, Plus, ChevronUp, ChevronDown, ChevronRight, FileText, Search, Replace, BookOpen, Sparkles, Copy, Wand2, Maximize2, Minimize2 } from 'lucide-react';
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
  const [newAuthorNote, setNewAuthorNote] = useState('');
  const [newStatus, setNewStatus] = useState<'draft' | 'revision' | 'completed'>('draft');
  
  // Initial states
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'revision' | 'completed'>('all');
  
  // Fullscreen Editor State
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const nextEpisodeNum = episodes.length + 1;
  const endRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('본문이 클립보드에 복사되었습니다. 플랫폼에 붙여넣기 하세요!');
  };

  const [collapsedEpisodes, setCollapsedEpisodes] = useState<Set<string>>(new Set());
  
  const toggleCollapse = (id: string) => {
    setCollapsedEpisodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDirection, setEditDirection] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editAuthorNote, setEditAuthorNote] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'revision' | 'completed'>('draft');

  // Search & Replace State
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchTarget, setSearchTarget] = useState('');
  const [replaceValue, setReplaceValue] = useState('');

  // Quick Bible Viewer State
  const [showQuickBible, setShowQuickBible] = useState(false);

  // AI Prompt Generator State
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);

  const generatePrompt = (type: 'continue' | 'interactive' | 'build') => {
    const baseBible = `\n[현행 작품 설정 바이블]\n- 핵심/로그라인: ${bible.logline}\n- 스토리: ${bible.story}\n- 능력: ${bible.system}\n- 캐릭터: ${bible.character}\n- 빌런: ${bible.villain}\n- 집필지침: ${bible.structure}\n- 에피소드: ${bible.episode}\n`;
    
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
      summary: newSummary.trim() || '요약이 없습니다.',
      authorNote: newAuthorNote.trim(),
      status: newStatus
    };

    setEpisodes(prev => [...prev, newEpisode]);
    setNewDirection('');
    setNewContent('');
    setNewSummary('');
    setNewAuthorNote('');
    setNewStatus('draft');
    setIsFullscreen(false);
  };

  const startEdit = (ep: Episode) => {
    setEditingId(ep.id);
    setEditDirection(ep.direction);
    setEditContent(ep.content);
    setEditSummary(ep.summary);
    setEditAuthorNote(ep.authorNote || '');
    setEditStatus(ep.status || 'draft');
  };

  const saveEdit = (id: string) => {
    setEpisodes(prev => prev.map(ep => 
      ep.id === id ? { 
        ...ep, 
        direction: editDirection, 
        content: editContent, 
        summary: editSummary,
        authorNote: editAuthorNote,
        status: editStatus
      } : ep
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

  const moveEpisode = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === episodes.length - 1)) return;

    setEpisodes(prev => {
      const newEpisodes = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap
      const temp = newEpisodes[index];
      newEpisodes[index] = newEpisodes[targetIndex];
      newEpisodes[targetIndex] = temp;
      
      // Re-assign numbers
      return newEpisodes.map((ep, idx) => ({ ...ep, number: idx + 1 }));
    });
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

  const cleanAIText = (text: string) => {
    if (!text) return '';
    let cleaned = text;
    // Remove markdown bold and italics
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
    // Remove markdown headers
    cleaned = cleaned.replace(/^#+\s+/gm, '');
    // Remove markdown blockquotes
    cleaned = cleaned.replace(/^>\s+/gm, '');
    // Normalize excessive newlines (more than 2 to just 2)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    // Strip trailing spaces from lines
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
    return cleaned;
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
  const MILESTONE_TARGET = 150000;
  const progressPercent = useMemo(() => Math.min(100, Math.round((totalCharacters / MILESTONE_TARGET) * 100)), [totalCharacters]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
      
      {/* Header */}
      <header className="h-[72px] shrink-0 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">원고(회차) 보관함</h1>
          <p className="text-sm text-slate-500">다른 툴에서 집필한 원고를 보관하고 관리하세요.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[11px] font-bold text-slate-500 mb-1">유료화 목표 달성률 ({progressPercent}%)</span>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="회차 검색 (내용, 제목)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className={`border-emerald-200 ${showPromptGenerator ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'}`}
            onClick={() => setShowPromptGenerator(!showPromptGenerator)}
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-emerald-500" />
            AI 프롬프트 생성기
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`border-indigo-200 ${showSearchReplace ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
            onClick={() => setShowSearchReplace(!showSearchReplace)}
          >
            <Search className="w-4 h-4 mr-1.5" />
            단어 일괄 치환
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`border-indigo-200 ${showQuickBible ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
            onClick={() => setShowQuickBible(!showQuickBible)}
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            설정집 퀵뷰어
          </Button>
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
            총 {episodes.length}화 저장됨
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-32">

            {/* Sub Header for filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit">
                {(['all', 'draft', 'revision', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                      statusFilter === status 
                        ? (status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                           status === 'revision' ? 'bg-amber-100 text-amber-800' :
                           status === 'draft' ? 'bg-slate-200 text-slate-800' :
                           'bg-indigo-100 text-indigo-800')
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'all' ? '전체 회차' : 
                     status === 'draft' ? '초고' : 
                     status === 'revision' ? '수정중' : '완성'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* AI Prompt Banner */}
            {showPromptGenerator && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden mb-6 flex flex-col p-6 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-emerald-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
                    외부 AI 연동 프롬프트 생성 (클립보드 복사)
                  </h3>
                  <button onClick={() => setShowPromptGenerator(false)} className="text-emerald-400 hover:text-emerald-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-emerald-700/80 mb-5 font-medium leading-relaxed">
                  현재 '설정 공장'에 저장된 [스토리, 능력, 캐릭터, 빌런, 집필지침] 정보를 모두 포함하여,<br/>내가 원하는 AI 모델(ChatGPT, Claude 등)에게 완벽하게 지시할 수 있는 최적의 프롬프트를 복사합니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => generatePrompt('continue')}
                    className="h-12 bg-white border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-800 font-bold shadow-sm flex flex-col items-center justify-center pt-1"
                  >
                    <span><Copy className="w-3.5 h-3.5 inline mr-1.5 mb-0.5 opacity-70" /> 1. 소설 이어쓰기 복사</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => generatePrompt('interactive')}
                    className="h-12 bg-white border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-800 font-bold shadow-sm flex flex-col items-center justify-center pt-1"
                  >
                    <span><Copy className="w-3.5 h-3.5 inline mr-1.5 mb-0.5 opacity-70" /> 2. 선택지 게임 복사</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => generatePrompt('build')}
                    className="h-12 bg-white border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-800 font-bold shadow-sm flex flex-col items-center justify-center pt-1"
                  >
                    <span><Copy className="w-3.5 h-3.5 inline mr-1.5 mb-0.5 opacity-70" /> 3. 설정집 제작 복사</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Find/Replace Banner */}
            {showSearchReplace && (
              <div className="bg-white rounded-2xl border border-indigo-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden mb-6 flex flex-col p-6 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-indigo-900 flex items-center">
                    <Replace className="w-5 h-5 mr-2 text-indigo-600" />
                    전체 원고 단어 일괄 치환
                  </h3>
                  <button onClick={() => setShowSearchReplace(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-5">
                  입력하신 단어를 모든 저장된 회차(본문, 제목, 요약 등)에서 찾아 다른 단어로 한 번에 변경합니다. 예를 들어 주인공의 이름을 한 번에 바꿀 때 유용합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="찾을 단어 (예: 철수)" 
                    className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium"
                    value={searchTarget}
                    onChange={e => setSearchTarget(e.target.value)}
                  />
                  <div className="hidden sm:flex items-center justify-center text-slate-300">
                    <Replace className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="바꿀 단어 (예: 도민준)" 
                    className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium"
                    value={replaceValue}
                    onChange={e => setReplaceValue(e.target.value)}
                  />
                  <Button 
                    onClick={executeGlobalReplace} 
                    disabled={!searchTarget}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  >
                    일괄 변경 실행
                  </Button>
                </div>
              </div>
            )}
          
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
          ) : filteredEpisodes.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-sm">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">검색 결과가 없습니다</h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                다른 검색어를 입력해 보세요.
              </p>
            </div>
          ) : (
            filteredEpisodes.map((ep, index) => (
              <div key={ep.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center">
                      <button 
                        onClick={() => toggleCollapse(ep.id)} 
                        className="mr-3 text-slate-400 hover:text-indigo-600 bg-slate-100/80 hover:bg-indigo-50 p-1 rounded-md transition-colors"
                        title={collapsedEpisodes.has(ep.id) ? "펼치기" : "접기"}
                      >
                        {collapsedEpisodes.has(ep.id) ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      제 {ep.number} 화
                      <span className="ml-4 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        {ep.content.length.toLocaleString()} 자
                      </span>
                      <span className={`ml-2 text-[11px] font-bold px-2 py-1 rounded-md border tracking-wide flex items-center ${
                        ep.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        ep.status === 'revision' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {ep.status === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : ep.status === 'revision' ? <Edit3 className="w-3 h-3 mr-1" /> : <PenTool className="w-3 h-3 mr-1" />}
                        {ep.status === 'completed' ? '완성' : ep.status === 'revision' ? '수정중' : '초고'}
                      </span>
                    </h3>
                    {editingId !== ep.id && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[13px] ml-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        클라우드 저장됨
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
                    <div className="flex items-center gap-2">
                       <div className="flex flex-col mr-2">
                         <button 
                           onClick={() => moveEpisode(index, 'up')}
                           disabled={index === 0}
                           className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400"
                           title="위로 이동"
                         >
                           <ChevronUp className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => moveEpisode(index, 'down')}
                           disabled={index === episodes.length - 1}
                           className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400"
                           title="아래로 이동"
                         >
                           <ChevronDown className="w-4 h-4" />
                         </button>
                       </div>
                       <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 mr-2" onClick={() => toggleCollapse(ep.id)} title="펼치기/접기">
                         {collapsedEpisodes.has(ep.id) ? <BookOpen className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                       </Button>
                       <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 bg-white border border-slate-200 mr-2" onClick={() => copyToClipboard(ep.content)} title="본문 복사하기">
                         <Copy className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200" onClick={() => { startEdit(ep); setCollapsedEpisodes(prev => { const n = new Set(prev); n.delete(ep.id); return n; }); }} title="회차 수정">
                         <Edit3 className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 bg-white border border-slate-200" onClick={() => deleteEpisode(ep.id)} title="단건 삭제">
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  )}
                </div>
                
                {/* Content Area - Conditionally rendered based on collapse state */}
                {(!collapsedEpisodes.has(ep.id) || editingId === ep.id) && (
                  <>
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
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-bold text-slate-700">본문 원고 수정</label>
                          <span className="text-[12px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            공백포함 <span className="font-bold text-slate-700">{editContent.length}</span>자 <span className="text-slate-300 mx-1">|</span> 공백제외 <span className="font-bold text-slate-700">{editContent.replace(/\s/g, '').length}</span>자
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditContent(cleanAIText(editContent))}
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 text-xs px-3"
                          disabled={!editContent}
                        >
                          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                          AI 텍스트 정제
                        </Button>
                      </div>
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

                {/* Summary & Author Note */}
                <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
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

                  <div className="flex items-start gap-4">
                    <PenTool className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-bold text-indigo-600 block uppercase tracking-wide">작가의 말 / 메모</span>
                      </div>
                      {editingId === ep.id ? (
                        <div className="space-y-3">
                          <Textarea 
                            className="h-20 text-[13px] bg-white border-indigo-100 focus-visible:ring-indigo-500"
                            placeholder="이 회차에 대한 메모나 작가의 말을 남겨주세요."
                            value={editAuthorNote}
                            onChange={(e) => setEditAuthorNote(e.target.value)}
                          />
                          <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-lg">
                            <span className="text-[13px] font-bold text-slate-700">현재 상태:</span>
                            <select 
                              className="text-[13px] font-medium border border-slate-200 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as 'draft' | 'revision' | 'completed')}
                            >
                              <option value="draft">초고</option>
                              <option value="revision">수정중</option>
                              <option value="completed">완성</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        ep.authorNote ? (
                          <p className="text-[13px] text-indigo-900/80 leading-relaxed font-medium bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">{ep.authorNote}</p>
                        ) : (
                          <p className="text-[13px] text-slate-400 italic">메모 없음</p>
                        )
                      )}
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            ))
          )}

          {/* New Episode Input Form */}
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-[#f8fafc] flex flex-col' : 'bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative'}`}>
            <div className={`px-8 py-5 flex items-center justify-between shadow-sm shrink-0 ${isFullscreen ? 'bg-white border-b border-slate-200' : 'bg-slate-900 border-b-0'}`}>
              <h3 className={`font-bold text-lg ${isFullscreen ? 'text-slate-800' : 'text-white'}`}>제 {nextEpisodeNum} 화 업로드</h3>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className={`flex items-center justify-center p-2 rounded-lg transition-colors ${isFullscreen ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                title={isFullscreen ? "전체화면 종료" : "전체화면 (집중 모드)"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
            
            <div className={`p-8 space-y-6 ${isFullscreen ? 'flex-1 overflow-y-auto px-16 max-w-5xl mx-auto w-full' : ''}`}>
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
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <label className="block text-[14px] font-bold text-slate-800">
                      본문 원고
                    </label>
                    <span className="text-[12px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      공백포함 <span className="font-bold text-slate-700">{newContent.length}</span>자 <span className="text-slate-300 mx-1">|</span> 공백제외 <span className="font-bold text-slate-700">{newContent.replace(/\s/g, '').length}</span>자
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setNewContent(cleanAIText(newContent))}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 text-xs px-3"
                    disabled={!newContent}
                  >
                    <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                    AI 텍스트 정제 (마크다운/공백 제거)
                  </Button>
                </div>
                <Textarea 
                  placeholder={`외부에서 집필하신 본문 내용을 이곳에 붙여넣기 하세요.`}
                  className={`${isFullscreen ? 'min-h-[500px] h-full' : 'h-80'} bg-slate-50 border-slate-200 focus-visible:bg-white text-[16px] font-serif leading-relaxed ${isFullscreen ? 'shadow-inner' : ''}`}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <label className="block text-[14px] font-bold text-slate-800">
                    작가의 말 / 메모 (선택사항)
                  </label>
                  <Textarea 
                    placeholder="독자에게 남길 말, 혹은 나만 볼 창작 메모를 적어보세요."
                    className="h-24 bg-slate-50 border-slate-200 focus-visible:bg-white text-[13px] leading-relaxed"
                    value={newAuthorNote}
                    onChange={(e) => setNewAuthorNote(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-[14px] font-bold text-slate-800">
                    회차 초안 상태
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-24 flex items-center gap-4">
                    <select 
                      className="flex-1 text-[14px] font-medium border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as 'draft' | 'revision' | 'completed')}
                    >
                      <option value="draft">초고 (작성 중)</option>
                      <option value="revision">수정중 (퇴고 필요)</option>
                      <option value="completed">완성 (업로드 가능)</option>
                    </select>
                  </div>
                </div>
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

        {/* Quick Bible Viewer Sidebar */}
        {showQuickBible && (
          <div className="w-80 shrink-0 bg-white border-l border-slate-200 overflow-y-auto custom-scrollbar flex flex-col items-stretch animate-in slide-in-from-right-8 duration-300">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                설정집 퀵뷰
              </h3>
              <button onClick={() => setShowQuickBible(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {[
                { title: '핵심/로그라인', content: bible.logline },
                { title: '스토리', content: bible.story },
                { title: '능력', content: bible.system },
                { title: '캐릭터', content: bible.character },
                { title: '빌런', content: bible.villain },
                { title: '집필지침', content: bible.structure },
                { title: '에피소드', content: bible.episode }
              ].map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">{section.title}</h4>
                  {section.content ? (
                    <div className="text-[13px] text-slate-700 leading-relaxed font-medium bg-slate-50 rounded-xl p-3 border border-slate-100 whitespace-pre-wrap">
                      {section.content}
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


