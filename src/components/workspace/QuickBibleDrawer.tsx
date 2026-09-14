import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, X, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { BibleState } from '../../types';
import { toast } from '../../lib/toast';

interface QuickBibleDrawerProps {
  bible: BibleState;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBible?: () => void;
}

export const QuickBibleDrawer: React.FC<QuickBibleDrawerProps> = ({
  bible,
  isOpen,
  onClose,
  onNavigateToBible
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sections = useMemo(() => {
    const defaultSections = [
      { key: 'logline', title: '핵심 / 로그라인', icon: '🎯', content: bible.logline },
      { key: 'story', title: '스토리 줄거리', icon: '📖', content: bible.story },
      { key: 'world', title: '세계관 & 장소', icon: '🌍', content: bible.world },
      { key: 'system', title: '능력 & 상태창 시스템', icon: '⚡', content: bible.system },
      { key: 'item', title: '아이템 & 유물', icon: '🗡️', content: bible.item },
      { key: 'character', title: '주요 등장인물', icon: '👤', content: bible.character },
      { key: 'villain', title: '빌런 & 적대 세력', icon: '💀', content: bible.villain },
      { key: 'timeline', title: '연표 & 사건 타임라인', icon: '⏳', content: bible.timeline },
      { key: 'structure', title: '집필 원칙 & 연재 플롯', icon: '📜', content: bible.structure },
      { key: 'episode', title: '에피소드 아이디어', icon: '💡', content: bible.episode }
    ];

    const customSections = (bible.customTabs || []).map((t, idx) => ({
      key: `custom-${idx}`,
      title: t.label,
      icon: '✨',
      content: t.content
    }));

    return [...defaultSections, ...customSections];
  }, [bible]);

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const lower = searchTerm.toLowerCase();
    return sections.filter(s => 
      s.title.toLowerCase().includes(lower) || 
      (s.content && s.content.toLowerCase().includes(lower))
    );
  }, [sections, searchTerm]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('설정 내용이 복사되었습니다.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Drawer Container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[#070a14]/95 backdrop-blur-2xl border-l border-white/[0.1] z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>설정집 퀵 뷰어</span>
                    <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Bible
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    원고 작성 중 실시간 설정 참조
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onNavigateToBible && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToBible();
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/[0.06] transition-colors"
                    title="설정 공장 전체 화면으로 이동"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Instant Search Bar */}
            <div className="p-4 border-b border-white/[0.06] bg-black/20">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="등장인물, 스킬, 지명, 복선 검색..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-amber-500/50 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Sections */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3.5">
              {filteredSections.map((section) => (
                <div
                  key={section.key}
                  className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300/90 flex items-center gap-1.5">
                      <span>{section.icon}</span>
                      <span>{section.title}</span>
                    </span>

                    {section.content && (
                      <button
                        onClick={() => handleCopy(section.content, section.key)}
                        className="opacity-60 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2 py-1 rounded-lg transition-all"
                      >
                        {copiedKey === section.key ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>복사</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {section.content ? (
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar font-medium bg-black/20 p-3 rounded-xl border border-white/[0.04]">
                      {section.content}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600 italic py-1">
                      설정이 비어있습니다.
                    </div>
                  )}
                </div>
              ))}

              {filteredSections.length === 0 && (
                <div className="py-16 text-center text-xs text-slate-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
