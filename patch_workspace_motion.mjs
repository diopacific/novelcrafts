import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `            {filteredEpisodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-sm text-slate-400 mt-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
                <p>작성된 회차가 없습니다.</p>
              </div>
            ) : (
              filteredEpisodes.map((ep) => (
                <div 
                  key={ep.id}
                  onClick={() => setActiveEpisodeId(ep.id)}
                  className={\`p-4 rounded-2xl cursor-pointer border transition-all text-left group relative \${
                    activeEpisodeId === ep.id 
                    ? 'border-indigo-200 bg-white shadow-md ring-1 ring-indigo-500/10 scale-[1.02]' 
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                  }\`}
                >`;

const replaceStr = `            {filteredEpisodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-sm text-slate-400 mt-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
                <p>조건에 맞는 회차가 없습니다.</p>
              </div>
            ) : (
              <AnimatePresence>
              {filteredEpisodes.map((ep) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={ep.id}
                  onClick={() => setActiveEpisodeId(ep.id)}
                  className={\`p-4 rounded-2xl cursor-pointer border transition-all text-left group relative \${
                    activeEpisodeId === ep.id 
                    ? 'border-indigo-200 bg-white shadow-md ring-1 ring-indigo-500/10 scale-[1.02] z-10' 
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                  }\`}
                >`;

code = code.replace(targetStr, replaceStr);

const targetStr2 = `                  </div>
                </div>
              ))
            )}`;

const replaceStr2 = `                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            )}`;

code = code.replace(targetStr2, replaceStr2);

fs.writeFileSync('src/components/Workspace.tsx', code);
