import React, { useRef, useMemo, useState, memo } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { 
  Download, Upload, Trash2, Database, BarChart3, FileText, 
  CheckCircle2, BookOpen, Eye, Clock, Sparkles, AlertTriangle, 
  Check, Copy 
} from 'lucide-react';
import { toast } from '../lib/toast';
import { motion, AnimatePresence } from 'motion/react';

interface ToolsPanelProps {
  bible: BibleState;
  episodes: Episode[];
  setBible: (bible: BibleState) => void;
  setEpisodes: (episodes: Episode[]) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 350, damping: 28 } }
};

export const ToolsPanel = memo(function ToolsPanel({ bible, episodes, setBible, setEpisodes }: ToolsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exportScope, setExportScope] = useState<'all' | 'bible' | 'episodes'>('all');
  const [exportFormat, setExportFormat] = useState<'txt' | 'md'>('md');
  const [showPreview, setShowPreview] = useState(false);

  const generateExportContent = () => {
    let output = "";
    const isMd = exportFormat === 'md';

    if (exportScope === 'all' || exportScope === 'bible') {
      if (isMd) {
        output += "# 작품 설정집 (Novel Bible)\n\n";
        output += `## 1. 핵심 로그라인\n${bible.logline || '미작성'}\n\n`;
        output += `## 2. 스토리 플롯\n${bible.story || '미작성'}\n\n`;
        output += `## 3. 세계관 및 장소\n${bible.world || '미작성'}\n\n`;
        output += `## 4. 능력 및 상태창 시스템\n${bible.system || '미작성'}\n\n`;
        output += `## 5. 인물 및 캐릭터\n${bible.character || '미작성'}\n\n`;
        output += `## 6. 빌런 및 적대 세력\n${bible.villain || '미작성'}\n\n`;
        output += `## 7. 아이템 및 유물\n${bible.item || '미작성'}\n\n`;
        output += `## 8. 연표 및 타임라인\n${bible.timeline || '미작성'}\n\n`;
        output += `## 9. 집필 지침\n${bible.structure || '미작성'}\n\n`;
        output += `## 10. 에피소드 아이디어\n${bible.episode || '미작성'}\n\n`;
        if (bible.customTabs && bible.customTabs.length > 0) {
          bible.customTabs.forEach(ct => {
            output += `## [커스텀] ${ct.label}\n${ct.content || '미작성'}\n\n`;
          });
        }
        output += "---\n\n";
      } else {
        output += "=== 작품 설정 공장 (Bible) ===\n\n";
        output += `[핵심/로그라인]\n${bible.logline || '미작성'}\n\n`;
        output += `[스토리 플롯]\n${bible.story || '미작성'}\n\n`;
        output += `[세계관]\n${bible.world || '미작성'}\n\n`;
        output += `[능력/시스템]\n${bible.system || '미작성'}\n\n`;
        output += `[캐릭터]\n${bible.character || '미작성'}\n\n`;
        output += `[빌런]\n${bible.villain || '미작성'}\n\n`;
        output += `[아이템]\n${bible.item || '미작성'}\n\n`;
        output += `[타임라인]\n${bible.timeline || '미작성'}\n\n`;
        output += `[집필지침]\n${bible.structure || '미작성'}\n\n`;
        output += `[에피소드]\n${bible.episode || '미작성'}\n\n`;
        output += "===============================\n\n";
      }
    }

    if (exportScope === 'all' || exportScope === 'episodes') {
      episodes.forEach(ep => {
        if (isMd) {
          output += `## 제 ${ep.number} 화: ${ep.direction || '무제'}\n\n${ep.content}\n\n`;
          if (ep.authorNote) {
            output += `> **작가의 말:** ${ep.authorNote}\n\n`;
          }
        } else {
          output += `\n\n[제 ${ep.number} 화] ${ep.direction || ''}\n\n${ep.content}\n\n`;
          if (ep.authorNote) {
            output += `(작가의 말: ${ep.authorNote})\n\n`;
          }
        }
      });
    }

    return output;
  };

  const handleExportCustom = () => {
    const content = generateExportContent();
    const extension = exportFormat === 'md' ? 'md' : 'txt';
    const mimeType = exportFormat === 'md' ? 'text/markdown' : 'text/plain';
    const prefix = exportScope === 'all' ? 'novel_full' : exportScope === 'bible' ? 'novel_bible' : 'novel_episodes';
    
    downloadBlob(content, `${prefix}_${new Date().toISOString().slice(0, 10)}.${extension}`, mimeType);
    toast.success('원고 파일 다운로드가 시작되었습니다.');
  };

  const handleCopyCustom = async () => {
    const content = generateExportContent();
    try {
      await navigator.clipboard.writeText(content);
      toast.success('선택한 원고 내용이 클립보드에 복사되었습니다.');
    } catch (err) {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  const handleExportJson = () => {
    const data = JSON.stringify({ bible, episodes }, null, 2);
    downloadBlob(data, `novelcraft_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    toast.success('프로젝트 통합 백업 파일이 저장되었습니다.');
  };

  const downloadBlob = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          if (parsed.bible !== undefined || parsed.episodes !== undefined) {
            if (confirm('현재 작업 중인 데이터가 백업 파일 내용으로 덮어씌워집니다. 복원을 계속 진행하시겠습니까?')) {
              if (parsed.bible) setBible(parsed.bible);
              if (parsed.episodes) setEpisodes(parsed.episodes);
              toast.success('프로젝트가 성공적으로 복원되었습니다.');
            }
          } else {
            toast.error('호환되지 않는 백업 파일 형식입니다. (bible 또는 episodes 필드 누락)');
          }
        } else {
          toast.error('올바른 JSON 파일 형식이 아닙니다.');
        }
      } catch (error) {
        toast.error('파일을 읽는 도중 오류가 발생했습니다. 파일이 손상되었을 수 있습니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAll = () => {
    const confirmText = window.prompt('설정집과 모든 집필 회차가 영구 삭제됩니다.\n정말 초기화하시려면 아래에 "초기화"라고 정확히 입력해주세요.');
    if (confirmText === '초기화') {
      setBible({
        logline: '', story: '', world: '', system: '', character: '', villain: '', structure: '', episode: '', item: '', timeline: '', customTabs: []
      });
      setEpisodes([]);
      toast.success('데이터가 초기화되었습니다.');
    } else if (confirmText !== null) {
      toast.info('확인 문구가 일치하지 않아 취소되었습니다.');
    }
  };

  const totalCharacters = useMemo(() => episodes.reduce((acc, ep) => acc + ep.content.length, 0), [episodes]);
  const totalCharactersNoSpaces = useMemo(() => episodes.reduce((acc, ep) => acc + ep.content.replace(/\s/g, '').length, 0), [episodes]);
  const avgCharacters = useMemo(() => episodes.length > 0 ? Math.round(totalCharacters / episodes.length) : 0, [episodes.length, totalCharacters]);
  
  // Reading time (approx 500 chars per min)
  const estimatedReadingMinutes = useMemo(() => Math.round(totalCharacters / 500), [totalCharacters]);

  // Launch target (Standard serialization launch: 150,000 characters ~ 25 episodes)
  const MILESTONE_TARGET = 150000;
  const progressPercent = useMemo(() => Math.min(100, Math.round((totalCharacters / MILESTONE_TARGET) * 100)), [totalCharacters]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#05060a] overflow-y-auto w-full custom-scrollbar text-slate-100">
      {/* Header */}
      <header className="h-16 shrink-0 bg-[#070913]/90 backdrop-blur-xl border-b border-white/[0.08] px-6 md:px-8 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>데이터 관리 & 원고 내보내기</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                BACKUP & EXPORT
              </span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6"
      >
        {/* 통계 섹션 */}
        <motion.section 
          variants={itemVariants} 
          className="bg-[#070913]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">작품 집필 규모 & 통계</h2>
                <p className="text-xs text-slate-400 mt-0.5">현재까지 축적된 원고의 분량과 독자 예상 소요 시간을 분석합니다.</p>
              </div>
            </div>
          </div>
          
          {/* Stat Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl relative overflow-hidden group hover:border-amber-400/30 transition-colors">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">누적 연재 회차</span>
              <div className="text-2xl font-black text-white flex items-baseline gap-1">
                {episodes.length} <span className="text-xs font-normal text-slate-500">화</span>
              </div>
              <BookOpen className="w-12 h-12 absolute -right-2 -bottom-2 text-white/[0.03] group-hover:text-amber-400/10 transition-colors pointer-events-none" />
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl group hover:border-amber-400/30 transition-colors">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">총 글자 수 (공백 포함)</span>
              <div className="text-2xl font-black text-amber-300 flex items-baseline gap-1">
                {totalCharacters.toLocaleString()} <span className="text-xs font-normal text-slate-500">자</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl group hover:border-amber-400/30 transition-colors">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">회차당 평균 분량</span>
              <div className="text-2xl font-black text-white flex items-baseline gap-1">
                {avgCharacters.toLocaleString()} <span className="text-xs font-normal text-slate-500">자/화</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl group hover:border-amber-400/30 transition-colors">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">예상 완독 시간</span>
              <div className="text-2xl font-black text-emerald-400 flex items-baseline gap-1">
                {estimatedReadingMinutes} <span className="text-xs font-normal text-slate-500">분</span>
              </div>
            </div>
          </div>

          {/* Progress Goal Banner */}
          <div className="bg-gradient-to-br from-amber-500/10 via-violet-500/5 to-transparent rounded-2xl border border-amber-500/20 p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <div>
                <span className="text-xs font-bold text-amber-300 block mb-0.5">
                  플랫폼 유료 연재 런칭 기준 달성률 (15만자 목표)
                </span>
                <span className="text-[11px] text-slate-400">
                  웹소설 1권 분량(약 25화, 15만자) 기준 진행도입니다. 현재 {totalCharacters.toLocaleString()} / 150,000자
                </span>
              </div>
              <span className="text-lg font-black text-amber-300 bg-white/[0.05] border border-amber-400/30 px-3 py-1 rounded-xl shrink-0">
                {progressPercent}%
              </span>
            </div>
            
            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.08]">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </motion.section>

        {/* 내보내기 (Export) 섹션 */}
        <motion.section 
          variants={itemVariants} 
          className="bg-[#070913]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">원고 내보내기 (Export)</h2>
              <p className="text-xs text-slate-400 mt-0.5">작업한 설정집과 회차를 마크다운 또는 텍스트 파일로 추출합니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
            {/* Scope Selection */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                추출 범위
              </div>
              <div className="flex flex-col gap-2">
                {(['all', 'bible', 'episodes'] as const).map((scope) => (
                  <label 
                    key={scope} 
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                      exportScope === scope 
                        ? 'bg-amber-400/10 border-amber-400/40 text-amber-200 shadow-sm' 
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={exportScope === scope} 
                      onChange={() => setExportScope(scope)} 
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      exportScope === scope ? 'border-amber-400' : 'border-slate-600'
                    }`}>
                      {exportScope === scope && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                    </div>
                    <span className="font-semibold text-xs">
                      {scope === 'all' ? '전체 내보내기 (설정 + 전 회차)' : scope === 'bible' ? '설정집만 내보내기' : '작성된 회차만 내보내기'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                파일 형식
              </div>
              <div className="flex flex-col gap-2">
                {(['md', 'txt'] as const).map((format) => (
                  <label 
                    key={format} 
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                      exportFormat === format 
                        ? 'bg-amber-400/10 border-amber-400/40 text-amber-200 shadow-sm' 
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={exportFormat === format} 
                      onChange={() => setExportFormat(format)} 
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      exportFormat === format ? 'border-amber-400' : 'border-slate-600'
                    }`}>
                      {exportFormat === format && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                    </div>
                    <span className="font-semibold text-xs">
                      {format === 'md' ? '마크다운 형식 (.md) - 노션/옵시디언 호환' : '일반 텍스트 (.txt) - 메모장/플랫폼 복사용'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)} 
              className={`bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] h-10 px-4 rounded-xl text-xs font-semibold ${
                showPreview ? 'border-amber-400/40 text-amber-300' : ''
              }`}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" /> 미리보기
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCopyCustom} 
              className="bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] h-10 px-4 rounded-xl text-xs font-semibold"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" /> 클립보드 복사
            </Button>
            <Button 
              onClick={handleExportCustom} 
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 h-10 px-5 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> 파일 다운로드
            </Button>
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-black/50 rounded-2xl p-4 border border-white/[0.08] relative">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      PREVIEW - {exportScope} / .{exportFormat}
                    </span>
                    <button 
                      onClick={() => setShowPreview(false)}
                      className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                      접기
                    </button>
                  </div>
                  <pre className="text-slate-300 font-mono text-xs leading-relaxed max-h-64 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                    {generateExportContent() || "내보낼 내용이 없습니다."}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 통합 백업 및 복구 섹션 */}
        <motion.section 
          variants={itemVariants} 
          className="bg-[#070913]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">프로젝트 통합 백업 & 복원</h2>
              <p className="text-xs text-slate-400 mt-0.5">설정집과 모든 회차를 단일 JSON 파일로 안전하게 추출하거나 복원합니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between gap-3 hover:border-emerald-500/30 transition-colors">
              <div>
                <h3 className="font-bold text-xs text-white mb-1">로컬 JSON 백업 다운로드</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  프로젝트 전체 상태를 파일로 보관합니다. 다른 기기로 옮기거나 소장용으로 보관할 때 사용하세요.
                </p>
              </div>
              <Button 
                onClick={handleExportJson} 
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold h-10 rounded-xl mt-2"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> 백업 파일 (.json) 저장
              </Button>
            </div>
            
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between gap-3 hover:border-white/[0.12] transition-colors">
              <div>
                <h3 className="font-bold text-xs text-white mb-1">백업 파일 (.json) 복원</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  보관 중인 JSON 백업 파일을 업로드하여 데이터를 원상 복구합니다. <span className="text-rose-400 font-semibold">현재 데이터는 덮어씌워집니다.</span>
                </p>
              </div>
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] text-xs font-semibold h-10 rounded-xl mt-2"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" /> 백업 파일 불러오기
              </Button>
            </div>
          </div>
        </motion.section>

        {/* 위험 구역 (Danger Zone) */}
        <motion.section 
          variants={itemVariants} 
          className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-rose-300 tracking-tight">데이터 초기화 (Danger Zone)</h2>
                <p className="text-xs text-rose-300/70 mt-0.5">현재 프로젝트의 모든 설정집과 집필 회차를 영구적으로 비웁니다.</p>
              </div>
            </div>
            
            <Button 
              onClick={handleResetAll} 
              variant="destructive" 
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold h-10 px-5 rounded-xl shrink-0"
            >
              모든 데이터 초기화
            </Button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
});
