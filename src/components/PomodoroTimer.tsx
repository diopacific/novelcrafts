import { toast } from "../lib/toast";
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, FastForward } from 'lucide-react';
import { Button } from './ui/button';
import { ThreePomodoroRing } from './ThreePomodoroRing';

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
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-fit' : 'w-72'} bg-[#070913]/90 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/[0.1] overflow-hidden text-slate-100`}>
      {isMinimized ? (
        <button 
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
          title="집중 타이머 펼치기"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? (isWork ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]') : 'bg-slate-600'}`} />
          <Timer className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-amber-200 text-xs tracking-widest">{formatTime(timeLeft)}</span>
        </button>
      ) : (
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-400" />
              <span>집중 집필 타이머</span>
            </h3>
            <button 
              onClick={() => setIsMinimized(true)} 
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors text-xs font-bold"
              title="최소화"
            >
              ─
            </button>
          </div>
          
          <div className="p-5 flex flex-col items-center">
            <div className="flex gap-1.5 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-5 w-full">
              <button 
                onClick={() => switchMode('work')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${isWork ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                집필 (25분)
              </button>
              <button 
                onClick={() => switchMode('break')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!isWork ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                휴식 (5분)
              </button>
            </div>
            
            <div className="relative w-44 h-44 mb-5 flex items-center justify-center">
              <ThreePomodoroRing progress={1 - timeLeft / (isWork ? WORK_TIME : BREAK_TIME)} isWork={isWork} />
              <div className={`text-3xl font-mono font-black tracking-widest relative z-10 ${isWork ? 'text-amber-300' : 'text-emerald-400'} drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full">
              <Button 
                onClick={toggleTimer}
                className={`flex-1 h-9.5 rounded-xl font-bold text-xs transition-all ${
                  isActive 
                    ? 'bg-white/[0.1] text-amber-300 hover:bg-white/[0.15] border border-white/[0.1]' 
                    : (isWork 
                        ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                        : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]')
                }`}
              >
                {isActive ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                {isActive ? '일시정지' : '시작'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetTimer} 
                className="h-9.5 px-3 bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl" 
                title="초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => switchMode(isWork ? 'break' : 'work')} 
                className="h-9.5 px-3 bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl" 
                title="다음 모드로 전환"
              >
                <FastForward className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
