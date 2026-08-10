import fs from 'fs';
let code = fs.readFileSync('src/components/Home.tsx', 'utf-8');

const targetStr = `                <div className="h-4 w-full bg-indigo-100/50 rounded-full overflow-hidden border border-indigo-100/50 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full relative transition-all duration-1000 ease-out"
                    style={{ width: \`\${progressPercent}%\` }}
                  >
                    <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
                  </div>
                </div>
              </div>`;

const replaceStr = `                <div className="h-4 w-full bg-indigo-100/50 rounded-full overflow-hidden border border-indigo-100/50 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full relative transition-all duration-1000 ease-out"
                    style={{ width: \`\${progressPercent}%\` }}
                  >
                    <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-400">총 에피소드</span>
                    <span className="text-[15px] font-black text-slate-700">{episodes.length} 화</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200/60"></div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-400">평균 글자 수</span>
                    <span className="text-[15px] font-black text-slate-700">{episodes.length > 0 ? Math.round(totalCharacters / episodes.length).toLocaleString() : 0} 자</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200/60"></div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-400">달성률</span>
                    <span className="text-[15px] font-black text-indigo-600">{progressPercent}%</span>
                  </div>
                </div>
              </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/Home.tsx', code);
