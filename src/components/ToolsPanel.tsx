import React, { useRef } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Download, Upload, Trash2, Database, BarChart3, FileType } from 'lucide-react';

interface ToolsPanelProps {
  bible: BibleState;
  episodes: Episode[];
  setBible: (bible: BibleState) => void;
  setEpisodes: (episodes: Episode[]) => void;
}

export function ToolsPanel({ bible, episodes, setBible, setEpisodes }: ToolsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportText = () => {
    let output = "=== 설정 공장 ===\n\n";
    output += `[핵심/로그라인]\n${bible.logline}\n\n[스토리]\n${bible.story}\n\n[능력]\n${bible.system}\n\n[캐릭터]\n${bible.character}\n\n[빌런]\n${bible.villain}\n\n[집필지침]\n${bible.structure}\n\n[에피소드]\n${bible.episode}\n\n`;
    output += "===================\n\n";

    episodes.forEach(ep => {
      output += `\n\n제 ${ep.number} 화\n\n${ep.content}\n\n`;
    });

    downloadBlob(output, `novel_export_${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain');
  };

  const handleExportBibleOnlyText = () => {
    let output = "=== 설정 공장 (바이블 단독) ===\n\n";
    output += `[핵심/로그라인]\n${bible.logline}\n\n[스토리]\n${bible.story}\n\n[능력]\n${bible.system}\n\n[캐릭터]\n${bible.character}\n\n[빌런]\n${bible.villain}\n\n[집필지침]\n${bible.structure}\n\n[에피소드]\n${bible.episode}\n\n`;
    output += "===================\n\n";
    downloadBlob(output, `novel_bible_${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain');
  };

  const handleCopyTextToClipboard = async () => {
    let output = "=== 설정 공장 ===\n\n";
    output += `[핵심/로그라인]\n${bible.logline}\n\n[스토리]\n${bible.story}\n\n[능력]\n${bible.system}\n\n[캐릭터]\n${bible.character}\n\n[빌런]\n${bible.villain}\n\n[집필지침]\n${bible.structure}\n\n[에피소드]\n${bible.episode}\n\n`;
    output += "===================\n\n";

    episodes.forEach(ep => {
      output += `\n\n제 ${ep.number} 화\n\n${ep.content}\n\n`;
    });

    try {
      await navigator.clipboard.writeText(output);
      alert('설정 및 모든 회차 내용이 클립보드에 복사되었습니다.');
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

  const totalCharacters = episodes.reduce((acc, ep) => acc + ep.content.length, 0);
  const totalCharactersNoSpaces = episodes.reduce((acc, ep) => acc + ep.content.replace(/\s/g, '').length, 0);
  const avgCharacters = episodes.length > 0 ? Math.round(totalCharacters / episodes.length) : 0;
  
  // 집필 목표 달성률 (유료화 기준: 약 15만자)
  const MILESTONE_TARGET = 150000;
  const progressPercent = Math.min(100, Math.round((totalCharacters / MILESTONE_TARGET) * 100));

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
              <span className="text-3xl font-black text-slate-800 relative z-10">{episodes.length} <span className="text-lg font-bold text-slate-400">화</span></span>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                <FileType className="w-32 h-32" />
              </div>
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

          <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-sm font-bold text-indigo-900 block mb-1">유료화 전환 목표 (15만자) 달성률</span>
                <span className="text-xs text-indigo-600/80 font-medium">플랫폼 유료화의 평균 기준인 15만자까지 남은 분량입니다.</span>
              </div>
              <span className="text-xl font-black text-indigo-700">{progressPercent}%</span>
            </div>
            <div className="h-3 w-full bg-indigo-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* 백업 및 복구 섹션 */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">데이터 백업 및 복구</h2>
              <p className="text-sm text-slate-500">클라우드에 저장된 데이터를 파일로 안전하게 별도 보관하세요.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-700 text-[15px]">통합 백업 (JSON)</h3>
                <p className="text-sm text-slate-500 mt-0.5">설정과 원고 데이터를 완벽하게 복구할 수 있는 형식으로 다운로드합니다.</p>
              </div>
              <Button onClick={handleExportJson} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                <Download className="w-4 h-4 mr-2" /> JSON 백업
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-700 text-[15px]">데이터 복구 (Import)</h3>
                <p className="text-sm text-slate-500 mt-0.5">이전에 다운로드해둔 JSON 파일을 불러와 프로젝트를 복원합니다.</p>
              </div>
              <div>
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="shrink-0 bg-white border-slate-200">
                  <Upload className="w-4 h-4 mr-2" /> 백업본 불러오기
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-700 text-[15px]">완성본 내보내기 및 복사 (TXT)</h3>
                <p className="text-sm text-slate-500 mt-0.5">설정집과 에피소드를 파일로 내보내거나 텍스트로 복사합니다.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportBibleOnlyText} className="shrink-0 bg-white border-slate-200">
                  설정집만 내보내기
                </Button>
                <Button variant="outline" onClick={handleCopyTextToClipboard} className="shrink-0 bg-white border-slate-200">
                  클립보드 복사
                </Button>
                <Button variant="secondary" onClick={handleExportText} className="shrink-0 bg-white border border-slate-200">
                  <FileType className="w-4 h-4 mr-2" /> 전체 내보내기
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
