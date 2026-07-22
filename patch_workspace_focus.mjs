import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `  // Search & Replace State
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchTarget, setSearchTarget] = useState('');
  const [replaceValue, setReplaceValue] = useState('');`;

const replaceStr = `  // Search & Replace State
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchTarget, setSearchTarget] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);`;

code = code.replace(targetStr, replaceStr);

const targetStr2 = `      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        setShowSearchReplace(prev => !prev);
      }`;

const replaceStr2 = `      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        setShowSearchReplace(prev => {
          if (!prev) setTimeout(() => searchInputRef.current?.focus(), 100);
          return !prev;
        });
      }`;

code = code.replace(targetStr2, replaceStr2);

const targetStr3 = `                <input type="text" placeholder="찾을 단어" className="h-8 px-3 text-[13px] font-medium rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none flex-1 max-w-[200px]" value={searchTarget} onChange={e => setSearchTarget(e.target.value)} />`;

const replaceStr3 = `                <input ref={searchInputRef} type="text" placeholder="찾을 단어" className="h-8 px-3 text-[13px] font-medium rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none flex-1 max-w-[200px]" value={searchTarget} onChange={e => setSearchTarget(e.target.value)} />`;

code = code.replace(targetStr3, replaceStr3);

fs.writeFileSync('src/components/Workspace.tsx', code);
