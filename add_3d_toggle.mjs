import fs from 'fs';

// 1. App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
if (!appCode.includes('show3D')) {
    // Add state
    appCode = appCode.replace(
        "const [activeTab, setActiveTab] = useState<'editor' | 'bible' | 'tools'>('editor');",
        "const [activeTab, setActiveTab] = useState<'editor' | 'bible' | 'tools'>('editor');\n  const [show3D, setShow3D] = useState(() => localStorage.getItem('hide3D') !== 'true');"
    );
    
    // Add toggle function
    appCode = appCode.replace(
        "const logoutUser = async () => {",
        "const toggle3D = () => { const next = !show3D; setShow3D(next); localStorage.setItem('hide3D', (!next).toString()); };\n\n  const logoutUser = async () => {"
    );
    
    // Add button in Nav
    const buttonHtml = `
            <button 
              onClick={toggle3D}
              className={\`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-sm transition-colors text-xs font-bold \${currentSection === 'home' ? 'bg-indigo-950/50 border-indigo-800/50 text-indigo-200 hover:bg-indigo-900/50' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}\`}
              title="3D 배경 켜기/끄기"
            >
              <Sparkles className={\`w-3.5 h-3.5 \${show3D ? 'text-amber-400' : 'text-slate-500'}\`} />
              <span className="hidden sm:inline-block">{show3D ? '3D 켜짐' : '3D 꺼짐'}</span>
            </button>
    `;
    appCode = appCode.replace(
        "{user ? (",
        buttonHtml + "\n          {user ? ("
    );
    
    // Pass show3D to CelestialLibrary
    appCode = appCode.replace(
        "<CelestialLibrary isAuth={!!user} currentSection={currentSection} />",
        "{show3D ? <CelestialLibrary isAuth={!!user} currentSection={currentSection} /> : <div className=\"fixed inset-0 z-[-1] pointer-events-none bg-gradient-to-br from-[#020010] via-[#0a0515] to-[#1e1b4b]\" />}"
    );
    fs.writeFileSync('src/App.tsx', appCode);
}
