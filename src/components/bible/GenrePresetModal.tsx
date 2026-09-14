import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { GENRE_PRESETS, GenrePreset } from '../../data/genrePresets';
import { BibleState } from '../../types';
import { Button } from '../ui/button';
import { toast } from '../../lib/toast';

interface GenrePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  bible: BibleState;
  setBible: (newBible: BibleState) => void;
}

export const GenrePresetModal: React.FC<GenrePresetModalProps> = ({
  isOpen,
  onClose,
  bible,
  setBible,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<GenrePreset>(GENRE_PRESETS[0]);
  const [activePreviewTab, setActivePreviewTab] = useState<'logline' | 'story' | 'world' | 'system' | 'character' | 'structure'>('logline');

  if (!isOpen) return null;

  const handleApplyPreset = (mode: 'fill_empty' | 'overwrite') => {
    const updated: BibleState = { ...bible };

    const keys: (keyof GenrePreset & keyof BibleState)[] = [
      'logline', 'story', 'world', 'system', 'character', 'villain', 'item', 'timeline', 'structure', 'episode'
    ];

    let appliedCount = 0;
    keys.forEach(k => {
      const presetVal = selectedPreset[k];
      if (typeof presetVal === 'string' && presetVal.trim()) {
        if (mode === 'overwrite' || !updated[k] || (updated[k] as string).trim().length === 0) {
          (updated[k] as any) = presetVal;
          appliedCount++;
        }
      }
    });

    setBible(updated);
    toast.success(`'${selectedPreset.name}' 프리셋이 성공적으로 적용되었습니다. (${appliedCount}개 탭 반영)`);
    onClose();
  };

  const previewContent = selectedPreset[activePreviewTab] || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-4xl bg-[#080b18]/95 border border-white/[0.1] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>장르별 공인 설정 프리셋</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-400/30">
                  STARTER
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                대한민국 웹소설 트렌드에 최적화된 기승전결과 상태창, 로그라인 구조를 원클릭으로 장착하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Preset Selector Sidebar */}
          <div className="md:col-span-4 border-r border-white/[0.08] p-4 overflow-y-auto custom-scrollbar space-y-2.5 bg-black/20">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              추천 장르 목록
            </div>
            {GENRE_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{preset.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-white/[0.06] text-slate-400 border border-white/[0.08]'
                    }`}>
                      {preset.badge}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-100">
                    {preset.name}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Preset Preview & Details */}
          <div className="md:col-span-8 p-5 flex flex-col overflow-hidden bg-[#060814]/60">
            {/* Header description of selected */}
            <div className="mb-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedPreset.icon}</span>
                <h3 className="font-bold text-sm text-white">{selectedPreset.name}</h3>
              </div>
              <p className="text-xs text-slate-400">{selectedPreset.description}</p>
            </div>

            {/* Preview Sub-tabs */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 custom-scrollbar shrink-0">
              {[
                { id: 'logline', label: '로그라인' },
                { id: 'story', label: '기승전결' },
                { id: 'system', label: '치트/능력' },
                { id: 'world', label: '세계관' },
                { id: 'character', label: '인물' },
                { id: 'structure', label: '집필규칙' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activePreviewTab === tab.id
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Preview Content Area */}
            <div className="flex-1 bg-black/40 border border-white/[0.08] rounded-2xl p-4 overflow-y-auto custom-scrollbar font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-amber-400/30">
              {previewContent}
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>기존 작성된 설정을 안전하게 보존할 수 있습니다.</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyPreset('fill_empty')}
                  className="bg-white/[0.04] border-white/[0.12] text-slate-200 hover:bg-white/[0.08] text-xs h-9"
                >
                  빈 항목만 채우기
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (confirm(`'${selectedPreset.name}' 프리셋으로 전체 설정 탭을 덮어씌우시겠습니까?`)) {
                      handleApplyPreset('overwrite');
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-9 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  전체 적용하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
