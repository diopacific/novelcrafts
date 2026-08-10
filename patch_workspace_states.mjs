import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

// Add new states and ref
const stateTarget = `  const [aiFeedback, setAiFeedback] = useState<string | null>(null);`;
const stateReplace = `  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // AI Correction State
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionSuggestions, setCorrectionSuggestions] = useState<string[]>([]);
  const [showCorrectionUI, setShowCorrectionUI] = useState(false);`;

code = code.replace(stateTarget, stateReplace);

// Add handleSelectionChange and handleAiCorrection
const handlersTarget = `  const handleAiAutocomplete = async () => {`;
const handlersReplace = `  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        setSelectionStart(start);
        setSelectionEnd(end);
        setSelectedText(formState.content.substring(start, end));
      } else {
        setSelectedText("");
        setShowCorrectionUI(false);
      }
    }
  };

  const handleAiCorrection = async () => {
    if (!selectedText.trim()) return;
    
    setIsCorrecting(true);
    setShowCorrectionUI(true);
    setCorrectionSuggestions([]);
    
    try {
      const baseBible = \`핵심/로그라인: \${bible.logline}\\n스토리: \${bible.story}\\n세계관: \${bible.world}\\n캐릭터: \${bible.character}\`;
      const beforeText = formState.content.substring(Math.max(0, selectionStart - 500), selectionStart);
      const afterText = formState.content.substring(selectionEnd, Math.min(formState.content.length, selectionEnd + 500));
      const context = \`[이전 문맥]\\n\${beforeText}\\n\\n[이후 문맥]\\n\${afterText}\\n\\n[설정 참고]\\n\${baseBible}\`;
      
      const response = await fetch('/api/ai/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          context: context
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.suggestions) {
        setCorrectionSuggestions(data.suggestions);
      } else {
        toast.error(data.error || '교정 제안 생성에 실패했습니다.');
        setShowCorrectionUI(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('통신 오류가 발생했습니다.');
      setShowCorrectionUI(false);
    } finally {
      setIsCorrecting(false);
    }
  };

  const applyCorrection = (suggestion: string) => {
    const newContent = formState.content.substring(0, selectionStart) + suggestion + formState.content.substring(selectionEnd);
    setFormState(prev => ({ ...prev, content: newContent }));
    setSelectedText("");
    setShowCorrectionUI(false);
    toast.success('문장이 교정되었습니다.');
    
    // Reset selection in textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(selectionStart, selectionStart + suggestion.length);
      }
    }, 50);
  };

  const handleAiAutocomplete = async () => {`;

code = code.replace(handlersTarget, handlersReplace);

// Update Textarea with ref and handlers
const textareaTarget = `                  <Textarea 
                    className={\`\${isFullscreen ? 'min-h-[calc(100vh-240px)] h-[calc(100vh-240px)]' : 'min-h-[600px] h-[600px]'} w-full bg-white border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 font-medium leading-[2.2] text-slate-800 shadow-md resize-y transition-all rounded-2xl py-6 pr-8 pl-6 sm:pl-16 placeholder:text-slate-300 custom-scrollbar relative z-0\`}
                    style={{ fontSize: \`\${editorFontSize}px\`, wordBreak: 'keep-all' }}
                    value={formState.content}
                    onChange={(e) => handleContentChange('content', e.target.value)}
                    placeholder="독자를 사로잡을 첫 문장을 입력하세요..."
                  />`;
const textareaReplace = `                  <Textarea 
                    ref={textareaRef}
                    className={\`\${isFullscreen ? 'min-h-[calc(100vh-240px)] h-[calc(100vh-240px)]' : 'min-h-[600px] h-[600px]'} w-full bg-white border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 font-medium leading-[2.2] text-slate-800 shadow-md resize-y transition-all rounded-2xl py-6 pr-8 pl-6 sm:pl-16 placeholder:text-slate-300 custom-scrollbar relative z-0\`}
                    style={{ fontSize: \`\${editorFontSize}px\`, wordBreak: 'keep-all' }}
                    value={formState.content}
                    onChange={(e) => handleContentChange('content', e.target.value)}
                    onSelect={handleSelectionChange}
                    onMouseUp={handleSelectionChange}
                    onKeyUp={handleSelectionChange}
                    placeholder="독자를 사로잡을 첫 문장을 입력하세요..."
                  />`;
code = code.replace(textareaTarget, textareaReplace);

// Add UI for Correction Button
const headerTarget = `                    <div className="flex items-center gap-1.5 w-32 hidden sm:flex" title="목표 글자수 (5500자)">
                      <div className="flex-1 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">`;
const headerReplace = `                    <AnimatePresence>
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
                    </AnimatePresence>
                    <div className="flex items-center gap-1.5 w-32 hidden sm:flex" title="목표 글자수 (5500자)">
                      <div className="flex-1 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">`;
code = code.replace(headerTarget, headerReplace);

// Add UI for Correction Suggestions
const uiTarget = `                  {/* Floating AI Tools Toolbar (Appears on focus/hover in a real app, placed statically here) */}`;
const uiReplace = `                  {/* AI Sentence Correction UI */}
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
                  </AnimatePresence>

                  {/* Floating AI Tools Toolbar (Appears on focus/hover in a real app, placed statically here) */}`;
code = code.replace(uiTarget, uiReplace);

fs.writeFileSync('src/components/Workspace.tsx', code);
