import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

// 1. Remove the old button from the header
const headerTarget = `                    <AnimatePresence>
                      {selectedText.length > 0 && selectedText.trim().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleAiCorrection}
                            disabled={isCorrecting}
                            className="h-8 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[12px] shadow-sm rounded-lg"
                          >
                            {isCorrecting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5" />}
                            AI 문장 교정
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>`;

code = code.replace(headerTarget, "");

// 2. Add the floating button inside the textarea container and update the correction UI styling
const editorTarget = `                  {/* AI Sentence Correction UI */}
                  <AnimatePresence>
                    {showCorrectionUI && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute bottom-6 left-6 sm:left-16 right-8 bg-white border border-indigo-200 rounded-2xl shadow-xl z-30 overflow-hidden flex flex-col max-h-[300px]"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                          <h3 className="font-bold text-[13px] text-slate-700 flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-indigo-500" />
                            AI 문장 교정 제안
                          </h3>
                          <button onClick={() => setShowCorrectionUI(false)} className="text-slate-400 hover:text-slate-600 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-white">
                          {isCorrecting ? (
                            <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                              <Loader2 className="w-6 h-6 animate-spin mb-3 text-indigo-400" />
                              <span className="text-[13px] font-medium">더 자연스러운 문장을 고민하고 있습니다...</span>
                            </div>
                          ) : correctionSuggestions.length > 0 ? (
                            <div className="space-y-3">
                              {correctionSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => applyCorrection(suggestion)}
                                  className="w-full text-left p-3.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group flex items-start gap-3"
                                >
                                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center justify-center shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                    {idx + 1}
                                  </div>
                                  <div className="text-[14px] font-medium text-slate-700 leading-relaxed group-hover:text-indigo-900">
                                    {suggestion}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-slate-500 text-[13px]">
                              제안을 불러오지 못했습니다.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>`;

const editorReplace = `                  {/* Floating AI Grammar Fix Button */}
                  <AnimatePresence>
                    {selectedText.length > 0 && selectedText.trim().length > 0 && !showCorrectionUI && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
                      >
                        <Button
                          onClick={handleAiCorrection}
                          disabled={isCorrecting}
                          className="h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-indigo-500/10 rounded-full font-bold text-[13px] px-6 border border-slate-700 transition-all hover:scale-105 group"
                        >
                          {isCorrecting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-400" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                          )}
                          {isCorrecting ? '문장 다듬는 중...' : 'AI 문장 다듬기'}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Sentence Correction UI / Toast Tooltip */}
                  <AnimatePresence>
                    {showCorrectionUI && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] z-30 overflow-hidden flex flex-col max-h-[350px]"
                      >
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                          <h3 className="font-bold text-[13px] text-slate-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            AI 추천 교정안
                          </h3>
                          <button onClick={() => setShowCorrectionUI(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-white">
                          {isCorrecting ? (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                              <Loader2 className="w-6 h-6 animate-spin mb-3 text-indigo-400" />
                              <span className="text-[13px] font-medium">더 자연스러운 문장을 고민하고 있습니다...</span>
                            </div>
                          ) : correctionSuggestions.length > 0 ? (
                            <div className="space-y-3">
                              {correctionSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => applyCorrection(suggestion)}
                                  className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group flex items-start gap-3 hover:shadow-sm"
                                >
                                  <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-500 font-bold text-[11px] flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {idx + 1}
                                  </div>
                                  <div className="text-[14px] font-medium text-slate-700 leading-[1.7] group-hover:text-indigo-950 flex-1">
                                    {suggestion}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-slate-500 text-[13px]">
                              제안을 불러오지 못했습니다.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>`;

code = code.replace(editorTarget, editorReplace);

fs.writeFileSync('src/components/Workspace.tsx', code);
