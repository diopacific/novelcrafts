import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BibleState, Episode } from './types';
import { BiblePanel } from './components/BiblePanel';
import { Workspace } from './components/Workspace';
import { ToolsPanel } from './components/ToolsPanel';
import { Home } from './components/Home';
import { Book, PenTool, Settings } from 'lucide-react';

export default function App() {
  const [bible, setBible] = useLocalStorage<BibleState>('novel-bible', {
    story: '',
    world: '',
    system: '',
    character: '',
    villain: '',
    structure: ''
  });

  const [episodes, setEpisodes] = useLocalStorage<Episode[]>('novel-episodes', []);
  const [currentSection, setCurrentSection] = useState<'home' | 'bible' | 'workspace' | 'tools'>('home');

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans font-medium overflow-hidden antialiased">
      
      {/* Global Top Navigation */}
      <nav className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 gap-6 z-50 shrink-0">
        <button 
          onClick={() => setCurrentSection('home')} 
          className="flex items-center text-white font-black text-xl tracking-tight mr-4 hover:text-indigo-400 transition-colors"
        >
          소설공장 스튜디오
        </button>
        
        <div className="flex items-center gap-1.5 h-full">
          <NavButton 
            active={currentSection === 'bible'} 
            onClick={() => setCurrentSection('bible')} 
            icon={<Book className="w-4 h-4 mr-2" />} 
            label="설정 공장" 
          />
          <NavButton 
            active={currentSection === 'workspace'} 
            onClick={() => setCurrentSection('workspace')} 
            icon={<PenTool className="w-4 h-4 mr-2" />} 
            label="집필 공장" 
          />
          <div className="w-px h-5 bg-slate-800 mx-2"></div>
          <NavButton 
            active={currentSection === 'tools'} 
            onClick={() => setCurrentSection('tools')} 
            icon={<Settings className="w-4 h-4 mr-2" />} 
            label="기타" 
          />
        </div>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {currentSection === 'home' && <Home onNavigate={setCurrentSection} />}
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
      </main>
    </div>
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
