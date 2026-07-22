import fs from 'fs';
let code = fs.readFileSync('src/components/ToolsPanel.tsx', 'utf-8');

// Add Eye icon to lucide imports
code = code.replace("CheckCircle2, BookOpen", "CheckCircle2, BookOpen, Eye");
code = code.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");

// Add showPreview state
const stateTarget = "  const [exportFormat, setExportFormat] = useState<'txt' | 'md'>('md');";
const stateReplace = "  const [exportFormat, setExportFormat] = useState<'txt' | 'md'>('md');\n  const [showPreview, setShowPreview] = useState(false);";
code = code.replace(stateTarget, stateReplace);

// Add Preview Button and Area
const btnTarget = `            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6">
              <Button variant="outline" onClick={handleCopyCustom} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto h-11 px-6 rounded-xl font-bold tracking-wide text-[13px]">
                <FileText className="w-4 h-4 mr-2" /> 클립보드에 복사
              </Button>
              <Button onClick={handleExportCustom} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm w-full sm:w-auto h-11 px-6 rounded-xl font-bold tracking-wide text-[13px]">
                <Download className="w-4 h-4 mr-2" /> 텍스트 파일로 다운로드
              </Button>
            </div>`;

const btnReplace = `            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className={\`bg-white border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto h-11 px-6 rounded-xl font-bold tracking-wide text-[13px] \${showPreview ? 'bg-slate-100' : ''}\`}>
                <Eye className="w-4 h-4 mr-2" /> 미리보기
              </Button>
              <Button variant="outline" onClick={handleCopyCustom} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto h-11 px-6 rounded-xl font-bold tracking-wide text-[13px]">
                <FileText className="w-4 h-4 mr-2" /> 클립보드에 복사
              </Button>
              <Button onClick={handleExportCustom} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm w-full sm:w-auto h-11 px-6 rounded-xl font-bold tracking-wide text-[13px]">
                <Download className="w-4 h-4 mr-2" /> 다운로드
              </Button>
            </div>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-6"
                >
                  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-inner relative">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md">PREVIEW - {exportScope} / .{exportFormat}</span>
                    </div>
                    <pre className="text-slate-300 font-mono text-[13px] leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                      {generateExportContent() || "내보낼 내용이 없습니다."}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>`;
code = code.replace(btnTarget, btnReplace);

fs.writeFileSync('src/components/ToolsPanel.tsx', code);
