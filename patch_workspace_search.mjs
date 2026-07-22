import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `        {/* Editor & Content Area */}
        <div className="flex-1 flex flex-col relative h-full bg-slate-50">
          
          {showSearchReplace && (
            <div className="bg-white border-b border-slate-200 p-3 shrink-0 flex items-center gap-3 w-full animate-in slide-in-from-top-2 shadow-sm z-20 absolute top-0 left-0 right-0">
              <Replace className="w-4 h-4 text-indigo-500 hidden sm:block ml-2" />
              <input type="text" placeholder="찾을 단어" className="h-8 px-3 text-[13px] font-medium rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none flex-1 max-w-[200px]" value={searchTarget} onChange={e => setSearchTarget(e.target.value)} />
              <span className="text-slate-300"><ChevronRight className="w-4 h-4"/></span>
              <input type="text" placeholder="바꿀 단어" className="h-8 px-3 text-[13px] font-medium rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none flex-1 max-w-[200px]" value={replaceValue} onChange={e => setReplaceValue(e.target.value)} />
              <Button size="sm" onClick={executeGlobalReplace} disabled={!searchTarget} className="bg-indigo-600 text-white hover:bg-indigo-700 h-8 shrink-0 text-[12px] font-bold px-4 rounded-lg">일괄 변경</Button>
              <div className="flex-1" />
              <button onClick={() => setShowSearchReplace(false)} className="text-slate-400 hover:text-slate-700 mr-2 bg-slate-100 p-1 rounded-md"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Tools Area */}
          <div className={\`border-b border-slate-200 px-6 py-2.5 flex justify-between items-center bg-white shrink-0 z-10 transition-all \${showSearchReplace ? 'mt-[57px]' : ''}\`}>`;

const replaceStr = `        {/* Editor & Content Area */}
        <div className="flex-1 flex flex-col relative h-full bg-slate-50">
          
          <AnimatePresence>
            {showSearchReplace && (
              <motion.div 
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white border-b border-slate-200 p-3 shrink-0 flex items-center gap-3 w-full shadow-sm z-20 absolute top-0 left-0 right-0"
              >
                <Replace className="w-4 h-4 text-indigo-500 hidden sm:block ml-2" />
                <input type="text" placeholder="찾을 단어" className="h-8 px-3 text-[13px] font-medium rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none flex-1 max-w-[200px]" value={searchTarget} onChange={e => setSearchTarget(e.target.value)} />
                <span className="text-slate-300"><ChevronRight className="w-4 h-4"/></span>
                <input type="text" placeholder="바꿀 단어" className="h-8 px-3 text-[13px] font-medium rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none flex-1 max-w-[200px]" value={replaceValue} onChange={e => setReplaceValue(e.target.value)} />
                <Button size="sm" onClick={executeGlobalReplace} disabled={!searchTarget} className="bg-indigo-600 text-white hover:bg-indigo-700 h-8 shrink-0 text-[12px] font-bold px-4 rounded-lg">일괄 변경</Button>
                <div className="flex-1" />
                <button onClick={() => setShowSearchReplace(false)} className="text-slate-400 hover:text-slate-700 mr-2 bg-slate-100 p-1 rounded-md"><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tools Area */}
          <motion.div 
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={\`border-b border-slate-200 px-6 py-2.5 flex justify-between items-center bg-white shrink-0 z-10 \${showSearchReplace ? 'mt-[57px]' : ''}\`}
          >`;

code = code.replace(targetStr, replaceStr);

const targetStr2 = `              </Button>
            </div>
          </div>`;
          
const replaceStr2 = `              </Button>
            </div>
          </motion.div>`;

code = code.replace(targetStr2, replaceStr2);

fs.writeFileSync('src/components/Workspace.tsx', code);
