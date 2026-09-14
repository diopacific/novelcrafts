import fs from 'fs';
let code = fs.readFileSync('src/components/PomodoroTimer.tsx', 'utf-8');

// Add import
code = code.replace("import { Button } from './ui/button';", "import { Button } from './ui/button';\nimport { ThreePomodoroRing } from './ThreePomodoroRing';");

const svgTarget = `            <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="46" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  className="text-slate-100" 
                />
                <circle 
                  cx="50" cy="50" r="46" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  strokeDasharray={289.026}
                  strokeDashoffset={289.026 * (1 - timeLeft / (isWork ? WORK_TIME : BREAK_TIME))}
                  className={\`\${isWork ? 'text-indigo-500' : 'text-emerald-500'} transition-all duration-1000 ease-linear\`}
                />
              </svg>
              <div className={\`text-4xl font-mono font-black tracking-widest relative z-10 \${isWork ? 'text-indigo-600' : 'text-emerald-600'}\`}>
                {formatTime(timeLeft)}
              </div>
            </div>`;

const svgReplace = `            <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
              <ThreePomodoroRing progress={1 - timeLeft / (isWork ? WORK_TIME : BREAK_TIME)} isWork={isWork} />
              <div className={\`text-4xl font-mono font-black tracking-widest relative z-10 \${isWork ? 'text-indigo-600' : 'text-emerald-600'} drop-shadow-sm\`}>
                {formatTime(timeLeft)}
              </div>
            </div>`;

code = code.replace(svgTarget, svgReplace);

fs.writeFileSync('src/components/PomodoroTimer.tsx', code);
