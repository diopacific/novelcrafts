import fs from 'fs';
let code = fs.readFileSync('src/components/Home.tsx', 'utf-8');

// 1. Add "Refresh Tip" button to Home
const tipTarget = `              <div className="flex items-center gap-2.5 mb-4">
                <Zap className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-[16px]">오늘의 작법 팁</h3>
              </div>
              <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
                "{todayTip}"
              </p>`;

const tipReplace = `              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-6 h-6 text-amber-500" />
                  <h3 className="font-bold text-slate-800 text-[16px]">오늘의 작법 팁</h3>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const newTip = writingTips[Math.floor(Math.random() * writingTips.length)];
                    setTodayTip(newTip);
                  }}
                  className="text-[12px] font-bold text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 다른 팁 보기
                </button>
              </div>
              <p className="text-[15px] font-medium text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4 py-1">
                "{todayTip}"
              </p>`;

code = code.replace(tipTarget, tipReplace);

// Don't forget to import RefreshCw
code = code.replace("import { BookOpen, Book, PenTool, Layout, Settings, Clock, ChevronRight, FileText, CheckCircle2, Zap, Target, ArrowRight, Plus } from 'lucide-react';", "import { BookOpen, Book, PenTool, Layout, Settings, Clock, ChevronRight, FileText, CheckCircle2, Zap, Target, ArrowRight, Plus, RefreshCw } from 'lucide-react';");

// 2. Add an explicit button to empty state in recent episodes
const emptyStateTarget = `            ) : (
              <div className="py-12 text-center text-slate-400 font-medium flex flex-col items-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <FileText className="w-14 h-14 mb-4 text-slate-300" />
                <span className="text-[15px]">아직 작성된 회차가 없습니다.<br/>첫 번째 원고를 시작해보세요.</span>
              </div>
            )}`;
const emptyStateReplace = `            ) : (
              <div className="py-14 text-center text-slate-400 font-medium flex flex-col items-center bg-slate-50 rounded-2xl border border-slate-200/60 border-dashed group hover:bg-white hover:border-indigo-200 transition-colors">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-indigo-300" />
                </div>
                <span className="text-[15px] text-slate-500 mb-6">아직 작성된 회차가 없습니다.<br/>첫 번째 원고를 시작해보세요.</span>
                <button 
                  onClick={() => { onNavigate('workspace'); setTimeout(() => window.dispatchEvent(new CustomEvent('createNewEpisode')), 100); }} 
                  className="text-[14px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-6 py-3 rounded-xl transition-all shadow-sm"
                >
                  원고 쓰러 가기
                </button>
              </div>
            )}`;

code = code.replace(emptyStateTarget, emptyStateReplace);

// 3. Make settings link look more clickable
const settingsLinkTarget = `                <div className="mt-auto inline-flex items-center text-[15px] font-bold bg-white/10 w-fit px-5 py-2.5 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition-colors border border-white/10">
                  설정 다듬기 <ChevronRight className="w-4 h-4 ml-1" />
                </div>`;
const settingsLinkReplace = `                <div className="mt-auto inline-flex items-center text-[14px] font-black bg-white text-indigo-600 shadow-xl shadow-indigo-900/20 w-fit px-6 py-3 rounded-xl group-hover:scale-105 transition-all">
                  설정 다듬기 <ArrowRight className="w-4 h-4 ml-2" />
                </div>`;
code = code.replace(settingsLinkTarget, settingsLinkReplace);

fs.writeFileSync('src/components/Home.tsx', code);
