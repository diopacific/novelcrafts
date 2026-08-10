import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

// 1. Better textarea layout and floating save status
const textareaTarget = `                  <Textarea 
                    ref={textareaRef}
                    className={\`\${isFullscreen ? 'min-h-[calc(100vh-240px)] h-[calc(100vh-240px)]' : 'min-h-[600px] h-[600px]'} w-full bg-white border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 font-medium leading-[2.2] text-slate-800 shadow-md resize-y transition-all rounded-2xl py-6 pr-8 pl-6 sm:pl-16 placeholder:text-slate-300 custom-scrollbar relative z-0\`}
                    style={{ fontSize: \`\${editorFontSize}px\`, wordBreak: 'keep-all' }}`;
const textareaReplace = `                  <Textarea 
                    ref={textareaRef}
                    className={\`\${isFullscreen ? 'min-h-[calc(100vh-180px)] h-[calc(100vh-180px)] p-10 sm:pl-20' : 'min-h-[600px] h-[600px] py-6 pr-8 pl-6 sm:pl-16'} w-full bg-white border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 font-medium leading-[2.2] text-slate-800 shadow-md resize-y transition-all rounded-2xl placeholder:text-slate-300 custom-scrollbar relative z-0\`}
                    style={{ fontSize: \`\${editorFontSize}px\`, wordBreak: 'keep-all' }}`;
code = code.replace(textareaTarget, textareaReplace);

// 2. Add Floating Save Status for Fullscreen
const fullscreenSaveTarget = `                  {/* AI Sentence Correction UI / Toast Tooltip */}`;
const fullscreenSaveReplace = `                  {/* Floating Save Status (Fullscreen Only) */}
                  <AnimatePresence>
                    {isFullscreen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-6 right-8 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-full px-4 py-2 flex items-center gap-2 z-20 pointer-events-none"
                      >
                        {saveStatus === 'saving' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            <span className="text-[12px] font-bold text-slate-500">자동 저장 중...</span>
                          </>
                        ) : saveStatus === 'saved' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[12px] font-bold text-emerald-600">저장 완료</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-slate-300" />
                            <span className="text-[12px] font-bold text-slate-400">변경사항 없음</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Sentence Correction UI / Toast Tooltip */}`;
code = code.replace(fullscreenSaveTarget, fullscreenSaveReplace);

fs.writeFileSync('src/components/Workspace.tsx', code);
