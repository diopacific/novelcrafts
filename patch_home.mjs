import fs from 'fs';
let code = fs.readFileSync('src/components/Home.tsx', 'utf-8');

// Add Plus to lucide imports
code = code.replace("import { Book, PenTool", "import { Book, PenTool, Plus");

// Replace recent episodes header
const targetHeader = `              <button onClick={() => onNavigate('workspace')} className="text-[15px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
                전체 보기 <ChevronRight className="w-4 h-4" />
              </button>
            </div>`;
const replaceHeader = `              <div className="flex items-center gap-2">
                <button onClick={() => { onNavigate('workspace'); setTimeout(() => window.dispatchEvent(new CustomEvent('createNewEpisode')), 100); }} className="text-[14px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-1.5" /> 새 회차 쓰기
                </button>
                <button onClick={() => onNavigate('workspace')} className="text-[14px] font-bold text-slate-600 hover:text-indigo-600 flex items-center px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  전체 보기 <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>`;
code = code.replace(targetHeader, replaceHeader);

fs.writeFileSync('src/components/Home.tsx', code);
