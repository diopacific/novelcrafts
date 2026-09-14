import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Eye, MessageSquareQuote, Wand2, X, Check, Copy, ArrowRight, Loader2, Send } from 'lucide-react';
import { toast } from '../../lib/toast';

export type AiCorrectionMode = 'polish' | 'tension' | 'sensory' | 'dialogue';

interface InlineAiToolbarProps {
  selectedText: string;
  isCorrecting: boolean;
  suggestions: string[];
  showUI: boolean;
  onClose: () => void;
  onRequestCorrection: (mode: AiCorrectionMode, customInstruction?: string) => Promise<void>;
  onApplyCorrection: (suggestion: string) => void;
}

const MODES: { id: AiCorrectionMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'polish', label: '윤문 다듬기', icon: <Wand2 className="w-3.5 h-3.5" />, desc: '자연스러운 문맥과 비문 교정' },
  { id: 'tension', label: '텐션 강화', icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, desc: '사이다 전개 및 긴장감 극대화' },
  { id: 'sensory', label: '감각적 묘사', icon: <Eye className="w-3.5 h-3.5 text-sky-400" />, desc: '시각·청각·촉각의 생생한 묘사' },
  { id: 'dialogue', label: '대사 맛 살리기', icon: <MessageSquareQuote className="w-3.5 h-3.5 text-purple-400" />, desc: '캐릭터 어조와 티키타카 극대화' },
];

export const InlineAiToolbar: React.FC<InlineAiToolbarProps> = ({
  selectedText,
  isCorrecting,
  suggestions,
  showUI,
  onClose,
  onRequestCorrection,
  onApplyCorrection
}) => {
  const [activeMode, setActiveMode] = useState<AiCorrectionMode>('polish');
  const [customInstruction, setCustomInstruction] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!selectedText.trim() && !showUI) return null;

  const handleModeClick = (mode: AiCorrectionMode) => {
    setActiveMode(mode);
    onRequestCorrection(mode, customInstruction.trim() || undefined);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInstruction.trim()) return;
    onRequestCorrection(activeMode, customInstruction.trim());
  };

  return (
    <div className="relative z-30">
      {/* Floating Action Pill Toolbar (Appears when text is highlighted) */}
      {!showUI && selectedText.trim().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#090d16]/95 backdrop-blur-2xl border border-amber-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center gap-1 px-2 text-xs font-bold text-amber-400 border-r border-white/[0.1] mr-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 코파일럿</span>
          </div>

          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeClick(m.id)}
              disabled={isCorrecting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.04] hover:bg-amber-500/20 hover:border-amber-500/30 border border-transparent transition-all active:scale-95"
              title={m.desc}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}

          <button
            onClick={() => {
              setShowCustomInput(!showCustomInput);
              if (!showCustomInput) {
                onRequestCorrection(activeMode);
              }
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/[0.06] transition-colors ml-1"
            title="직접 요청 프롬프트"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Suggestion Popover Modal / Overlay */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            className="w-full max-w-2xl bg-[#070a14]/95 backdrop-blur-2xl border border-white/[0.12] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>AI 웹소설 코파일럿</span>
                    <span className="text-[11px] font-medium text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {MODES.find(m => m.id === activeMode)?.label}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    선택한 문장을 웹소설 연재 문체로 재구성합니다.
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleModeClick(m.id)}
                    disabled={isCorrecting}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeMode === m.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label.split(' ')[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Instruction Bar */}
            <form onSubmit={handleCustomSubmit} className="px-5 py-2.5 bg-black/40 border-b border-white/[0.06] flex items-center gap-2">
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="추가 지시사항 입력 (예: 더 건방진 말투로, 피 냄새를 강조해줘)"
                className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={isCorrecting || !customInstruction.trim()}
                className="px-3 py-1 bg-white/[0.08] hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
              >
                재생성
              </button>
            </form>

            {/* Content Body */}
            <div className="p-5 max-h-[360px] overflow-y-auto custom-scrollbar space-y-3">
              {/* Original Preview */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">원문</span>
                <p className="text-slate-300 italic leading-relaxed line-clamp-3">
                  "{selectedText}"
                </p>
              </div>

              {/* Loader */}
              {isCorrecting && (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-xs font-medium">웹소설 문장을 창작하는 중...</span>
                </div>
              )}

              {/* Suggestions List */}
              {!isCorrecting && suggestions.length > 0 && (
                <div className="space-y-2.5">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-black text-[11px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">추천안</span>
                        </div>

                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(sug);
                              toast.success('제안 문장이 복사되었습니다.');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                            title="복사"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onApplyCorrection(sug)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>본문에 적용</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-slate-100 leading-relaxed pl-7">
                        {sug}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!isCorrecting && suggestions.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  제안을 생성하지 못했습니다. 다시 시도해주세요.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
