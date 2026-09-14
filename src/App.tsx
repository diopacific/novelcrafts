import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BibleState, Episode } from './types';
import { Book, PenTool, Settings, LogIn, LogOut, BookOpen, UserCircle2, Loader2, Sparkles, Search, Compass, Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { useDbStorage } from './hooks/useDbStorage';
import { PomodoroTimer } from './components/PomodoroTimer';
import { CelestialLibrary } from './components/3d/CelestialLibrary';
import { ToastContainer } from './components/ui/ToastContainer';
import { CommandPalette } from './components/CommandPalette';
import { toast } from './lib/toast';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load major components for code-splitting
const Home = lazy(() => import('./components/Home').then(module => ({ default: module.Home })));
const BiblePanel = lazy(() => import('./components/BiblePanel').then(module => ({ default: module.BiblePanel })));
const Workspace = lazy(() => import('./components/Workspace').then(module => ({ default: module.Workspace })));
const ToolsPanel = lazy(() => import('./components/ToolsPanel').then(module => ({ default: module.ToolsPanel })));

function AppContent() {
  const { user, login, logoutUser } = useAuth();
  const { bible, setBible, episodes, setEpisodes, loading } = useDbStorage();
  const [currentSection, setCurrentSection] = useState<'home' | 'bible' | 'workspace' | 'tools'>('home');
  const [show3D, setShow3D] = useState(() => localStorage.getItem('hide3D') !== 'true');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);

  const toggle3D = () => {
    const next = !show3D;
    setShow3D(next);
    localStorage.setItem('hide3D', (!next).toString());
  };

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const requireAuth = async (section: 'home' | 'bible' | 'workspace' | 'tools') => {
    if (!user && section !== 'home') {
      try {
        await login();
        setCurrentSection(section);
      } catch (e: any) {
        if (e?.code === 'auth/cancelled-popup-request' || e?.code === 'auth/popup-closed-by-user') {
          return;
        }
        if (e?.code === 'auth/unauthorized-domain') {
          return;
        }
        if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/web-storage-unsupported' || e?.message?.toLowerCase().includes('popup')) {
          return;
        }
        console.error('Login failed', e);
        toast.error(`인증 실패: ${e.message}`);
      }
      return;
    }
    setCurrentSection(section);
  };

  const handleSelectEpisode = (episodeId: string) => {
    setSelectedEpisodeId(episodeId);
    window.dispatchEvent(new CustomEvent('selectEpisode', { detail: episodeId }));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#05060a] text-slate-100 font-sans font-medium overflow-hidden antialiased relative selection:bg-amber-400/30 selection:text-amber-200">
      {show3D ? (
        <CelestialLibrary isAuth={!!user} currentSection={currentSection} />
      ) : (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-gradient-to-br from-[#020010] via-[#090b17] to-[#120d28]" />
      )}
      
      {/* Sleek Modern Island Navigation */}
      <header className="h-16 bg-[#070913]/70 backdrop-blur-2xl border-b border-white/[0.08] flex items-center px-4 md:px-8 justify-between z-50 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Brand & Mode */}
        <div className="flex items-center gap-5 md:gap-8">
          <button 
            onClick={() => setCurrentSection('home')} 
            className="group flex items-center gap-2.5 transition-transform active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-600/10 border border-amber-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.2)] group-hover:border-amber-400/60 transition-colors">
              <BookOpen className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-amber-300 transition-colors">NovelCraft AI</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider">천공의 도서관</p>
            </div>
          </button>
          
          {/* Segmented Linear-style Tabs */}
          <nav className="flex items-center p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl backdrop-blur-md">
            <NavSegment 
              active={currentSection === 'home'} 
              onClick={() => setCurrentSection('home')}
              icon={<Compass className="w-3.5 h-3.5" />}
              label="홀"
            />
            <NavSegment 
              active={currentSection === 'workspace'} 
              onClick={() => requireAuth('workspace')} 
              icon={<PenTool className="w-3.5 h-3.5" />} 
              label="집필실" 
            />
            <NavSegment 
              active={currentSection === 'bible'} 
              onClick={() => requireAuth('bible')} 
              icon={<Book className="w-3.5 h-3.5" />} 
              label="설정집" 
            />
            <NavSegment 
              active={currentSection === 'tools'} 
              onClick={() => requireAuth('tools')} 
              icon={<Settings className="w-3.5 h-3.5" />} 
              label="데이터" 
            />
          </nav>
        </div>

        {/* Global Search / Command trigger + Quick Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Cmd + K Command Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-slate-300 text-xs font-medium transition-all shadow-sm group"
            title="커맨드 팔레트 열기 (단축키: Cmd+K 또는 Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 transition-colors" />
            <span className="hidden md:inline-block text-slate-400 group-hover:text-slate-200">명령 검색...</span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/[0.08]">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </button>

          {/* 3D Background Toggle */}
          <button 
            onClick={toggle3D}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              show3D 
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20' 
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:bg-white/[0.08]'
            }`}
            title="3D 공간 렌더링 켜기/끄기 (저사양/배터리 절전 시 끄기 권장)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${show3D ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="hidden lg:inline-block">{show3D ? '3D 켜짐' : '3D 꺼짐'}</span>
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <UserCircle2 className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-xs hidden md:inline-block text-slate-300 max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
                <button 
                  onClick={logoutUser}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors ml-1"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={async () => {
                try {
                  await login();
                } catch (e: any) {
                  if (e?.code === 'auth/cancelled-popup-request' || e?.code === 'auth/popup-closed-by-user') return;
                  if (e?.code === 'auth/unauthorized-domain') return;
                  if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/web-storage-unsupported' || e?.message?.toLowerCase().includes('popup')) return;
                  toast.error(`인증 실패: ${e.message}`);
                }
              }}
              className="flex items-center bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 px-3.5 py-1.5 rounded-xl transition-all text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> 로그인
            </button>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {loading ? (
          <div className="flex w-full h-full items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span className="text-sm font-medium">데이터를 안전하게 동기화하고 있습니다...</span>
          </div>
        ) : (
          <Suspense fallback={
            <div className="flex w-full h-full items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span className="text-sm font-medium">화면을 불러오는 중입니다...</span>
            </div>
          }>
            {currentSection === 'home' && (
              <Home 
                episodes={episodes} 
                bible={bible} 
                onNavigate={requireAuth} 
                onSelectEpisode={handleSelectEpisode}
                onOpenCommand={() => setIsCommandOpen(true)}
              />
            )}
            {currentSection === 'bible' && <BiblePanel bible={bible} setBible={setBible} />}
            {currentSection === 'workspace' && (
              <Workspace 
                bible={bible} 
                episodes={episodes} 
                setEpisodes={setEpisodes}
                initialEpisodeId={selectedEpisodeId}
                onNavigateToBible={() => requireAuth('bible')}
              />
            )}
            {currentSection === 'tools' && (
              <ToolsPanel 
                bible={bible} 
                episodes={episodes} 
                setBible={setBible} 
                setEpisodes={setEpisodes} 
              />
            )}
          </Suspense>
        )}
      </main>
      
      {/* 1-person dedicated writer tool - Pomodoro Timer globally accessible */}
      {user && currentSection !== 'home' && <PomodoroTimer />}

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette 
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={requireAuth}
        onSelectEpisode={handleSelectEpisode}
        episodes={episodes}
        bible={bible}
        show3D={show3D}
        onToggle3D={toggle3D}
      />
      
      <ToastContainer />
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

function NavSegment({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold text-xs tracking-tight transition-all ${
        active 
          ? 'text-amber-200' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="navPill" 
          className="absolute inset-0 bg-white/[0.1] border border-white/[0.12] rounded-lg shadow-sm"
          transition={{ type: "spring", stiffness: 450, damping: 35 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}
