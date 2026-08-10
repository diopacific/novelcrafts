import fs from 'fs';
let code = fs.readFileSync('src/components/BiblePanel.tsx', 'utf-8');

// 1. Import Search
code = code.replace(
  "import { Book, Users, Map, Swords, Skull, LayoutTemplate, Save, Cloud, Loader2, Zap, Copy, FilePlus, FileMinus, Lightbulb, CheckCircle2, Plus, Trash2, Edit2, Check, X, Sparkles, Globe, Package, Clock, PanelRightClose, PanelRightOpen } from 'lucide-react';",
  "import { Book, Users, Map, Swords, Skull, LayoutTemplate, Save, Cloud, Loader2, Zap, Copy, FilePlus, FileMinus, Lightbulb, CheckCircle2, Plus, Trash2, Edit2, Check, X, Sparkles, Globe, Package, Clock, PanelRightClose, PanelRightOpen, Search } from 'lucide-react';"
);

// 2. Add states
const stateTarget = `  const [isOrganizing, setIsOrganizing] = useState(false);`;
const stateReplace = `  const [isOrganizing, setIsOrganizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editorFontSize, setEditorFontSize] = useState(15);`;
code = code.replace(stateTarget, stateReplace);

// 3. Add filteredTabs logic
const filteredTabsTarget = `  const currentTabInfo = useMemo(() => allTabs.find(t => t.id === activeTab), [allTabs, activeTab]);`;
const filteredTabsReplace = `  const filteredTabs = useMemo(() => {
    if (!searchTerm.trim()) return allTabs;
    const lowerTerm = searchTerm.toLowerCase();
    return allTabs.filter(t => 
      t.label.toLowerCase().includes(lowerTerm) || 
      getFieldValue(t.id).toLowerCase().includes(lowerTerm)
    );
  }, [allTabs, searchTerm, bible]);

  const currentTabInfo = useMemo(() => allTabs.find(t => t.id === activeTab), [allTabs, activeTab]);`;
code = code.replace(filteredTabsTarget, filteredTabsReplace);

// 4. Replace allTabs with filteredTabs in rendering groups
code = code.replace(/allTabs\.filter/g, 'filteredTabs.filter');

// 5. Insert Search UI
const searchTarget = `        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">`;
const searchReplace = `        <div className="px-4 py-3 border-b border-slate-200/60 bg-slate-50/50 sticky top-[168px] z-10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="설정 항목 및 내용 검색..."
              className="w-full text-[13px] pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">`;
code = code.replace(searchTarget, searchReplace);

// 6. Add Font Size Controls
const fontControlsTarget = `                 <Button variant="outline" size="sm" onClick={() => setShowTips(!showTips)} className={\`border-slate-200 h-8 text-[13px] flex \${showTips ? 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 'text-slate-600 hover:bg-slate-50 bg-white'}\`}>`;
const fontControlsReplace = `                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-8">
                  <button onClick={() => setEditorFontSize(f => Math.max(12, f - 1))} className="px-2.5 h-full text-slate-500 hover:text-indigo-600 hover:bg-slate-50 font-bold transition-colors" title="글꼴 작게">A-</button>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <button onClick={() => setEditorFontSize(f => Math.min(24, f + 1))} className="px-2.5 h-full text-slate-500 hover:text-indigo-600 hover:bg-slate-50 font-bold text-[13px] transition-colors" title="글꼴 크게">A+</button>
                </div>
                <div className="w-px h-5 bg-slate-200 mx-1 self-center hidden sm:block"></div>
                <Button variant="outline" size="sm" onClick={() => setShowTips(!showTips)} className={\`border-slate-200 h-8 text-[13px] flex \${showTips ? 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 'text-slate-600 hover:bg-slate-50 bg-white'}\`}>`;
code = code.replace(fontControlsTarget, fontControlsReplace);

// 7. Apply Font Size to Textareas
const textarea1 = `                      <Textarea 
                        className="w-full h-full text-[15px] leading-[1.8] font-medium bg-white focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500/20 border-slate-200 shadow-sm resize-none rounded-2xl py-6 pr-6 pl-16 placeholder:text-slate-300 custom-scrollbar relative z-0"`;
const textarea1Replace = `                      <Textarea 
                        style={{ fontSize: \`\${editorFontSize}px\` }}
                        className="w-full h-full leading-[1.8] font-medium bg-white focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500/20 border-slate-200 shadow-sm resize-none rounded-2xl py-6 pr-6 pl-16 placeholder:text-slate-300 custom-scrollbar relative z-0"`;
code = code.replace(textarea1, textarea1Replace);

const textarea2 = `                    <Textarea 
                      className="w-full h-full min-h-[500px] text-[15px] leading-[1.8] font-medium bg-white focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500/20 border-slate-200 shadow-sm resize-none rounded-2xl py-6 pr-6 pl-16 placeholder:text-slate-300 custom-scrollbar relative z-0"`;
const textarea2Replace = `                    <Textarea 
                      style={{ fontSize: \`\${editorFontSize}px\` }}
                      className="w-full h-full min-h-[500px] leading-[1.8] font-medium bg-white focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500/20 border-slate-200 shadow-sm resize-none rounded-2xl py-6 pr-6 pl-16 placeholder:text-slate-300 custom-scrollbar relative z-0"`;
code = code.replace(textarea2, textarea2Replace);

fs.writeFileSync('src/components/BiblePanel.tsx', code);
