import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        setShowSearchReplace(prev => !prev);
      }
    };`;

const replaceStr = `      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        setShowSearchReplace(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowQuickBible(prev => !prev);
      }
    };`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/components/Workspace.tsx', code);
