import { toast } from "../lib/toast";
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee } from 'lucide-react';
import { Button } from './ui/button';

export function PomodoroTimer() {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      // Play a sound or alarm here optionally
      toast.info(isWork ? '집중 시간이 끝났습니다! 5분 휴식을 취하세요.' : '휴식이 끝났습니다! 다시 집필을 시작하세요.');
      setIsWork(!isWork);
      setTimeLeft(!isWork ? WORK_TIME : BREAK_TIME);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isWork]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWork ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (mode: 'work' | 'break') => {
    setIsActive(false);
    setIsWork(mode === 'work');
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-fit' : 'w-72'} bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 overflow-hidden`}>
      {isMinimized ? (
        <button 
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 transition-colors"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? (isWork ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse') : 'bg-slate-300'}`} />
          <Timer className="w-5 h-5 text-slate-600" />
          <span className="font-mono font-bold text-slate-700 text-sm tracking-widest">{formatTime(timeLeft)}</span>
        </button>
      ) : (
        <div className="flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
              <Timer className="w-4 h-4 text-indigo-500" />
              집중 집필 타이머
            </h3>
            <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
              ─
            </button>
          </div>
          
          <div className="p-5 flex flex-col items-center">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6 w-full">
              <button 
                onClick={() => switchMode('work')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${isWork ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                집필 (25분)
              </button>
              <button 
                onClick={() => switchMode('break')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${!isWork ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                휴식 (5분)
              </button>
            </div>
            
            <div className={`text-5xl font-mono font-black tracking-widest mb-6 ${isWork ? 'text-indigo-600' : 'text-emerald-600'}`}>
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex items-center gap-3 w-full">
              <Button 
                onClick={toggleTimer}
                className={`flex-1 h-10 ${isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : (isWork ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-emerald-600 text-white hover:bg-emerald-700')}`}
              >
                {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isActive ? '일시정지' : '시작'}
              </Button>
              <Button variant="outline" onClick={resetTimer} className="h-10 px-3 bg-white">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
