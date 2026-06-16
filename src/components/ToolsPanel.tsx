import React, { useRef, useMemo, useState } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Download, Upload, Trash2, Database, BarChart3, FileText, CheckCircle2, BookOpen } from 'lucide-react';

interface ToolsPanelProps {
  bible: BibleState;
  episodes: Episode[];
  setBible: (bible: BibleState) => void;
  setEpisodes: (episodes: Episode[]) => void;
}

export function ToolsPanel({ bible, episodes, setBible, setEpisodes }: ToolsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exportScope, setExportScope] = useState<'all' | 'bible' | 'episodes'>('all');
  const [exportFormat, setExportFormat] = useState<'txt' | 'md'>('md');

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
      alert('선택한 내용이 클립보드에 복사되었습니다.');
    } catch (err) {
      alert('클립보드 복사에 실패했습니다.');
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
               alert('성공적으로 복구되었습니다.');
             }
          } else {
             alert('호환되지 않는 백업 파일 형식입니다. (bible 또는 episodes 필드 누락)');
          }
        } else {
          alert('올바른 JSON 형식이 아닙니다.');
        }
      } catch (error) {
        alert('파일을 파싱하는 중 오류가 발생했습니다. 파일이 손상되었을 수 있습니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAll = () => {
    const confirmText = window.prompt('설정집과 모든 회차가 삭제됩니다. 이 작업은 되돌릴 수 없습니다. \n정말 초기화하시려면 "초기화"라고 입력해주세요.');
    if (confirmText === '초기화') {
      setBible({
        logline: '', story: '', world: '', system: '', character: '', villain: '', structure: '', episode: ''
      });
      setEpisodes([]);
      alert('데이터가 안전하게 초기화되었습니다.');
    } else if (confirmText !== null) {
      alert('입력한 텍스트가 일치하지 않아 취소되었습니다.');
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
      <header className="h-[72px] shrink-0 bg-white border-b border-slate-200 px-8 flex items-center shadow-sm z-10 sticky top-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">작품 관리 & 내보내기</h1>
      </header>

      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        
        {/* 통계 섹션 */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">작품 집필 통계</h2>
              <p className="text-sm text-slate-500">현재까지 집필된 플랫폼 연재 기준의 규모를 확인합니다.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative overflow-hidden">
              <span className="text-sm font-semibold text-slate-500 block mb-1 relative z-10">총 누적 회차</span>
              <span className="text-3xl font-black text-slate-800 relative z-10 flex items-center gap-2">
                {episodes.length} <span className="text-lg font-bold text-slate-400">화</span>
              </span>
              <BookOpen className="w-24 h-24 absolute -right-4 -bottom-4 text-slate-200/50" />
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <span className="text-[13px] font-semibold text-slate-500 block mb-1">총 글자수 (공백 포함)</span>
              <span className="text-3xl font-black text-slate-800">{totalCharacters.toLocaleString()} <span className="text-lg font-bold text-slate-400">자</span></span>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <span className="text-[13px] font-semibold text-slate-500 block mb-1">총 글자수 (공백 제외)</span>
              <span className="text-3xl font-black text-indigo-700">{totalCharactersNoSpaces.toLocaleString()} <span className="text-lg font-bold text-slate-400">자</span></span>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <span className="text-[13px] font-semibold text-slate-500 block mb-1">회차당 평균 글자수</span>
              <span className="text-2xl font-black text-emerald-600">{avgCharacters.toLocaleString()} <span className="text-sm font-bold text-slate-400">자/화</span></span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-sm font-bold text-indigo-900 block mb-1">유료화 전환 목표 (15만자) 달성률</span>
                <span className="text-[13px] text-indigo-600/80 font-medium tracking-wide">플랫폼 유료화의 평균 기준인 15만자까지 남은 분량입니다.</span>
              </div>
              <span className="text-2xl font-black text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-100 shadow-sm">{progressPercent}%</span>
            </div>
            <div className="h-4 w-full bg-indigo-100/50 rounded-full overflow-hidden border border-indigo-100/50">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* 내보내기 & 백업 섹션 */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">원고 내보내기 (Export)</h2>
                <p className="text-sm text-slate-500">작업한 원고를 원하는 포맷으로 다른 플랫폼이나 에디터로 옮길 수 있습니다.</p>
              </div>
            </div>

            <div className="space-y-6 bg-slate-50 border border-slate-100 rounded-xl p-6">
              <div className="space-y-4">
                <div className="text-sm font-bold text-slate-700">추출 범위 선택</div>
                <div className="flex flex-wrap gap-3">
                  {(['all', 'bible', 'episodes'] as const).map((scope) => (
                    <label key={scope} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-all ${exportScope === scope ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input type="radio" className="hidden" checked={exportScope === scope} onChange={() => setExportScope(scope)} />
                      {exportScope === scope && <CheckCircle2 className="w-4 h-4" />}
                      <span className="font-semibold text-sm">
                        {scope === 'all' ? '전체 내보내기' : scope === 'bible' ? '설정집만 내보내기' : '회차만 내보내기'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm font-bold text-slate-700">파일 형식 선택</div>
                <div className="flex flex-wrap gap-3">
                  {(['md', 'txt'] as const).map((format) => (
                    <label key={format} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-all ${exportFormat === format ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input type="radio" className="hidden" checked={exportFormat === format} onChange={() => setExportFormat(format)} />
                      {exportFormat === format && <CheckCircle2 className="w-4 h-4" />}
                      <span className="font-semibold text-sm">
                        {format === 'md' ? 'Markdown (.md)' : '일반 텍스트 (.txt)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleExportCustom} className="bg-slate-800 hover:bg-slate-900 text-white w-full sm:w-auto h-11 px-8 rounded-xl font-bold tracking-wide">
                  <Download className="w-4 h-4 mr-2" /> 파일로 다운로드
                </Button>
                <Button variant="outline" onClick={handleCopyCustom} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto h-11 px-8 rounded-xl font-bold tracking-wide">
                  <FileText className="w-4 h-4 mr-2" /> 클립보드에 복사
                </Button>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">통합 백업 및 복구</h2>
                <p className="text-sm text-slate-500">프로젝트의 완벽한 복원을 위한 구조화된 JSON 데이터입니다.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-emerald-100 rounded-xl p-5 flex flex-col items-start gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">데이터베이스 백업 (JSON)</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">로컬 환경에 프로젝트 전체를 백업합니다. 다른 브라우저나 컴퓨터로 정보를 옮길 때 사용하세요.</p>
                </div>
                <Button onClick={handleExportJson} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 mt-auto shadow-sm">
                  <Download className="w-4 h-4 mr-2" /> json 백업 파일 저장
                </Button>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-start gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">데이터베이스 복구 (JSON)</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">이전에 받아둔 json 형식의 파일을 업로드하여 프로젝트를 복원합니다. <span className="text-red-500">현재 데이터는 덮어씌워집니다.</span></p>
                </div>
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-white border-slate-200 text-slate-700 mt-auto shadow-sm">
                  <Upload className="w-4 h-4 mr-2" /> json 파일 불러오기
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 위험 구역 */}
        <section className="bg-red-50/50 rounded-2xl border border-red-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-800">위험 구역 (Danger Zone)</h2>
              <p className="text-sm text-red-600/80">현재 계정의 모든 프로젝트 정보를 영구적으로 삭제합니다.</p>
            </div>
          </div>
          
          <Button onClick={handleResetAll} className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto h-12 px-8">
            모든 데이터 초기화
          </Button>
        </section>

      </div>
    </div>
  );
}
