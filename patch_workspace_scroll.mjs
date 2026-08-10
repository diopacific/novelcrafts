import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `  // Custom event listener for new episode
  useEffect(() => {`;

const replaceStr = `  // Scroll to active episode
  useEffect(() => {
    if (activeEpisodeId && activeEpisodeId !== 'new') {
      const el = document.getElementById(\`ep-\${activeEpisodeId}\`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeEpisodeId]);

  // Custom event listener for new episode
  useEffect(() => {`;

code = code.replace(targetStr, replaceStr);

const divTargetStr = `              {filteredEpisodes.map((ep) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={ep.id}`;

const divReplaceStr = `              {filteredEpisodes.map((ep) => (
                <motion.div 
                  id={\`ep-\${ep.id}\`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={ep.id}`;

code = code.replace(divTargetStr, divReplaceStr);

fs.writeFileSync('src/components/Workspace.tsx', code);
