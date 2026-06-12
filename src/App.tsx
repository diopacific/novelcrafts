import React, { useState } from 'react';
import { BibleState, Episode } from './types';
import { BiblePanel } from './components/BiblePanel';
import { Workspace } from './components/Workspace';
import { ToolsPanel } from './components/ToolsPanel';
import { Home } from './components/Home';
import { Book, PenTool, Settings, LogIn, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { useDbStorage } from './hooks/useDbStorage';

function AppContent() {
  const { user, login, logoutUser } = useAuth();
  const { bible, setBible, episodes, setEpisodes, loading } = useDbStorage();
  const [currentSection, setCurrentSection] = useState<'home' | 'bible' | 'workspace' | 'tools'>('home');

  const requireAuth = (section: 'home' | 'bible' | 'workspace' | 'tools') => {
    if (!user && section !== 'home') {
      alert('구글 로그인이 필요한 기능입니다.');
      return;
    }
    setCurrentSection(section);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans font-medium overflow-hidden antialiased">
      
      {/* Global Top Navigation */}
      <nav className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 justify-between z-50 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentSection('home')} 
            className="flex items-center text-white font-black text-xl tracking-tight mr-4 hover:text-indigo-400 transition-colors"
          >
            소설공장 스튜디오
          </button>
          
          <div className="flex items-center gap-1.5 h-full">
            <NavButton 
              active={currentSection === 'bible'} 
              onClick={() => requireAuth('bible')} 
              icon={<Book className="w-4 h-4 mr-2" />} 
              label="설정 공장" 
            />
            <NavButton 
              active={currentSection === 'workspace'} 
              onClick={() => requireAuth('workspace')} 
              icon={<PenTool className="w-4 h-4 mr-2" />} 
              label="집필 공장" 
            />
            <div className="w-px h-5 bg-slate-800 mx-2"></div>
            <NavButton 
              active={currentSection === 'tools'} 
              onClick={() => requireAuth('tools')} 
              icon={<Settings className="w-4 h-4 mr-2" />} 
              label="기타" 
            />
          </div>
        </div>

        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-4">
               <span className="text-slate-400 text-sm hidden sm:inline-block">{user.email}</span>
               <button 
                 onClick={logoutUser}
                 className="flex items-center text-slate-300 hover:text-white transition-colors text-sm font-bold"
               >
                 <LogOut className="w-4 h-4 mr-1.5" /> 로그아웃
               </button>
            </div>
          ) : (
            <button 
              onClick={login}
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
            {currentSection === 'home' && <Home onNavigate={requireAuth} />}
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
      className={`h-9 px-4 flex items-center justify-center rounded-lg transition-all duration-200 text-[13px] font-bold ${
        active 
        ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
