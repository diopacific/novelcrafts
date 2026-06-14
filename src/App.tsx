import React, { useState } from 'react';
import { BibleState, Episode } from './types';
import { BiblePanel } from './components/BiblePanel';
import { Workspace } from './components/Workspace';
import { ToolsPanel } from './components/ToolsPanel';
import { Home } from './components/Home';
import { Book, PenTool, Settings, LogIn, LogOut, BookOpen, UserCircle2 } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { useDbStorage } from './hooks/useDbStorage';

import { PomodoroTimer } from './components/PomodoroTimer';

function AppContent() {
  const { user, login, logoutUser } = useAuth();
  const { bible, setBible, episodes, setEpisodes, loading } = useDbStorage();
  const [currentSection, setCurrentSection] = useState<'home' | 'bible' | 'workspace' | 'tools'>('home');

  const requireAuth = async (section: 'home' | 'bible' | 'workspace' | 'tools') => {
    if (!user && section !== 'home') {
      try {
        await login();
        setCurrentSection(section);
      } catch (e: any) {
        if (e?.code === 'auth/cancelled-popup-request' || e?.code === 'auth/popup-closed-by-user') {
          return;
        }
        console.error('Login failed', e);
        alert(`로그인에 실패했습니다.\n팝업 차단 여부를 확인하거나 권한을 허용해주세요.`);
      }
      return;
    }
    setCurrentSection(section);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans font-medium overflow-hidden antialiased">
      
      {/* Global Top Navigation */}
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 justify-between z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 md:gap-8 h-full">
          <button 
            onClick={() => setCurrentSection('home')} 
            className="flex items-center text-slate-800 font-black text-lg md:text-xl tracking-tight hover:text-indigo-600 transition-colors shrink-0"
          >
            <BookOpen className="w-5 h-5 mr-1.5 md:mr-2 text-indigo-600" />
            <span className="hidden sm:inline-block">소설공장</span>
          </button>
          
          <div className="flex items-center gap-1 h-full">
            <NavButton 
              active={currentSection === 'bible'} 
              onClick={() => requireAuth('bible')} 
              icon={<Book className="w-4 h-4 sm:mr-1.5" />} 
              label="설정 공장" 
            />
            <NavButton 
              active={currentSection === 'workspace'} 
              onClick={() => requireAuth('workspace')} 
              icon={<PenTool className="w-4 h-4 sm:mr-1.5" />} 
              label="회차 보관함" 
            />
            <div className="w-px h-4 bg-slate-200 mx-1 md:mx-2 shrink-0"></div>
            <NavButton 
              active={currentSection === 'tools'} 
              onClick={() => requireAuth('tools')} 
              icon={<Settings className="w-4 h-4 sm:mr-1.5" />} 
              label="데이터 관리" 
            />
          </div>
        </div>

        <div className="flex items-center ml-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 md:gap-3 bg-slate-50 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-slate-200 shadow-sm">
               <UserCircle2 className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
               <span className="text-slate-600 font-semibold text-[13px] hidden md:inline-block tracking-wide">{user.email}</span>
               <div className="w-px h-3.5 bg-slate-200 hidden md:block"></div>
               <button 
                 onClick={logoutUser}
                 className="flex items-center text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-1 md:p-1.5 rounded-full border border-slate-200"
                 title="로그아웃"
               >
                 <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
               </button>
            </div>
          ) : (
            <button 
              onClick={async () => {
                try {
                  await login();
                } catch (e: any) {
                  if (e?.code === 'auth/cancelled-popup-request' || e?.code === 'auth/popup-closed-by-user') return;
                  alert('로그인에 실패했습니다.');
                }
              }}
              className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-md transition-colors text-sm font-bold"
            >
              <LogIn className="w-4 h-4 mr-1.5" /> 구글 로그인
            </button>
          )}
        </div>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex w-full h-full items-center justify-center text-slate-500">데이터를 불러오는 중입니다...</div>
        ) : (
          <>
            {currentSection === 'home' && <Home episodes={episodes} onNavigate={requireAuth} />}
            {currentSection === 'bible' && <BiblePanel bible={bible} setBible={setBible} />}
            {currentSection === 'workspace' && <Workspace bible={bible} episodes={episodes} setEpisodes={setEpisodes} />}
            {currentSection === 'tools' && (
              <ToolsPanel 
                bible={bible} 
                episodes={episodes} 
                setBible={setBible} 
                setEpisodes={setEpisodes} 
              />
            )}
          </>
        )}
      </main>
      
      {/* 1-person dedicated writer tool - Pomodoro Timer globally accessible */}
      {user && currentSection !== 'home' && <PomodoroTimer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`h-full px-2 sm:px-4 flex items-center font-bold text-[13px] sm:text-[14px] tracking-wide transition-colors relative ${
        active ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
    >
      {icon} <span className="hidden sm:inline-block">{label}</span>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
      )}
    </button>
  );
}
