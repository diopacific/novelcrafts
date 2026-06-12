import React, { useRef, useState, useEffect } from 'react';
import { BibleState, Episode } from '../types';
import { Button } from './ui/button';
import { Download, Upload, Trash2, Database, BarChart3, FileType, ShieldCheck, UserPlus, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

interface ToolsPanelProps {
  bible: BibleState;
  episodes: Episode[];
  setBible: (bible: BibleState) => void;
  setEpisodes: (episodes: Episode[]) => void;
}

export function ToolsPanel({ bible, episodes, setBible, setEpisodes }: ToolsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuth();
  const [approvedUsers, setApprovedUsers] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadApprovedUsers();
    }
  }, [isAdmin]);

  const loadApprovedUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'approved_users'));
      const users: string[] = [];
      snapshot.forEach(doc => users.push(doc.id));
      setApprovedUsers(users);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUser = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    try {
      await setDoc(doc(db, 'approved_users', newEmail.trim()), {
        approved: true,
        addedAt: new Date().toISOString()
      });
      setNewEmail('');
      loadApprovedUsers();
      alert('사용자가 승인되었습니다.');
    } catch (e) {
      console.error(e);
      alert('추가에 실패했습니다.');
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (confirm(`${email} 사용자의 접근 권한을 취소하시겠습니까?`)) {
      try {
        await deleteDoc(doc(db, 'approved_users', email));
        loadApprovedUsers();
      } catch (e) {
        console.error(e);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleExportText = () => {
    let output = "=== 설정 바이블 ===\n\n";
    output += `[스토리]\n${bible.story}\n\n[세계관]\n${bible.world}\n\n[퇴마/능력 시스템]\n${bible.system}\n\n[캐릭터]\n${bible.character}\n\n[빌런]\n${bible.villain}\n\n[작품 구성]\n${bible.structure}\n\n`;
    output += "===================\n\n";

    episodes.forEach(ep => {
      output += `\n\n제 ${ep.number} 화\n\n${ep.content}\n\n`;
    });

    downloadBlob(output, `novel_export_${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain');
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
        if (parsed.bible && parsed.episodes) {
          if (confirm('현재 작성된 데이터가 덮어씌워집니다. 계속하시겠습니까?')) {
            setBible(parsed.bible);
            setEpisodes(parsed.episodes);
            alert('성공적으로 복구되었습니다.');
          }
        } else {
          alert('올바르지 않은 백업 파일 형식입니다.');
        }
      } catch (error) {
        alert('파일을 파싱하는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAll = () => {
    if (confirm('설정집과 모든 회차가 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 정말 초기화하시겠습니까?')) {
      setBible({
        story: '', world: '', system: '', character: '', villain: '', structure: ''
      });
      setEpisodes([]);
      alert('초기화 완료되었습니다.');
    }
  };

  const totalCharacters = episodes.reduce((acc, ep) => acc + ep.content.length, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto w-full custom-scrollbar">
      <header className="h-[72px] shrink-0 bg-white border-b border-slate-200 px-8 flex items-center shadow-sm z-10 sticky top-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">기타</h1>
      </header>

      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        
        {/* 통계 섹션 */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">작품 통계</h2>
              <p className="text-sm text-slate-500">현재까지 집필된 작품의 규모를 확인합니다.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <span className="text-sm font-semibold text-slate-500 block mb-1">총 누적 회차</span>
              <span className="text-3xl font-black text-slate-800">{episodes.length} <span className="text-lg font-bold text-slate-400">화</span></span>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <span className="text-sm font-semibold text-slate-500 block mb-1">총 누적 글자수 (공백 포함)</span>
              <span className="text-3xl font-black text-slate-800">{totalCharacters.toLocaleString()} <span className="text-lg font-bold text-slate-400">자</span></span>
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
              <p className="text-sm text-slate-500">로컬 브라우저에 저장된 데이터를 파일로 안전하게 관리하세요.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-700 text-[15px]">통합 백업 (JSON)</h3>
                <p className="text-sm text-slate-500 mt-0.5">바이블과 원고 데이터를 완벽하게 복구할 수 있는 형식으로 다운로드합니다.</p>
              </div>
              <Button onClick={handleExportJson} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                <Download className="w-4 h-4 mr-2" /> JSON 백업
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-700 text-[15px]">데이터 복구 (Import)</h3>
                <p className="text-sm text-slate-500 mt-0.5">이전에 백업해둔 JSON 파일을 불러와 프로젝트를 복원합니다.</p>
              </div>
              <div>
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="shrink-0">
                  <Upload className="w-4 h-4 mr-2" /> 파일 불러오기
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-700 text-[15px]">완성본 내보내기 (TXT)</h3>
                <p className="text-sm text-slate-500 mt-0.5">설정집과 에피소드를 텍스트 파일로 묶어서 다운로드합니다. (열람용)</p>
              </div>
              <Button variant="secondary" onClick={handleExportText} className="shrink-0">
                <FileType className="w-4 h-4 mr-2" /> TXT 내보내기
              </Button>
            </div>
          </div>
        </section>

        {/* 위험 구역 */}
        <section className="bg-red-50/50 rounded-2xl border border-red-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-800">위험 구역 (Danger Zone)</h2>
              <p className="text-sm text-red-600/80">앱에 기입된 모든 정보를 영구적으로 삭제합니다.</p>
            </div>
          </div>
          
          <Button onClick={handleResetAll} className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto h-12 px-8">
            모든 데이터 초기화
          </Button>
        </section>

        {/* 관리자 메뉴 */}
        {isAdmin && (
          <section className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-indigo-900">시스템 관리자 전용: 사용자 승인 관리</h2>
                <p className="text-sm text-indigo-700/80">승인된 구글 이메일만 이 앱에 액세스할 수 있습니다.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input 
                type="email" 
                placeholder="승인할 이메일 주소 입력" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                className="flex-1 h-11 px-4 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <Button onClick={handleAddUser} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                <UserPlus className="w-4 h-4 mr-2" /> 승인 추가
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden text-sm">
              <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 font-semibold text-indigo-900 flex justify-between">
                <span>승인된 사용자 목록</span>
                <span>총 {approvedUsers.length}명</span>
              </div>
              <ul className="divide-y divide-indigo-50">
                {approvedUsers.map(email => (
                  <li key={email} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="font-medium text-slate-700">{email}</span>
                    <button 
                      onClick={() => handleRemoveUser(email)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="접근 권한 취소"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
                {approvedUsers.length === 0 && (
                  <li className="px-5 py-8 text-center text-slate-500">등록된 사용자가 없습니다.</li>
                )}
              </ul>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
