import React, { useRef, useMemo, useState, memo } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Download, Upload, Trash2, Database, BarChart3, FileText, CheckCircle2, BookOpen, Eye } from 'lucide-react';
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
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
        output += "# 작품 설정집\n\n";
        output += `## 로그라인\n${bible.logline}\n\n## 스토리\n${bible.story}\n\n## 세계관\n${bible.world || ''}\n\n## 능력\n${bible.system}\n\n## 캐릭터\n${bible.character}\n\n## 빌런\n${bible.villain}\n\n## 집필지침\n${bible.structure}\n\n## 에피소드\n${bible.episode}\n\n`;
        output += "---\n\n";
      } else {
        output += "=== 설정 공장 ===\n\n";
        output += `[핵심/로그라인]\n${bible.logline}\n\n[스토리]\n${bible.story}\n\n[세계관]\n${bible.world || ''}\n\n[능력]\n${bible.system}\n\n[캐릭터]\n${bible.character}\n\n[빌런]\n${bible.villain}\n\n[집필지침]\n${bible.structure}\n\n[에피소드]\n${bible.episode}\n\n`;
        output += "===================\n\n";
      }
    }

    if (exportScope === 'all' || exportScope === 'episodes') {
      episodes.forEach(ep => {
        if (isMd) {
          output += `## 제 ${ep.number} 화\n\n${ep.content}\n\n`;
        } else {
          output += `\n\n제 ${ep.number} 화\n\n${ep.content}\n\n`;
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
  };

  const handleCopyCustom = async () => {
    const content = generateExportContent();
    try {
      await navigator.clipboard.writeText(content);
      toast.success('선택한 내용이 클립보드에 복사되었습니다.');
    } catch (err) {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  const handleExportJson = () => {
    const data = JSON.stringify({ bible, episodes }, null, 2);
    downloadBlob(data, `novel_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
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
             if (confirm('현재 작성된 데이터가 덮어씌워집니다. 계속하시겠습니까?')) {
               if (parsed.bible) setBible(parsed.bible);
               if (parsed.episodes) setEpisodes(parsed.episodes);
               toast.success('성공적으로 복구되었습니다.');
             }
          } else {
             toast.error('호환되지 않는 백업 파일 형식입니다. (bible 또는 episodes 필드 누락)');
          }
        } else {
          toast.error('올바른 JSON 형식이 아닙니다.');
        }
      } catch (error) {
        toast.error('파일을 파싱하는 중 오류가 발생했습니다. 파일이 손상되었을 수 있습니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAll = () => {
    const confirmText = window.prompt('설정집과 모든 회차가 삭제됩니다. 이 작업은 되돌릴 수 없습니다. \n정말 초기화하시려면 "초기화"라고 입력해주세요.');
    if (confirmText === '초기화') {
      setBible({
        logline: '', story: '', world: '', system: '', character: '', villain: '', structure: '', episode: '', item: '', timeline: '', customTabs: []
      });
      setEpisodes([]);
      toast.success('데이터가 안전하게 초기화되었습니다.');
    } else if (confirmText !== null) {
      toast.info('입력한 텍스트가 일치하지 않아 취소되었습니다.');
    }
  };

  const totalCharacters = useMemo(() => episodes.reduce((acc, ep) => acc + ep.content.length, 0), [episodes]);
  const totalCharactersNoSpaces = useMemo(() => episodes.reduce((acc, ep) => acc + ep.content.replace(/\s/g, '').length, 0), [episodes]);
  const avgCharacters = useMemo(() => episodes.length > 0 ? Math.round(totalCharacters / episodes.length) : 0, [episodes.length, totalCharacters]);
  
  // 집필 목표 달성률 (유료화 기준: 약 15만자)
  const MILESTONE_TARGET = 150000;
  const progressPercent = useMemo(() => Math.min(100, Math.round((totalCharacters / MILESTONE_TARGET) * 100)), [totalCharacters]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto w-full custom-scrollbar">
      <header className="h-[72px] shrink-0 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center shadow-sm z-10 sticky top-0">
        <h1 className="text-xl font-black tracking-tight text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          데이터 관리 및 내보내기
        </h1>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6 md:space-y-8"
      >
        
        {/* 통계 섹션 */}
        <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-slate-800 tracking-tight">작품 집필 통계</h2>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">현재까지 집필된 작품의 규모를 확인합니다.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-wider block mb-1 relative z-10">누적 회차</span>
                <span className="text-3xl font-black text-slate-800 relative z-10 flex items-baseline gap-1">
                  {episodes.length} <span className="text-sm font-bold text-slate-400">화</span>
                </span>
                <BookOpen className="w-16 h-16 absolute -right-2 -bottom-2 text-slate-200/50 group-hover:text-indigo-100/50 transition-colors" />
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-wider block mb-1">총 글자 (공백 포함)</span>
                <span className="text-3xl font-black text-slate-800 flex items-baseline gap-1">
                  {totalCharacters.toLocaleString()} <span className="text-sm font-bold text-slate-400">자</span>
                </span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-wider block mb-1">총 글자 (공백 제외)</span>
                <span className="text-3xl font-black text-indigo-600 flex items-baseline gap-1">
                  {totalCharactersNoSpaces.toLocaleString()} <span className="text-sm font-bold text-indigo-300">자</span>
                </span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-wider block mb-1">회차당 평균 분량</span>
                <span className="text-3xl font-black text-emerald-600 flex items-baseline gap-1">
                  {avgCharacters.toLocaleString()} <span className="text-sm font-bold text-emerald-300">자/화</span>
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50/30 rounded-2xl border border-indigo-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
                <div>
                  <span className="text-[14px] font-black text-indigo-900 block mb-1">유료화 전환 목표 달성률</span>
                  <span className="text-[12px] text-indigo-600/80 font-medium">플랫폼 런칭 기준인 15만자까지 남은 분량입니다.</span>
                </div>
                <span className="text-2xl font-black text-indigo-700 bg-white px-3 py-1 rounded-xl border border-indigo-100 shadow-sm">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-indigo-100 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 내보내기 & 백업 섹션 */}
        <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100/50">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-slate-800 tracking-tight">원고 내보내기 (Export)</h2>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">작업한 원고를 원하는 포맷으로 추출합니다.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
              <div className="space-y-3">
                <div className="text-[12px] font-black text-slate-400 uppercase tracking-wider">추출 범위 선택</div>
                <div className="flex flex-col gap-2">
                  {(['all', 'bible', 'episodes'] as const).map((scope) => (
                    <label key={scope} className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${exportScope === scope ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                      <input type="radio" className="hidden" checked={exportScope === scope} onChange={() => setExportScope(scope)} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${exportScope === scope ? 'border-indigo-600' : 'border-slate-300'}`}>
                        {exportScope === scope && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                      </div>
                      <span className="font-bold text-[13px]">
                        {scope === 'all' ? '전체 내보내기 (설정 + 회차)' : scope === 'bible' ? '설정집만 내보내기' : '작성된 회차만 내보내기'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[12px] font-black text-slate-400 uppercase tracking-wider">파일 형식 선택</div>
                <div className="flex flex-col gap-2">
                  {(['md', 'txt'] as const).map((format) => (
                    <label key={format} className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${exportFormat === format ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                      <input type="radio" className="hidden" checked={exportFormat === format} onChange={() => setExportFormat(format)} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${exportFormat === format ? 'border-indigo-600' : 'border-slate-300'}`}>
                        {exportFormat === format && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                      </div>
                      <span className="font-bold text-[13px]">
                        {format === 'md' ? '마크다운 형식 (.md)' : '일반 텍스트 (.txt)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className={`bg-white border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto h-11 px-6 rounded-xl font-bold tracking-wide text-[13px] ${showPreview ? 'bg-slate-100' : ''}`}>
                <Eye className="w-4 h-4 mr-2" /> 미리보기
              </Button>
              <Button variant="outline" onClick={handleCopyCustom} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto h-11 px-6 rounded-xl font-bold tracking-wide text-[13px]">
                <FileText className="w-4 h-4 mr-2" /> 클립보드에 복사
              </Button>
              <Button onClick={handleExportCustom} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm w-full sm:w-auto h-11 px-6 rounded-xl font-bold tracking-wide text-[13px]">
                <Download className="w-4 h-4 mr-2" /> 다운로드
              </Button>
            </div>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-6"
                >
                  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-inner relative">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md">PREVIEW - {exportScope} / .{exportFormat}</span>
                    </div>
                    <pre className="text-slate-300 font-mono text-[13px] leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                      {generateExportContent() || "내보낼 내용이 없습니다."}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 md:p-8 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-slate-800 tracking-tight">통합 백업 및 복구</h2>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">전체 프로젝트 데이터를 안전하게 보관합니다.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-emerald-100 rounded-2xl p-6 flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">로컬 파일로 백업 (JSON)</h3>
                  <p className="text-[13px] font-medium text-slate-500 leading-relaxed">프로젝트 전체 데이터를 파일로 저장합니다. 다른 기기로 데이터를 옮길 때 사용하세요.</p>
                </div>
                <Button onClick={handleExportJson} className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 mt-auto shadow-sm rounded-xl font-bold text-[13px] h-11">
                  <Download className="w-4 h-4 mr-2" /> 백업 파일 저장
                </Button>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">백업 파일 복구 (JSON)</h3>
                  <p className="text-[13px] font-medium text-slate-500 leading-relaxed">보관해둔 백업 파일을 업로드하여 데이터를 복원합니다. <span className="text-red-500 font-bold">현재 데이터는 덮어씌워집니다.</span></p>
                </div>
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full bg-white border-slate-200 text-slate-700 mt-auto shadow-sm hover:bg-slate-50 rounded-xl font-bold text-[13px] h-11">
                  <Upload className="w-4 h-4 mr-2" /> 백업 파일 불러오기
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 위험 구역 */}
        <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 md:p-8 mb-8 relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-red-800 tracking-tight">위험 구역 (Danger Zone)</h2>
                <p className="text-[13px] font-medium text-red-600/80 mt-0.5">현재 보관된 모든 설정과 회차 정보를 영구적으로 삭제합니다.</p>
              </div>
            </div>
            
            <Button onClick={handleResetAll} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white sm:w-auto h-11 px-8 rounded-xl font-bold tracking-wide text-[13px] shrink-0">
              모든 데이터 초기화
            </Button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
});
