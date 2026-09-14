import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Book, PenTool, Settings, Sparkles, BookOpen, 
  Clock, ArrowRight, FileText, Check, Moon, Sun, 
  Terminal, ShieldCheck, Zap, Compass, Flame
} from 'lucide-react';
import { Episode, BibleState } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: 'home' | 'bible' | 'workspace' | 'tools') => void;
  onSelectEpisode?: (episodeId: string) => void;
  episodes: Episode[];
  bible: BibleState;
  show3D: boolean;
  onToggle3D: () => void;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onSelectEpisode,
  episodes,
  bible,
  show3D,
  onToggle3D
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape, toggle on Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Build command list
  const commands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-home',
        category: '네비게이션',
        title: '도서관 홀 (홈 화면)',
        description: '진척도 및 최근 작업 현황 확인',
        icon: <Compass className="w-4 h-4 text-amber-400" />,
        action: () => { onNavigate('home'); onClose(); }
      },
      {
        id: 'nav-workspace',
        category: '네비게이션',
        title: '회차 보관함 (집필실)',
        description: '원고 에디터 및 집필 도구',
        icon: <PenTool className="w-4 h-4 text-indigo-400" />,
        action: () => { onNavigate('workspace'); onClose(); }
      },
      {
        id: 'nav-bible',
        category: '네비게이션',
        title: '설정 공장 (바이블)',
        description: '세계관, 캐릭터, 아이템, 스토리 트리 구축',
        icon: <Book className="w-4 h-4 text-sky-400" />,
        action: () => { onNavigate('bible'); onClose(); }
      },
      {
        id: 'nav-tools',
        category: '네비게이션',
        title: '데이터 관리 & 백업',
        description: 'JSON 내보내기/가져오기, 통계 및 초기화',
        icon: <Settings className="w-4 h-4 text-emerald-400" />,
        action: () => { onNavigate('tools'); onClose(); }
      },
      // Fast Actions
      {
        id: 'act-new-episode',
        category: '빠른 작업',
        title: '새 회차 쓰기 시작',
        description: '신규 에피소드 작성 캔버스 오픈',
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        shortcut: 'N',
        action: () => {
          onNavigate('workspace');
          window.dispatchEvent(new CustomEvent('createNewEpisode'));
          onClose();
        }
      },
      {
        id: 'act-toggle-3d',
        category: '빠른 작업',
        title: show3D ? '3D 천공 배경 끄기 (저사양/집중 모드)' : '3D 천공 배경 켜기 (시각적 몰입 모드)',
        description: show3D ? '가벼운 앰비언트 그라데이션으로 전환' : '실시간 60FPS 3D 우주 서고 렌더링 활성화',
        icon: <Sparkles className="w-4 h-4 text-purple-400" />,
        shortcut: '3',
        action: () => { onToggle3D(); onClose(); }
      }
    ];

    // Episodes list
    if (episodes && episodes.length > 0) {
      episodes.forEach((ep) => {
        list.push({
          id: `ep-${ep.id}`,
          category: '회차 바로가기',
          title: `제 ${ep.number}화: ${ep.direction || '제목 없음'}`,
          description: `${ep.content ? ep.content.length.toLocaleString() : 0}자 · ${ep.status === 'completed' ? '탈고' : ep.status === 'revision' ? '퇴고' : '초안'}`,
          icon: <FileText className="w-4 h-4 text-slate-400" />,
          action: () => {
            onNavigate('workspace');
            if (onSelectEpisode) {
              onSelectEpisode(ep.id);
            }
            onClose();
          }
        });
      });
    }

    return list;
  }, [episodes, onNavigate, onClose, onSelectEpisode, show3D, onToggle3D]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const query = search.toLowerCase();
    return commands.filter(
      cmd => cmd.title.toLowerCase().includes(query) || 
             cmd.category.toLowerCase().includes(query) ||
             (cmd.description && cmd.description.toLowerCase().includes(query))
    );
  }, [commands, search]);

  // Keyboard navigation within list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Command Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-[#090b14]/95 border border-white/[0.12] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-10 text-slate-100"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
            <Search className="w-5 h-5 text-amber-400 shrink-0" />
            <input 
              type="text"
              autoFocus
              placeholder="무엇을 찾으시나요? (예: 1화, 설정, 3D 토글, 새 회차...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="w-full bg-transparent text-[15px] font-medium text-white placeholder:text-slate-500 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/[0.08]">
              ESC
            </kbd>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-[14px]">
                일치하는 명령어 또는 회차가 없습니다.
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                const prevCat = idx > 0 ? filteredCommands[idx - 1].category : null;
                const showCategory = prevCat !== cmd.category;

                return (
                  <React.Fragment key={cmd.id}>
                    {showCategory && (
                      <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {cmd.category}
                      </div>
                    )}
                    <button
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                        isSelected 
                          ? 'bg-amber-400/10 text-amber-200 border border-amber-400/20 shadow-sm' 
                          : 'text-slate-300 hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-amber-400/20' : 'bg-white/[0.04]'}`}>
                          {cmd.icon}
                        </div>
                        <div className="truncate">
                          <div className={`text-[13px] font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {cmd.title}
                          </div>
                          {cmd.description && (
                            <div className="text-[11px] text-slate-400 truncate">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {cmd.shortcut && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.06]">
                            {cmd.shortcut}
                          </span>
                        )}
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'opacity-100 translate-x-0.5 text-amber-400' : 'opacity-0'}`} />
                      </div>
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] text-slate-400 font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] text-slate-400 font-mono">↓</kbd>
                이동
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] text-slate-400 font-mono">Enter</kbd>
                선택
              </span>
            </div>
            <span className="font-mono text-slate-400">NovelCraft AI Hub</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
