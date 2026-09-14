import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from "motion/react";
import { 
  PenTool, CheckCircle2, ListFilter, Trash2, Edit3, Save, X, Plus, 
  ChevronUp, ChevronDown, ChevronRight, FileText, Search, Replace, 
  BookOpen, Sparkles, Copy, Wand2, Maximize2, Minimize2, MoreVertical, 
  LayoutPanelLeft, Loader2, MessageSquare, Type, Zap, Check, ArrowLeft,
  BarChart3 
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from '../lib/toast';
import { PacingMeter } from './workspace/PacingMeter';
import { InlineAiToolbar, AiCorrectionMode } from './workspace/InlineAiToolbar';
import { QuickBibleDrawer } from './workspace/QuickBibleDrawer';

interface WorkspaceProps {
  bible: BibleState;
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
  initialEpisodeId?: string | null;
  onNavigateToBible?: () => void;
}

export const Workspace = memo(function Workspace({ 
  bible, 
  episodes, 
  setEpisodes,
  initialEpisodeId,
  onNavigateToBible
}: WorkspaceProps) {
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
  const [showStatsModal, setShowStatsModal] = useState(false);

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
    if (initialEpisodeId) {
      setActiveEpisodeId(initialEpisodeId);
    }
  }, [initialEpisodeId]);

  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans');

  useEffect(() => {
    const handleSelect = (e: any) => {
      if (e.detail) {
        setActiveEpisodeId(e.detail);
      }
    };
    window.addEventListener('selectEpisode', handleSelect);
    return () => window.removeEventListener('selectEpisode', handleSelect);
  }, []);

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

  // Keyboard shortcut for saving & navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && !e.shiftKey) {
        e.preventDefault();
        setShowSearchReplace(prev => {
          if (!prev) setTimeout(() => searchInputRef.current?.focus(), 100);
          return !prev;
        });
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setShowQuickBible(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (showSearchReplace) {
          setShowSearchReplace(false);
        } else if (showQuickBible) {
          setShowQuickBible(false);
        } else if (showStatsModal) {
          setShowStatsModal(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
      // Alt + ArrowUp / ArrowDown for episode switching
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const currentIdx = episodes.findIndex(ep => ep.id === activeEpisodeId);
        if (e.key === 'ArrowUp' && currentIdx > 0) {
          setActiveEpisodeId(episodes[currentIdx - 1].id);
        } else if (e.key === 'ArrowDown' && currentIdx >= 0 && currentIdx < episodes.length - 1) {
          setActiveEpisodeId(episodes[currentIdx + 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, showSearchReplace, showQuickBible, showStatsModal, isFullscreen, episodes, activeEpisodeId]);

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

  const duplicateEpisode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetEp = episodes.find(ep => ep.id === id);
    if (!targetEp) return;

    const targetIdx = episodes.findIndex(ep => ep.id === id);
    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      number: targetEp.number + 1,
      direction: `${targetEp.direction || `제 ${targetEp.number}화`} (복사본)`,
      content: targetEp.content,
      summary: targetEp.summary,
      authorNote: targetEp.authorNote,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    setEpisodes(prev => {
      const updated = [...prev];
      updated.splice(targetIdx + 1, 0, newEp);
      return updated.map((ep, idx) => ({ ...ep, number: idx + 1 }));
    });
    setActiveEpisodeId(newEp.id);
    toast.success(`제 ${targetEp.number}화가 복제되었습니다.`);
  };

  // Real-time search match counts
  const matchCountInCurrent = useMemo(() => {
    if (!searchTarget.trim()) return 0;
    try {
      const escaped = searchTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = formState.content.match(new RegExp(escaped, 'g'));
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [searchTarget, formState.content]);

  const matchCountInAll = useMemo(() => {
    if (!searchTarget.trim()) return 0;
    try {
      const escaped = searchTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      let count = 0;
      episodes.forEach(ep => {
        const m = ep.content.match(regex);
        if (m) count += m.length;
      });
      return count;
    } catch {
      return 0;
    }
  }, [searchTarget, episodes]);

  const executeCurrentReplace = () => {
    if (!searchTarget) return;
    if (matchCountInCurrent === 0) {
      toast.info(`현재 회차에서 "${searchTarget}"을(를) 찾을 수 없습니다.`);
      return;
    }
    const newContent = formState.content.split(searchTarget).join(replaceValue);
    const newDirection = formState.direction.split(searchTarget).join(replaceValue);
    const newSummary = formState.summary.split(searchTarget).join(replaceValue);
    setFormState(prev => ({
      ...prev,
      content: newContent,
      direction: newDirection,
      summary: newSummary
    }));
    setSaveStatus('unsaved');
    toast.success(`현재 회차에서 "${searchTarget}" ${matchCountInCurrent}건을 치환했습니다.`);
  };

  const executeGlobalReplace = () => {
    if (!searchTarget) return;
    if (matchCountInAll === 0) {
      toast.info(`전체 회차에서 "${searchTarget}"을(를) 찾을 수 없습니다.`);
      return;
    }
    if (confirm(`모든 회차에서 "${searchTarget}" (${matchCountInAll}건)을 "${replaceValue}"(으)로 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      setEpisodes(prev => prev.map(ep => ({
        ...ep,
        content: ep.content.split(searchTarget).join(replaceValue),
        direction: ep.direction.split(searchTarget).join(replaceValue),
        summary: ep.summary.split(searchTarget).join(replaceValue),
      })));
      if (activeEpisodeId && activeEpisodeId !== 'new') {
        setFormState(f => ({
          ...f,
          content: f.content.split(searchTarget).join(replaceValue),
          direction: f.direction.split(searchTarget).join(replaceValue),
          summary: f.summary.split(searchTarget).join(replaceValue),
        }));
      }
      toast.success(`전체 회차에서 총 ${matchCountInAll}건의 일괄 치환이 완료되었습니다.`);
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

  const contentStats = useMemo(() => {
    const text = formState.content;
    const withSpaces = text.length;
    const withoutSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const readTimeMin = Math.ceil(withSpaces / 500); // 500자/분 독서 속도 기준
    const percent5500 = Math.min(100, Math.round((withSpaces / 5500) * 100));

    return { withSpaces, withoutSpaces, words, paragraphs, readTimeMin, percent5500 };
  }, [formState.content]);

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

  const handleAiCorrection = async (mode: AiCorrectionMode = 'polish', customInstruction?: string) => {
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
          context: context,
          mode: mode,
          instruction: customInstruction
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.suggestions) {
        setCorrectionSuggestions(data.suggestions);
      } else {
        toast.error(data.error || '교정 제안 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      toast.error('통신 오류가 발생했습니다.');
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
    <div className={isFullscreen ? "fixed inset-0 z-[100] flex flex-col w-full h-full bg-[#05060a] text-slate-100 overflow-hidden" : "flex-1 flex flex-col w-full h-full bg-transparent overflow-hidden text-slate-100"}>
      
      {/* Header */}
      {!isFullscreen && (
        <header className="h-[70px] shrink-0 bg-[#070a14]/90 backdrop-blur-2xl border-b border-white/[0.08] px-5 sm:px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)] z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>집필 스튜디오</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                  Studio
                </span>
              </h1>
              <p className="text-xs text-slate-400">웹소설 집필 & AI 실시간 페이싱 피드백</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Target Progress Bar */}
            <div className="hidden md:flex flex-col items-end mr-4">
              <div className="flex items-center justify-between w-36 mb-1 text-[11px]">
                <span className="font-semibold text-slate-400">유료화 (15만자)</span>
                <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
              </div>
              <div className="w-36 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Prompt Copy */}
            <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => generatePrompt('continue')} 
                className="text-xs text-slate-300 hover:text-amber-300 hover:bg-white/[0.06] h-7 px-2.5 font-bold" 
                title="외부 AI용 이어쓰기 프롬프트 복사"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> 이어쓰기
              </Button>
              <div className="w-px h-3.5 bg-white/10" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => generatePrompt('interactive')} 
                className="text-xs text-slate-300 hover:text-amber-300 hover:bg-white/[0.06] h-7 px-2.5 font-bold" 
                title="외부 AI용 소설 게임 프롬프트 복사"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-violet-400" /> TRPG 게임
              </Button>
            </div>

            {/* Find and Replace */}
            <Button 
              variant="outline" 
              size="sm" 
              className={`border-white/[0.08] rounded-xl text-xs font-semibold h-8.5 px-3 transition-all ${
                showSearchReplace 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
              onClick={() => setShowSearchReplace(!showSearchReplace)}
            >
              <Replace className="w-3.5 h-3.5 md:mr-1.5" /> <span className="hidden md:inline">단어 치환</span>
            </Button>

            {/* Quick Bible Toggle */}
            <Button 
              variant="outline" 
              size="sm" 
              className={`border-white/[0.08] rounded-xl text-xs font-semibold h-8.5 px-3 transition-all ${
                showQuickBible 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
              onClick={() => setShowQuickBible(!showQuickBible)}
            >
              <BookOpen className="w-3.5 h-3.5 md:mr-1.5 text-amber-400" /> 
              <span className="hidden md:inline">설정집 퀵뷰</span>
            </Button>
          </div>
        </header>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar: Episode List */}
        <div className={`w-[320px] bg-[#070913]/90 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col shrink-0 transition-transform ${isFullscreen ? 'hidden' : 'flex'} z-10 shadow-[4px_0_30px_rgba(0,0,0,0.5)]`}>
          <div className="p-4 border-b border-white/[0.08] bg-white/[0.01]">
            <Button 
              onClick={() => setActiveEpisodeId('new')}
              className={`w-full py-5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                activeEpisodeId === 'new' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110' 
                  : 'bg-white/[0.05] border border-white/[0.08] text-slate-200 hover:bg-white/[0.1]'
              }`}
            >
              <Plus className="w-4 h-4" /> 제 {nextEpisodeNum}화 집필 시작
            </Button>
            
            <div className="mt-3.5 relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="회차 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs bg-white/[0.03] border border-white/[0.08] rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors font-medium"
              />
            </div>
            
            <div className="flex gap-1 mt-3 overflow-x-auto pb-1 custom-scrollbar">
              {['all', 'draft', 'revision', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === status 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                >
                  {status === 'all' ? '전체' : status === 'draft' ? '초안' : status === 'revision' ? '퇴고' : '탈고'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar">
            {filteredEpisodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-xs text-slate-500 mt-12 space-y-2">
                <FileText className="w-8 h-8 text-slate-600 opacity-60" />
                <p>작성된 회차가 없습니다.</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredEpisodes.map((ep) => {
                  const isActive = activeEpisodeId === ep.id;
                  return (
                    <motion.div 
                      id={`ep-${ep.id}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={ep.id}
                      onClick={() => setActiveEpisodeId(ep.id)}
                      className={`p-3.5 rounded-xl cursor-pointer border transition-all text-left group relative ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30' 
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className={`text-sm font-black tracking-tight ${isActive ? 'text-amber-300' : 'text-white'}`}>
                          {ep.number}화
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ep.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          ep.status === 'revision' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                          'bg-white/[0.05] text-slate-400 border-white/[0.08]'
                        }`}>
                          {ep.status === 'completed' ? '탈고' : ep.status === 'revision' ? '퇴고' : '초안'}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-300 truncate mb-2">
                        {ep.direction || '제목 미정'}
                      </h4>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>{ep.content.length.toLocaleString()} 자</span>
                          <span>{Math.round((ep.content.length / 5500) * 100)}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${ep.content.length >= 5500 ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                            style={{ width: `${Math.min(100, (ep.content.length / 5500) * 100)}%` }} 
                          />
                        </div>
                      </div>
                        
                      {/* Hover Actions */}
                      <div className="flex items-center bg-[#070913]/90 backdrop-blur-md border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity absolute right-2.5 bottom-2.5 shadow-lg z-10">
                        <button onClick={(e) => moveEpisode(filteredEpisodes.findIndex(x => x.id === ep.id), 'up', e)} className="text-slate-400 hover:text-amber-300 p-1.5 rounded-l-lg transition-colors" title="위로 이동">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-white/10" />
                        <button onClick={(e) => moveEpisode(filteredEpisodes.findIndex(x => x.id === ep.id), 'down', e)} className="text-slate-400 hover:text-amber-300 p-1.5 transition-colors" title="아래로 이동">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-white/10" />
                        <button onClick={(e) => duplicateEpisode(ep.id, e)} className="text-slate-400 hover:text-amber-300 p-1.5 transition-colors" title="회차 복제">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-white/10" />
                        <button onClick={(e) => deleteEpisode(ep.id, e)} className="text-slate-400 hover:text-rose-400 p-1.5 rounded-r-lg transition-colors" title="회차 삭제">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#05060a]">
          
          {/* Find/Replace Top Banner */}
          <AnimatePresence>
            {showSearchReplace && (
              <motion.div 
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-[#070913]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-2.5 shrink-0 flex flex-wrap items-center gap-2.5 w-full shadow-2xl z-30 absolute top-0 left-0 right-0"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
                    <Replace className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white hidden sm:inline">단어 치환</span>
                </div>

                <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
                  <input 
                    ref={searchInputRef} 
                    type="text" 
                    placeholder="찾을 단어" 
                    className="h-8 px-3 text-xs rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-amber-500/50 outline-none flex-1" 
                    value={searchTarget} 
                    onChange={e => setSearchTarget(e.target.value)} 
                  />
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0"/>
                  <input 
                    type="text" 
                    placeholder="바꿀 단어" 
                    className="h-8 px-3 text-xs rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-amber-500/50 outline-none flex-1" 
                    value={replaceValue} 
                    onChange={e => setReplaceValue(e.target.value)} 
                  />
                </div>

                {searchTarget.trim() && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 shrink-0">
                    <span className="bg-white/[0.04] border border-white/[0.08] px-2 py-1 rounded-lg">
                      현재 화 <b className="text-amber-300 font-bold">{matchCountInCurrent}</b>건
                    </span>
                    <span className="bg-white/[0.04] border border-white/[0.08] px-2 py-1 rounded-lg">
                      전체 <b className="text-amber-300 font-bold">{matchCountInAll}</b>건
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    onClick={executeCurrentReplace} 
                    disabled={!searchTarget || matchCountInCurrent === 0} 
                    className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 disabled:opacity-40 h-8 text-xs font-semibold px-3 rounded-xl transition-all"
                  >
                    현재 화 치환
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={executeGlobalReplace} 
                    disabled={!searchTarget || matchCountInAll === 0} 
                    className="bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 h-8 text-xs font-bold px-3.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
                  >
                    전체 회차 치환
                  </Button>
                  <button 
                    onClick={() => setShowSearchReplace(false)} 
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors ml-1"
                    title="닫기 (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sub Header Toolbar */}
          <motion.div 
            animate={{ marginTop: showSearchReplace ? 56 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-b border-white/[0.06] px-5 sm:px-8 py-2.5 flex justify-between items-center bg-[#070913]/60 backdrop-blur-md shrink-0 z-10"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-black text-white">
                {activeEpisodeId === 'new' ? `제 ${nextEpisodeNum}화 기획 및 작성` : `제 ${activeEpInfo?.number}화 편집`}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 transition-colors ${
                saveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                saveStatus === 'saving' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 
                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  saveStatus === 'saved' ? 'bg-emerald-400 animate-pulse' :
                  saveStatus === 'saving' ? 'bg-amber-400 animate-ping' :
                  'bg-rose-400'
                }`} />
                {saveStatus === 'saved' ? '저장됨' : saveStatus === 'saving' ? '저장 중...' : '미저장 (Ctrl+S)'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Font Style & Size Stepper */}
              <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl mr-1">
                <button
                  onClick={() => setFontFamily(f => f === 'sans' ? 'serif' : 'sans')}
                  className={`px-2 h-7 rounded-lg text-xs font-bold transition-colors ${
                    fontFamily === 'serif' ? 'bg-amber-500/20 text-amber-300 font-serif' : 'text-slate-400 hover:text-white'
                  }`}
                  title="서체 변경 (명조 / 고딕)"
                >
                  {fontFamily === 'serif' ? '명조' : '고딕'}
                </button>
                <div className="w-px h-3.5 bg-white/10" />
                <button 
                  onClick={() => setEditorFontSize(f => Math.max(12, f - 2))} 
                  className="px-2 h-7 text-xs text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg font-bold" 
                  title="글꼴 작게"
                >
                  A-
                </button>
                <button 
                  onClick={() => setEditorFontSize(f => Math.min(26, f + 2))} 
                  className="px-2 h-7 text-xs text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg font-bold" 
                  title="글꼴 크게"
                >
                  A+
                </button>
              </div>

              {/* Utility Tools */}
              <div className="hidden sm:flex items-center gap-1 border-r border-white/[0.08] pr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFormState(f => ({ ...f, content: cleanAIText(f.content) }))} 
                  className="h-8 w-8 p-0 text-slate-400 hover:bg-white/[0.06] hover:text-amber-300 rounded-xl" 
                  title="AI 서식 및 마크다운 정리"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(formState.content)} 
                  className="h-8 w-8 p-0 text-slate-400 hover:bg-white/[0.06] hover:text-white rounded-xl" 
                  title="본문 전체 복사"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={downloadEpisode} 
                  className="h-8 w-8 p-0 text-slate-400 hover:bg-white/[0.06] hover:text-white rounded-xl" 
                  title="TXT 파일로 내보내기"
                >
                  <FileText className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Zen Fullscreen Focus Toggle */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className={`h-8 border-white/[0.08] rounded-xl text-xs font-semibold transition-colors ${
                  isFullscreen ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
                title="집중 집필 모드 (F11/전체화면)"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 mr-1" /> : <Maximize2 className="w-3.5 h-3.5 mr-1" />}
                <span className="hidden sm:inline">{isFullscreen ? '일반 모드' : '몰입 모드'}</span>
              </Button>

              {/* Save Button */}
              <Button 
                size="sm" 
                onClick={handleSave} 
                className="h-8 bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl font-bold text-xs px-3.5 transition-all"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" /> 저장
              </Button>
            </div>
          </motion.div>

          {/* Main Scrollable Canvas */}
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar scroll-smooth">
            <div className={`mx-auto ${isFullscreen ? 'w-full max-w-4xl px-8 py-10' : 'max-w-4xl px-5 sm:px-8 py-7'} space-y-6 pb-36 transition-all duration-300`}>
              
              {/* Real-time Web Novel Pacing Meter */}
              <PacingMeter content={formState.content} targetLength={5500} />

              {/* Episode Metadata Header */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    회차 제목 / 집필 목표
                  </label>
                  <input 
                    type="text"
                    placeholder="예: 3화 - 각성 후 첫 번째 던전 토벌, 사이다 전개"
                    className="w-full text-base font-bold bg-transparent border-none focus:outline-none placeholder:text-slate-600 text-white"
                    value={formState.direction}
                    onChange={(e) => handleContentChange('direction', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-44 shrink-0 sm:border-l sm:border-white/[0.08] sm:pl-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    원고 진행 단계
                  </label>
                  <select 
                    className="w-full text-xs font-semibold rounded-xl py-1.5 px-2.5 bg-white/[0.04] border border-white/[0.08] text-slate-200 outline-none cursor-pointer hover:bg-white/[0.08] transition-colors"
                    value={formState.status}
                    onChange={(e) => handleContentChange('status', e.target.value)}
                  >
                    <option value="draft" className="bg-[#070913] text-white">📝 초안 작성</option>
                    <option value="revision" className="bg-[#070913] text-white">✍️ 퇴고 진행</option>
                    <option value="completed" className="bg-[#070913] text-white">✅ 탈고 완료</option>
                  </select>
                </div>
              </div>

              {/* Manuscript Editor Area */}
              <div className="relative group">
                {/* Floating Modern AI Toolbar & Suggestions */}
                <div className="sticky top-2 z-20 mb-2">
                  <InlineAiToolbar
                    selectedText={selectedText}
                    isCorrecting={isCorrecting}
                    suggestions={correctionSuggestions}
                    showUI={showCorrectionUI}
                    onClose={() => setShowCorrectionUI(false)}
                    onRequestCorrection={handleAiCorrection}
                    onApplyCorrection={applyCorrection}
                  />
                </div>

                {/* The Editor Textarea */}
                <Textarea 
                  ref={textareaRef}
                  className={`w-full min-h-[580px] p-6 sm:p-8 bg-white/[0.02] border border-white/[0.08] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 rounded-2xl text-slate-100 placeholder:text-slate-600 leading-[2.2] tracking-wide resize-y shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] transition-all custom-scrollbar ${
                    fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                  }`}
                  style={{ fontSize: `${editorFontSize}px`, wordBreak: 'keep-all' }}
                  value={formState.content}
                  onChange={(e) => handleContentChange('content', e.target.value)}
                  onSelect={handleSelectionChange}
                  onMouseUp={handleSelectionChange}
                  onKeyUp={handleSelectionChange}
                  placeholder="독자를 단숨에 몰입시킬 첫 문장을 작성해보세요..."
                />

                {/* Bottom Writing Action Bar */}
                <div className="mt-3 flex items-center justify-between">
                  <button 
                    type="button"
                    onClick={() => setShowStatsModal(true)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] px-3 py-1.5 rounded-xl transition-all group cursor-pointer"
                    title="상세 통계 분석 보기"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-white font-bold">{formState.content.length.toLocaleString()}</span> 자 
                    <span className="text-slate-600">·</span>
                    <span>공백제외 {formState.content.replace(/\s/g, '').length.toLocaleString()} 자</span>
                    <span className="text-[10px] text-amber-400/80 font-semibold ml-1">통계</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleAiAutocomplete} 
                      disabled={isGenerating} 
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold px-3.5 py-4 transition-all"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />} 
                      AI 다음 문장 이어쓰기
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAiFeedback} 
                      disabled={isGenerating} 
                      className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-bold px-3.5 py-4 transition-all"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-violet-400" />}
                      편집자 심층 피드백
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Feedback Display */}
              <AnimatePresence>
                {aiFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-violet-500/30 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black text-violet-300 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-violet-400" />
                        <span>AI 전문 편집자 피드백</span>
                      </h3>
                      <button 
                        onClick={() => setAiFeedback(null)} 
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.08]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                      {aiFeedback}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Meta Notes: Synopsis & Author Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] focus-within:border-amber-500/40 transition-colors">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                    <ListFilter className="w-3.5 h-3.5 text-amber-400" />
                    <span>회차 시놉시스 (핵심 요약)</span>
                  </label>
                  <Textarea 
                    className="h-24 text-xs leading-relaxed bg-transparent border-none p-0 resize-none placeholder:text-slate-600 text-slate-200 custom-scrollbar focus:ring-0"
                    placeholder="다음 회차 작성 및 복선 회수를 위한 이번 화의 핵심 줄거리를 1~2줄로 요약해 두세요."
                    value={formState.summary}
                    onChange={(e) => handleContentChange('summary', e.target.value)}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] focus-within:border-violet-500/40 transition-colors">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                    <PenTool className="w-3.5 h-3.5 text-violet-400" />
                    <span>작가의 말 & 후기 메모</span>
                  </label>
                  <Textarea 
                    className="h-24 text-xs leading-relaxed bg-transparent border-none p-0 resize-none placeholder:text-slate-600 text-slate-200 custom-scrollbar focus:ring-0"
                    placeholder="플랫폼 발행 시 하단에 붙일 작가의 말이나 개인 메모를 남기세요."
                    value={formState.authorNote}
                    onChange={(e) => handleContentChange('authorNote', e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Manuscript Statistics Modal */}
        <AnimatePresence>
          {showStatsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-md bg-[#070913]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] relative"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">원고 상세 통계 분석</h3>
                      <p className="text-[11px] text-slate-400">현재 회차 정밀 분석</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowStatsModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 py-5">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[11px] text-slate-400 block mb-1">글자 수 (공백 포함)</span>
                    <span className="text-xl font-black font-mono text-amber-300">
                      {contentStats.withSpaces.toLocaleString()}<span className="text-xs text-slate-500 font-normal ml-1">자</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[11px] text-slate-400 block mb-1">글자 수 (공백 제외)</span>
                    <span className="text-xl font-black font-mono text-white">
                      {contentStats.withoutSpaces.toLocaleString()}<span className="text-xs text-slate-500 font-normal ml-1">자</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[11px] text-slate-400 block mb-1">단어 수 (어절)</span>
                    <span className="text-xl font-black font-mono text-slate-200">
                      {contentStats.words.toLocaleString()}<span className="text-xs text-slate-500 font-normal ml-1">개</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[11px] text-slate-400 block mb-1">문단 수</span>
                    <span className="text-xl font-black font-mono text-slate-200">
                      {contentStats.paragraphs.toLocaleString()}<span className="text-xs text-slate-500 font-normal ml-1">개</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[11px] text-slate-400 block mb-1">예상 독서 소요 시간</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      약 {contentStats.readTimeMin}<span className="text-xs text-slate-500 font-normal ml-1">분</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[11px] text-slate-400 block mb-1">1화 목표 달성도</span>
                    <span className="text-xl font-black font-mono text-amber-300">
                      {contentStats.percent5500}<span className="text-xs text-slate-500 font-normal ml-1">%</span>
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-xs text-slate-300 flex items-center justify-between">
                  <span>전체 {episodes.length}개 회차 누적 분량</span>
                  <span className="font-mono font-bold text-amber-400">{totalCharacters.toLocaleString()}자</span>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button 
                    size="sm"
                    onClick={() => setShowStatsModal(false)}
                    className="bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold px-4 rounded-xl"
                  >
                    닫기
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Quick Bible Viewer Drawer */}
        <QuickBibleDrawer
          bible={bible}
          isOpen={showQuickBible}
          onClose={() => setShowQuickBible(false)}
          onNavigateToBible={onNavigateToBible}
        />
      </div>
    </div>
  );
});

