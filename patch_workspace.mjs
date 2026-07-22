import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `        {/* Quick Bible Viewer Sidebar */}
        {showQuickBible && (
          <div className="w-[320px] shrink-0 bg-[#f8fafc] border-l border-slate-200 overflow-y-auto custom-scrollbar flex flex-col items-stretch animate-in slide-in-from-right-4 duration-200 z-20 shadow-2xl absolute right-0 top-0 bottom-0">`;

const replaceStr = `        {/* Quick Bible Viewer Sidebar */}
        <AnimatePresence>
        {showQuickBible && (
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[320px] shrink-0 bg-[#f8fafc] border-l border-slate-200 overflow-y-auto custom-scrollbar flex flex-col items-stretch z-20 shadow-2xl absolute right-0 top-0 bottom-0"
          >`;

code = code.replace(targetStr, replaceStr);

const targetStr2 = `              ))}
            </div>
          </div>
        )}`;

const replaceStr2 = `              ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>`;

code = code.replace(targetStr2, replaceStr2);

fs.writeFileSync('src/components/Workspace.tsx', code);
