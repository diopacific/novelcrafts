import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from "motion/react";
import { PenTool, CheckCircle2, ListFilter, Trash2, Edit3, Save, X, Plus, ChevronUp, ChevronDown, ChevronRight, FileText, Search, Replace, BookOpen, Sparkles, Copy, Wand2, Maximize2, Minimize2, MoreVertical, LayoutPanelLeft, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from '../lib/toast';

interface WorkspaceProps {
  bible: BibleState;
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
}

export const Workspace = memo(function Workspace({ bible, episodes, setEpisodes }: WorkspaceProps) {
  const { user } = useAuth();
  
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>('new');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'revision' | 'completed'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickBible, setShowQuickBible] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(16);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // AI Correction State
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionSuggestions, setCorrectionSuggestions] = useState<string[]>([]);
  const [showCorrectionUI, setShowCorrectionUI] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Search & Replace State
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchTarget, setSearchTarget] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      toast.error('본문 내용을 입력해주세요.');
      return;
    }

    setSaveStatus('saving');

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
    }
    
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  // Scroll to active episode
  useEffect(() => {
    if (activeEpisodeId && activeEpisodeId !== 'new') {
      const el = document.getElementById(`ep-${activeEpisodeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeEpisodeId]);

  // Custom event listener for new episode
  useEffect(() => {
    const handleNewEpisode = () => setActiveEpisodeId('new');
    window.addEventListener('createNewEpisode', handleNewEpisode as EventListener);
    return () => window.removeEventListener('createNewEpisode', handleNewEpisode as EventListener);
  }, []);

  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        setShowSearchReplace(prev => {
          if (!prev) setTimeout(() => searchInputRef.current?.focus(), 100);
          return !prev;
        });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowQuickBible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleContentChange = (field: string, value: string) => {
    setFormState(f => ({ ...f, [field]: value }));
    setSaveStatus('unsaved');
  };

  // Auto-save effect
  useEffect(() => {
    if (saveStatus !== 'unsaved') return;

    const timer = setTimeout(() => {
      handleSave();
    }, 15000); // Auto-save after 15 seconds of inactivity

    return () => clearTimeout(timer);
  }, [formState, saveStatus, handleSave]);

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
      toast.success('일괄 치환이 완료되었습니다.');
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
    toast.success('본문이 복사되었습니다.');
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
    toast.success('AI 프롬프트가 클립보드에 복사되었습니다! 외부 AI 툴(ChatGPT, Claude, Gemini 등)에 붙여넣기 하세요.');
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        setSelectionStart(start);
        setSelectionEnd(end);
        setSelectedText(formState.content.substring(start, end));
      } else {
        setSelectedText("");
        setShowCorrectionUI(false);
      }
    }
  };

  const handleAiCorrection = async () => {
    if (!selectedText.trim()) return;
    
    setIsCorrecting(true);
    setShowCorrectionUI(true);
    setCorrectionSuggestions([]);
    
    try {
      const baseBible = `핵심/로그라인: ${bible.logline}\n스토리: ${bible.story}\n세계관: ${bible.world}\n캐릭터: ${bible.character}`;
      const beforeText = formState.content.substring(Math.max(0, selectionStart - 500), selectionStart);
      const afterText = formState.content.substring(selectionEnd, Math.min(formState.content.length, selectionEnd + 500));
      const context = `[이전 문맥]\n${beforeText}\n\n[이후 문맥]\n${afterText}\n\n[설정 참고]\n${baseBible}`;
      
      const response = await fetch('/api/ai/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          context: context
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.suggestions) {
        setCorrectionSuggestions(data.suggestions);
      } else {
        toast.error(data.error || '교정 제안 생성에 실패했습니다.');
        setShowCorrectionUI(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('통신 오류가 발생했습니다.');
      setShowCorrectionUI(false);
    } finally {
      setIsCorrecting(false);
    }
  };

  const applyCorrection = (suggestion: string) => {
    const newContent = formState.content.substring(0, selectionStart) + suggestion + formState.content.substring(selectionEnd);
    setFormState(prev => ({ ...prev, content: newContent }));
    setSelectedText("");
    setShowCorrectionUI(false);
    toast.success('문장이 교정되었습니다.');
    
    // Reset selection in textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(selectionStart, selectionStart + suggestion.length);
      }
    }, 50);
  };

  const handleAiAutocomplete = async () => {
    if (!formState.content.trim()) {
      toast.info("먼저 몇 문장을 작성해주세요.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const baseBible = `핵심/로그라인: ${bible.logline}\n스토리: ${bible.story}\n세계관: ${bible.world}\n캐릭터: ${bible.character}\n빌런: ${bible.villain}`;
      
      const response = await fetch('/api/ai/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formState.content,
          context: baseBible
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.text) {
        setFormState(f => ({ ...f, content: f.content + (f.content.endsWith(' ') || f.content.endsWith('\n') ? '' : ' ') + data.text }));
      } else {
        toast.error(data.error || 'AI 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiFeedback = async () => {
    if (formState.content.length < 100) {
      toast.info("피드백을 받으려면 최소 100자 이상 작성해주세요.");
      return;
    }
    
    setIsGenerating(true);
    setAiFeedback(null);
    try {
      const baseBible = `핵심/로그라인: ${bible.logline}\n스토리: ${bible.story}\n세계관: ${bible.world}\n캐릭터: ${bible.character}`;
      
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formState.content,
          context: baseBible
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.feedback) {
        setAiFeedback(data.feedback);
      } else {
        toast.error(data.error || '피드백 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[100] flex flex-col w-full h-full bg-[#f8fafc] overflow-hidden" : "flex-1 flex flex-col w-full h-full bg-[#f8fafc] overflow-hidden"}>
      
      {/* Header */}
      {!isFullscreen && (
        <header className="h-[72px] shrink-0 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shadow-sm z-10 sticky top-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-600" />
              회차 보관함
            </h1>
            <p className="text-[13px] font-medium text-slate-500 mt-0.5">원고를 체계적으로 작성하고 관리하세요.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-6 hidden md:flex">
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-[11px] font-bold text-slate-500">유료화 목표 (15만자)</span>
                <span className="text-[11px] font-black text-emerald-600">{progressPercent}%</span>
              </div>
              <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 mr-2 bg-slate-50 p-1 rounded-lg border border-slate-200/60">
              <Button variant="ghost" size="sm" onClick={() => generatePrompt('continue')} className="text-[12px] text-slate-600 hover:text-indigo-600 hover:bg-white h-7 px-2.5 font-bold" title="외부 AI용 이어쓰기 프롬프트 복사">
                 <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> 이어쓰기 프롬프트
              </Button>
              <div className="w-px h-4 bg-slate-200"></div>
              <Button variant="ghost" size="sm" onClick={() => generatePrompt('interactive')} className="text-[12px] text-slate-600 hover:text-indigo-600 hover:bg-white h-7 px-2.5 font-bold" title="외부 AI용 소설 게임 프롬프트 복사">
                 <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> 게임 프롬프트
              </Button>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className={`border-slate-200 shadow-sm ${showSearchReplace ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
              onClick={() => setShowSearchReplace(!showSearchReplace)}
            >
              <Replace className="w-4 h-4 md:mr-1.5" /> <span className="hidden md:inline">단어 치환</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`border-slate-200 shadow-sm ${showQuickBible ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
              onClick={() => setShowQuickBible(!showQuickBible)}
            >
              <BookOpen className="w-4 h-4 md:mr-1.5" /> <span className="hidden md:inline">설정 퀵뷰</span>
            </Button>
          </div>
        </header>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Episode List */}
        <div className={`w-[300px] bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform ${isFullscreen ? 'hidden' : 'flex'} z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
          <div className="p-5 border-b border-slate-100 bg-white">
            <Button 
              onClick={() => setActiveEpisodeId('new')}
              className={`w-full py-6 text-[14px] shadow-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${activeEpisodeId === 'new' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5'}`}
            >
              <Plus className="w-4 h-4" /> 제 {nextEpisodeNum}화 쓰기
            </Button>
            
            <div className="mt-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="회차 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 transition-all font-medium"
              />
            </div>
            
            <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 custom-scrollbar">
              {['all', 'draft', 'revision', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3.5 py-1.5 text-[12px] font-bold rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === status 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status === 'all' ? '전체 보기' : status === 'draft' ? '초안' : status === 'revision' ? '퇴고 중' : '탈고 완료'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar bg-slate-50/50">
            {filteredEpisodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-sm text-slate-400 mt-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
                <p>조건에 맞는 회차가 없습니다.</p>
              </div>
            ) : (
              <AnimatePresence>
              {filteredEpisodes.map((ep) => (
                <motion.div 
                  id={`ep-${ep.id}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={ep.id}
                  onClick={() => setActiveEpisodeId(ep.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all text-left group relative ${
                    activeEpisodeId === ep.id 
                    ? 'border-indigo-200 bg-white shadow-md ring-1 ring-indigo-500/10 scale-[1.02] z-10' 
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[15px] font-black tracking-tight ${activeEpisodeId === ep.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {ep.number}화
                    </span>
                    <div className="flex items-center gap-1.5">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                         ep.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                         ep.status === 'revision' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                         'bg-slate-50 text-slate-500 border-slate-200'
                       }`}>
                         {ep.status === 'completed' ? '완성' : ep.status === 'revision' ? '퇴고' : '초안'}
                       </span>
                    </div>
                  </div>
                  <h4 className="text-[13px] font-bold text-slate-600 truncate mb-2">{ep.direction || '제목 미정'}</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-400 font-mono font-medium flex items-center bg-slate-50 px-2 py-0.5 rounded-md w-fit">
                        {ep.content.length.toLocaleString()} 자
                      </p>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${ep.content.length >= 5500 ? 'bg-emerald-400' : 'bg-indigo-400'}`} 
                        style={{ width: `${Math.min(100, (ep.content.length / 5500) * 100)}%` }} 
                      />
                    </div>
                  </div>
                    
                    {/* Hover Actions */}
                    <div className="flex items-center bg-white shadow-sm border border-slate-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 bottom-3">
                      <button onClick={(e) => moveEpisode(filteredEpisodes.findIndex(e => e.id === ep.id), 'up', e)} className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-50 rounded-l-md transition-colors">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-3 bg-slate-200"></div>
                      <button onClick={(e) => moveEpisode(filteredEpisodes.findIndex(e => e.id === ep.id), 'down', e)} className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-50 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-3 bg-slate-200"></div>
                      <button onClick={(e) => deleteEpisode(ep.id, e)} className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-r-md transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                </motion.div>
              ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#f1f5f9]">
          
          {/* Find/Replace Top Banner */}
          <AnimatePresence>
            {showSearchReplace && (
              <motion.div 
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white border-b border-slate-200 p-3 shrink-0 flex items-center gap-3 w-full shadow-sm z-20 absolute top-0 left-0 right-0"
              >
                <Replace className="w-4 h-4 text-indigo-500 hidden sm:block ml-2" />
                <input ref={searchInputRef} type="text" placeholder="찾을 단어" className="h-8 px-3 text-[13px] font-medium rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none flex-1 max-w-[200px]" value={searchTarget} onChange={e => setSearchTarget(e.target.value)} />
                <span className="text-slate-300"><ChevronRight className="w-4 h-4"/></span>
                <input type="text" placeholder="바꿀 단어" className="h-8 px-3 text-[13px] font-medium rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none flex-1 max-w-[200px]" value={replaceValue} onChange={e => setReplaceValue(e.target.value)} />
                <Button size="sm" onClick={executeGlobalReplace} disabled={!searchTarget} className="bg-indigo-600 text-white hover:bg-indigo-700 h-8 shrink-0 text-[12px] font-bold px-4 rounded-lg">일괄 변경</Button>
                <div className="flex-1" />
                <button onClick={() => setShowSearchReplace(false)} className="text-slate-400 hover:text-slate-700 mr-2 bg-slate-100 p-1 rounded-md"><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tools Area */}
          <motion.div 
            animate={{ marginTop: showSearchReplace ? 57 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`border-b border-slate-200 px-6 py-2.5 flex justify-between items-center bg-white shrink-0 z-10`}
          >
            <div className="flex items-center gap-3">
               <span className="text-[14px] font-black text-slate-800">
                 {activeEpisodeId === 'new' ? `제 ${nextEpisodeNum}화 기획 및 작성` : `제 ${activeEpInfo?.number}화 편집`}
               </span>
               <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                 saveStatus === 'saved' ? 'bg-slate-100 text-slate-500' : 
                 saveStatus === 'saving' ? 'bg-indigo-100 text-indigo-600' : 
                 'bg-amber-100 text-amber-600'
               }`}>
                 {saveStatus === 'saved' ? '저장됨' : saveStatus === 'saving' ? '저장 중...' : '저장 안 됨 (Ctrl+S)'}
               </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Text Tools Group */}
              <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
                <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden h-7.5 mr-1">
                  <button onClick={() => setEditorFontSize(f => Math.max(12, f - 2))} className="px-2.5 h-full text-slate-500 hover:text-indigo-600 hover:bg-slate-100 font-bold transition-colors" title="글꼴 작게">A-</button>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <button onClick={() => setEditorFontSize(f => Math.min(24, f + 2))} className="px-2.5 h-full text-slate-500 hover:text-indigo-600 hover:bg-slate-100 font-bold text-[13px] transition-colors" title="글꼴 크게">A+</button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFormState(f => ({...f, content: cleanAIText(f.content)}))} className="h-8 w-8 p-0 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="AI 생성 텍스트 서식 정리">
                  <Wand2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(formState.content)} className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hidden sm:flex" title="본문 복사">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadEpisode} className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hidden sm:flex" title="TXT 파일로 다운로드">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Group */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className={`h-8 border-slate-200 rounded-lg font-bold text-[12px] transition-colors ${isFullscreen ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`} title="전체화면 집중 모드">
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 mr-1.5" /> : <Maximize2 className="w-3.5 h-3.5 mr-1.5" />}
                  {isFullscreen ? '일반 모드' : '집중 모드'}
                </Button>
                <Button size="sm" onClick={handleSave} className="h-8 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm rounded-lg font-bold text-[12px] transition-colors">
                  <Save className="w-3.5 h-3.5 mr-1.5" /> 원고 저장
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 overflow-y-auto w-full custom-scrollbar scroll-smooth">
            <div className={`mx-auto ${isFullscreen ? 'w-full max-w-5xl px-8 py-10' : 'max-w-4xl px-6 py-8'} space-y-6 pb-32 transition-all duration-300`}>
              
              {/* Episode Metadata Form */}
              <div className="flex flex-col sm:flex-row gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex-1 space-y-2">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider block">회차 제목 / 목표 메모</label>
                  <input 
                    type="text"
                    placeholder="예: 각성 후 첫 전투 씬, 무조건 사이다 전개"
                    className="w-full text-lg font-bold px-1 py-1 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300 text-slate-800"
                    value={formState.direction}
                    onChange={(e) => handleContentChange('direction', e.target.value)}
                  />
                  <div className="h-px w-full bg-slate-100"></div>
                </div>
                <div className="w-full sm:w-40 shrink-0 space-y-2">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider block">현재 상태</label>
                  <select 
                    className="w-full text-[13px] font-bold border-none rounded-lg py-2 px-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                    value={formState.status}
                    onChange={(e) => handleContentChange('status', e.target.value)}
                  >
                    <option value="draft">📝 초안 작성중</option>
                    <option value="revision">✍️ 퇴고 진행중</option>
                    <option value="completed">✅ 탈고 완료</option>
                  </select>
                </div>
              </div>

              {/* Main Editor */}
              <div className="space-y-3 relative group">
                <div className="flex items-end justify-between px-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-black text-slate-700 block tracking-tight">본문 원고</label>
                    <span className="text-[11px] text-slate-400 font-medium">연재 권장 분량: 5,500자</span>
                  </div>
                  <div className="flex items-center gap-3">

                    <div className="flex items-center gap-1.5 w-32 hidden sm:flex" title="목표 글자수 (5500자)">
                      <div className="flex-1 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${formState.content.length >= 5500 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(100, (formState.content.length / 5500) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[12px] font-mono font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors">
                      <span className={`${formState.content.length >= 5500 ? 'text-emerald-600' : ''}`}>{formState.content.length.toLocaleString()}</span> 자
                      <span className="text-slate-300">|</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">공백제외 {formState.content.replace(/\s/g, '').length.toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute top-0 left-0 bottom-0 w-12 bg-slate-50 border-r border-slate-100 pointer-events-none rounded-l-2xl z-10 flex flex-col items-center py-6 space-y-[26px] text-slate-300 hidden sm:flex">
                    {/* Visual fake line numbers to give it a manuscript feel */}
                    {Array.from({length: 30}).map((_, i) => <span key={i} className="text-[10px] font-mono opacity-50">{i + 1}</span>)}
                  </div>
                  
                  <Textarea 
                    ref={textareaRef}
                    className={`${isFullscreen ? 'min-h-[calc(100vh-180px)] h-[calc(100vh-180px)] p-10 sm:pl-20' : 'min-h-[600px] h-[600px] py-6 pr-8 pl-6 sm:pl-16'} w-full bg-white border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 font-medium leading-[2.2] text-slate-800 shadow-md resize-y transition-all rounded-2xl placeholder:text-slate-300 custom-scrollbar relative z-0`}
                    style={{ fontSize: `${editorFontSize}px`, wordBreak: 'keep-all' }}
                    value={formState.content}
                    onChange={(e) => handleContentChange('content', e.target.value)}
                    onSelect={handleSelectionChange}
                    onMouseUp={handleSelectionChange}
                    onKeyUp={handleSelectionChange}
                    placeholder="독자를 사로잡을 첫 문장을 입력하세요..."
                  />
                  
                  {/* Floating AI Grammar Fix Button */}
                  <AnimatePresence>
                    {selectedText.length > 0 && selectedText.trim().length > 0 && !showCorrectionUI && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
                      >
                        <Button
                          onClick={handleAiCorrection}
                          disabled={isCorrecting}
                          className="h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-indigo-500/10 rounded-full font-bold text-[13px] px-6 border border-slate-700 transition-all hover:scale-105 group"
                        >
                          {isCorrecting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-400" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                          )}
                          {isCorrecting ? '문장 다듬는 중...' : 'AI 문장 다듬기'}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Save Status (Fullscreen Only) */}
                  <AnimatePresence>
                    {isFullscreen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-6 right-8 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-full px-4 py-2 flex items-center gap-2 z-20 pointer-events-none"
                      >
                        {saveStatus === 'saving' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            <span className="text-[12px] font-bold text-slate-500">자동 저장 중...</span>
                          </>
                        ) : saveStatus === 'saved' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[12px] font-bold text-emerald-600">저장 완료</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-slate-300" />
                            <span className="text-[12px] font-bold text-slate-400">변경사항 없음</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Sentence Correction UI / Toast Tooltip */}
                  <AnimatePresence>
                    {showCorrectionUI && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] z-30 overflow-hidden flex flex-col max-h-[350px]"
                      >
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                          <h3 className="font-bold text-[13px] text-slate-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            AI 추천 교정안
                          </h3>
                          <button onClick={() => setShowCorrectionUI(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-white">
                          {isCorrecting ? (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                              <Loader2 className="w-6 h-6 animate-spin mb-3 text-indigo-400" />
                              <span className="text-[13px] font-medium">더 자연스러운 문장을 고민하고 있습니다...</span>
                            </div>
                          ) : correctionSuggestions.length > 0 ? (
                            <div className="space-y-3">
                              {correctionSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => applyCorrection(suggestion)}
                                  className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group flex items-start gap-3 hover:shadow-sm"
                                >
                                  <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-500 font-bold text-[11px] flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {idx + 1}
                                  </div>
                                  <div className="text-[14px] font-medium text-slate-700 leading-[1.7] group-hover:text-indigo-950 flex-1">
                                    {suggestion}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-slate-500 text-[13px]">
                              제안을 불러오지 못했습니다.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating AI Tools Toolbar (Appears on focus/hover in a real app, placed statically here) */}
                  <div className="absolute bottom-6 right-8 flex flex-col gap-2 opacity-30 group-hover:opacity-100 transition-opacity z-20">
                     <Button 
                       size="sm" 
                       onClick={handleAiAutocomplete} 
                       disabled={isGenerating} 
                       className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg rounded-full px-4 py-5 font-bold flex items-center gap-2 transform transition-transform hover:scale-105"
                     >
                       {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
                       AI 이어쓰기
                     </Button>
                     <Button 
                       size="sm" 
                       onClick={handleAiFeedback} 
                       disabled={isGenerating} 
                       className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg rounded-full px-4 py-5 font-bold flex items-center gap-2 transform transition-transform hover:scale-105"
                     >
                       {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                       AI 편집자 피드백
                     </Button>
                  </div>
                </div>
              </div>

              {/* AI Feedback Display */}
              {aiFeedback && (
                <div className="animate-in fade-in slide-in-from-bottom-4 mt-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[14px] font-black text-emerald-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> 담당 편집자 피드백
                      </h3>
                      <button onClick={() => setAiFeedback(null)} className="text-emerald-400 hover:text-emerald-700 bg-white rounded-full p-1 shadow-sm transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="text-[14px] leading-[1.8] text-emerald-950/80 whitespace-pre-wrap font-medium">
                      {aiFeedback}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Meta Textareas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 group focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                  <label className="text-[13px] font-black text-slate-700 flex items-center gap-1.5 mb-3"><ListFilter className="w-4 h-4 text-indigo-500"/> 핵심 요약 (시놉시스)</label>
                  <Textarea 
                    className="h-28 text-[13px] leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-slate-400 font-medium text-slate-600 custom-scrollbar"
                    placeholder="나중 검색과 흐름 파악을 위해 핵심 사건을 1~2줄로 요약해 두면 편리합니다. (예: 아카데미 입학식, 첫 번째 기연 획득)"
                    value={formState.summary}
                    onChange={(e) => handleContentChange('summary', e.target.value)}
                  />
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 group focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                  <label className="text-[13px] font-black text-slate-700 flex items-center gap-1.5 mb-3"><PenTool className="w-4 h-4 text-emerald-500"/> 작가의 말 & 메모</label>
                  <Textarea 
                    className="h-28 text-[13px] leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-slate-400 font-medium text-slate-600 custom-scrollbar"
                    placeholder="플랫폼 업로드 시 하단에 덧붙일 작가의 말이나, 다음 회차 전개를 위한 개인적인 메모를 기록합니다."
                    value={formState.authorNote}
                    onChange={(e) => handleContentChange('authorNote', e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Bible Viewer Sidebar */}
        <AnimatePresence>
        {showQuickBible && (
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[320px] shrink-0 bg-[#f8fafc] border-l border-slate-200 overflow-y-auto custom-scrollbar flex flex-col items-stretch z-20 shadow-2xl absolute right-0 top-0 bottom-0"
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10 shadow-sm">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                설정 바이블
              </h3>
              <button onClick={() => setShowQuickBible(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
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
                <div key={idx} className="space-y-1.5">
                  <h4 className="text-[11px] font-black text-indigo-900/60 uppercase tracking-widest bg-indigo-50/50 inline-block px-2 py-0.5 rounded-md">{section.title}</h4>
                  {section.content ? (
                    <div className="text-[13px] text-slate-700 leading-relaxed font-medium bg-white rounded-xl p-4 border border-slate-200 shadow-sm whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ) : (
                    <div className="text-[12px] text-slate-400 italic px-2 py-2 bg-slate-100/50 rounded-lg border border-slate-100 border-dashed">미작성</div>
                  )}
                </div>
              ))}
              {(bible.customTabs || []).map((tab, idx) => (
                <div key={`c-${idx}`} className="space-y-1.5">
                  <h4 className="text-[11px] font-black text-emerald-900/60 uppercase tracking-widest bg-emerald-50/50 inline-block px-2 py-0.5 rounded-md">{tab.label}</h4>
                  {tab.content ? (
                    <div className="text-[13px] text-slate-700 leading-relaxed font-medium bg-white rounded-xl p-4 border border-slate-200 shadow-sm whitespace-pre-wrap">
                      {tab.content}
                    </div>
                  ) : (
                    <div className="text-[12px] text-slate-400 italic px-2 py-2 bg-slate-100/50 rounded-lg border border-slate-100 border-dashed">미작성</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
});

