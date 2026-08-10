import fs from 'fs';
let code = fs.readFileSync('src/components/PomodoroTimer.tsx', 'utf-8');

// Add FastForward icon import
code = code.replace("import { Play, Pause, RotateCcw, Timer, Coffee } from 'lucide-react';", "import { Play, Pause, RotateCcw, Timer, Coffee, FastForward } from 'lucide-react';");

const skipTarget = `              <Button variant="outline" onClick={resetTimer} className="h-10 px-3 bg-white">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>`;

const skipReplace = `              <Button variant="outline" onClick={resetTimer} className="h-10 px-3 bg-white" title="초기화">
                <RotateCcw className="w-4 h-4 text-slate-500" />
              </Button>
              <Button variant="outline" onClick={() => switchMode(isWork ? 'break' : 'work')} className="h-10 px-3 bg-white" title="다음으로 건너뛰기">
                <FastForward className="w-4 h-4 text-slate-500" />
              </Button>
            </div>`;

code = code.replace(skipTarget, skipReplace);

fs.writeFileSync('src/components/PomodoroTimer.tsx', code);
