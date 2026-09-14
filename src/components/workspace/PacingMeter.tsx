import React, { useMemo } from 'react';
import { Sparkles, Clock, MessageSquareQuote, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PacingMeterProps {
  content: string;
  targetLength?: number;
}

export const PacingMeter: React.FC<PacingMeterProps> = ({ content, targetLength = 5500 }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const stats = useMemo(() => {
    const text = content || '';
    const totalChars = text.length;
    const noSpaceChars = text.replace(/\s/g, '').length;

    // Detect dialogue enclosed in standard Korean web novel quote marks: ", “, 「
    const dialogueMatches: string[] = text.match(/(["“「][^"”」\n]+["”」])/g) || [];
    const dialogueChars: number = dialogueMatches.reduce((acc: number, str: string) => acc + str.replace(/["“「”」\s]/g, '').length, 0);
    
    const dialogueRatio = noSpaceChars > 0 ? Math.min(100, Math.round((dialogueChars / noSpaceChars) * 100)) : 0;
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const avgParaLength = paragraphs.length > 0 ? Math.round(totalChars / paragraphs.length) : 0;
    
    // Standard web novel reading speed ~ 500-600 characters per minute
    const readingTimeMin = Math.max(1, Math.ceil(totalChars / 550));
    
    // Web novel standard target
    const targetPercentage = Math.min(100, Math.round((totalChars / targetLength) * 100));

    let pacingBadge = {
      label: '집필 대기',
      color: 'text-slate-400 bg-white/[0.04] border-white/[0.08]',
      tip: '독자를 몰입시킬 첫 문장을 작성해보세요.'
    };

    if (totalChars >= 300) {
      if (dialogueRatio >= 22 && dialogueRatio <= 45) {
        pacingBadge = {
          label: '황금 밸런스 ✨',
          color: 'text-amber-300 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
          tip: '대화와 지문의 비율이 웹소설 연재에 가장 이상적인 호흡입니다.'
        };
      } else if (dialogueRatio < 22) {
        pacingBadge = {
          label: '지문 중심 📜',
          color: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
          tip: '상황 설명이 많습니다. 인물 간 티키타카 대화를 2~3줄 추가하면 가독성이 높아집니다.'
        };
      } else {
        pacingBadge = {
          label: '쾌속 대화 ⚡',
          color: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
          tip: '대사 비중이 매우 높아 박진감이 넘칩니다. 인물의 감정 표정이나 배경 묘사를 약간 보강해보세요.'
        };
      }
    }

    return {
      totalChars,
      noSpaceChars,
      dialogueRatio,
      paragraphsCount: paragraphs.length,
      avgParaLength,
      readingTimeMin,
      targetPercentage,
      pacingBadge
    };
  }, [content]);

  return (
    <div className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3 sm:p-4 text-slate-200 shadow-lg shadow-black/20">
      {/* Top Bar Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Counts */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {stats.totalChars.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">자</span>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline ml-1">
              (공백 제외 {stats.noSpaceChars.toLocaleString()}자)
            </span>
          </div>

          <div className="h-4 w-px bg-white/[0.1] hidden sm:block" />

          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${stats.pacingBadge.color}`}>
            <span>{stats.pacingBadge.label}</span>
          </div>
        </div>

        {/* Right: Target & Toggle */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Target 5,500 Gauge */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              연재 권장 (5,500자)
            </span>
            <div className="w-24 h-2 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.05]">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  stats.totalChars >= 5500 
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' 
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500'
                }`}
                style={{ width: `${stats.targetPercentage}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">
              {stats.targetPercentage}%
            </span>
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg border border-white/[0.06] transition-colors"
          >
            <span>호흡 분석</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Realtime Analytics */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-3 mt-3 border-t border-white/[0.06]"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Dialogue Ratio */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
                  <span>대화 비중</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-white">{stats.dialogueRatio}%</span>
                  <span className="text-[10px] text-slate-400">권장 25~40%</span>
                </div>
              </div>

              {/* Reading Time */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>예상 완독 시간</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-white">약 {stats.readingTimeMin}분</span>
                  <span className="text-[10px] text-slate-400">550자/분 기준</span>
                </div>
              </div>

              {/* Paragraphs Count */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>단락 수</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-white">{stats.paragraphsCount}단락</span>
                  <span className="text-[10px] text-slate-400">평균 {stats.avgParaLength}자/문단</span>
                </div>
              </div>

              {/* Pacing Advice */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>웹소설 연재 팁</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {stats.pacingBadge.tip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
