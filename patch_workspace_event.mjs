import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {`;

const replaceStr = `  // Custom event listener for new episode
  useEffect(() => {
    const handleNewEpisode = () => setActiveEpisodeId('new');
    window.addEventListener('createNewEpisode', handleNewEpisode as EventListener);
    return () => window.removeEventListener('createNewEpisode', handleNewEpisode as EventListener);
  }, []);

  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/Workspace.tsx', code);
