import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `                  <h4 className="text-[13px] font-bold text-slate-600 truncate mb-2">{ep.direction || '제목 미정'}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 font-mono font-medium flex items-center bg-slate-50 px-2 py-0.5 rounded-md w-fit">
                      {ep.content.length.toLocaleString()} 자
                    </p>`;

const replaceStr = `                  <h4 className="text-[13px] font-bold text-slate-600 truncate mb-2">{ep.direction || '제목 미정'}</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-400 font-mono font-medium flex items-center bg-slate-50 px-2 py-0.5 rounded-md w-fit">
                        {ep.content.length.toLocaleString()} 자
                      </p>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={\`h-full transition-all duration-500 \${ep.content.length >= 5500 ? 'bg-emerald-400' : 'bg-indigo-400'}\`} 
                        style={{ width: \`\${Math.min(100, (ep.content.length / 5500) * 100)}%\` }} 
                      />
                    </div>
                  </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/Workspace.tsx', code);
