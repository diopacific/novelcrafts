import React from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BibleState, Episode } from './types';
import { BiblePanel } from './components/BiblePanel';
import { Workspace } from './components/Workspace';
import { BookOpen } from 'lucide-react';

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

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans font-medium overflow-hidden antialiased">
      {/* Sidebar for settings */}
      <BiblePanel bible={bible} setBible={setBible} />

      {/* Main Workspace */}
      <Workspace bible={bible} episodes={episodes} setEpisodes={setEpisodes} />
    </div>
  );
}
