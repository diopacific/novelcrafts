import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Scale, Lightbulb, Copy, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '../../lib/toast';

export interface BibleAuditResult {
  commercialScore: number;
  summary: string;
  strengths: string[];
  plotHoles: string[];
  balanceWarning: string;
  recommendations: string[];
}

interface BibleAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: BibleAuditResult | null;
  onReaudit: () => void;
}

export const BibleAuditModal: React.FC<BibleAuditModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  result,
  onReaudit,
}) => {
  if (!isOpen) return null;

  const handleCopyReport = () => {
    if (!result) return;
    const text = `[웹소설 메인 CP 설정 정합성 진단 리포트]
■ 상업적 잠재력 점수: ${result.commercialScore}점 / 100점
■ 총평: ${result.summary}

[1. 핵심 강점 및 매력 요소]
${result.strengths.map(s => `• ${s}`).join('\n')}

[2. 잠재적 설정 충돌 및 개연성 위험 (Plot Holes)]
${result.plotHoles.map(p => `⚠️ ${p}`).join('\n')}

[3. 파워 밸런스 및 인플레이션 경고]
⚖️ ${result.balanceWarning}

[4. 연재 성공을 위한 실전 제안]
${result.recommendations.map(r => `💡 ${r}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    toast.success('진단 리포트가 클립보드에 복사되었습니다.');
  };

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
        className="relative w-full max-w-3xl bg-[#080b18]/95 border border-white/[0.1] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI 설정 정합성 및 개연성 진단</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono border border-violet-500/30">
                  CP AUDIT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                연재 중 흔히 터지는 설정 구멍(Plot Hole)과 파워 붕괴 위험을 메인 CP 관점에서 조기 검출합니다.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#060814]/60">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 animate-pulse">
                <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                작품 설정집 전체를 정밀 분석하는 중입니다...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                로그라인, 세계관 규칙, 스킬 시스템, 인물 관계도 간의 모순과 개연성 충돌을 종합 검토하고 있습니다.
              </p>
            </div>
          ) : result ? (
            <>
              {/* Score & Summary Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-amber-500/5 to-transparent border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    총평 & 기획 완성도
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed max-w-lg">
                    {result.summary}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">상업 잠재력 점수</span>
                  <div className="text-3xl font-black text-amber-400 tracking-tight flex items-baseline gap-1">
                    {result.commercialScore}
                    <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Grid: Strengths & Plot Holes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>핵심 강점 & 독자 매력 포인트</span>
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plot Holes (Warnings) */}
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>주의할 설정 충돌 (Plot Holes)</span>
                  </h4>
                  <ul className="space-y-2">
                    {result.plotHoles.map((hole, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                        <span>{hole}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Power Balance Warning */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span>파워 밸런스 & 성장 인플레이션 가이드</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.balanceWarning}
                </p>
              </div>

              {/* Practical Recommendations */}
              <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-3">
                <h4 className="text-xs font-bold text-violet-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-violet-400" />
                  <span>연재 성공을 위한 메인 CP 실전 제안</span>
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-violet-400 font-bold shrink-0">👉</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.02] shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReaudit}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            다시 진단하기
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyReport}
              disabled={isLoading || !result}
              className="bg-white/[0.04] border-white/[0.1] text-slate-200 hover:bg-white/[0.08] text-xs"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" /> 리포트 복사
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-bold"
            >
              닫기
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
