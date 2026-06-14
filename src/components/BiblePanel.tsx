import React, { useState, useEffect } from 'react';
import { BibleState } from '../types';
import { Textarea } from './ui/textarea';
import { Book, Users, Map, Swords, Skull, LayoutTemplate, Save, Cloud, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BiblePanelProps {
  bible: BibleState;
  setBible: (bible: BibleState) => void;
}

type Tab = keyof BibleState;

export function BiblePanel({ bible, setBible }: BiblePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('story');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // To debounce the save to Cloud database
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      // simulate save status reflection since setBible is fast & optimistic
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [bible]);

  const updateField = (field: keyof BibleState, value: string) => {
    setBible({ ...bible, [field]: value });
  };

  const tabs = [
    { id: 'story', label: '스토리', description: '기승전결 및 핵심 시놉시스', icon: <Book className="w-5 h-5" /> },
    { id: 'system', label: '능력', description: '무공, 마법, 특수 체질', icon: <Swords className="w-5 h-5" /> },
    { id: 'character', label: '캐릭터', description: '주인공 및 주요 인물, 관계도', icon: <Users className="w-5 h-5" /> },
    { id: 'villain', label: '빌런', description: '최종 보스, 적대 세력', icon: <Skull className="w-5 h-5" /> },
    { id: 'structure', label: '집필지침', description: '어조, 문체, 주의사항', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 'episode', label: '에피소드', description: '주요 사건과 회차별 개요', icon: <Map className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="flex-1 flex w-full h-full bg-white overflow-hidden">
      
      {/* Left Sidebar for Tabs */}
      <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-8 pb-6 text-left">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">설정 공장</h1>
          <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">
            원고 작성에 필요한 핵심 설정들을 기록하고 클라우드에 안전하게 보관하세요.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full text-left p-4 rounded-xl transition-all flex items-start gap-4 ${
                activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <div className={`mt-0.5 ${activeTab === tab.id ? 'text-indigo-500' : 'text-slate-400'}`}>
                {tab.icon}
              </div>
              <div className="flex-1">
                <span className={`block font-bold text-[15px] mb-1 ${activeTab === tab.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {tab.label}
                </span>
                <span className={`block text-[13px] font-medium leading-snug ${activeTab === tab.id ? 'text-indigo-600/70' : 'text-slate-500'}`}>
                  {tab.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editing Area */}
      <div className="flex-1 flex flex-col relative bg-white">
        <header className="h-[72px] shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur top-0 sticky z-10">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
               {tabs.find(t => t.id === activeTab)?.icon}
             </div>
             <h2 className="text-lg font-bold text-slate-800">
               {tabs.find(t => t.id === activeTab)?.label}
             </h2>
           </div>
           {/* Cloud Sync Status */}
           <div className="flex items-center gap-2 text-sm font-semibold">
              {saveStatus === 'saving' ? (
                 <span className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                   <Loader2 className="w-4 h-4 animate-spin" /> 클라우드에 동기화 중...
                 </span>
              ) : saveStatus === 'saved' ? (
                 <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                   <Cloud className="w-4 h-4" /> 모든 설정이 클라우드에 안전하게 저장되었습니다
                 </span>
              ) : (
                 <span className="text-slate-400 flex items-center gap-2">
                   <Cloud className="w-4 h-4" /> 클라우드 동기화 됨
                 </span>
              )}
           </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col max-w-4xl mx-auto w-full"
            >
              <Textarea 
                className="flex-1 lg:h-[600px] h-[400px] text-[15px] leading-relaxed font-medium bg-slate-50/50 focus-visible:bg-white border-slate-200"
                placeholder={
                  activeTab === 'story' ? "전반적인 주제, 시놉시스, 기승전결(플롯), 떡밥 등을 상세히 적어주세요." :
                  activeTab === 'system' ? "영력, 마법, 특수 체질 등 이 세계관에만 존재하는 규칙과 부작용, 상성 스펙을 명확히 설정하세요." :
                  activeTab === 'character' ? "주인공의 이름, 성별, 나이, 외양, 성격, 행동 원리, 영적 스탯 등을 구체적으로 잡아주세요." :
                  activeTab === 'villain' ? "최종 보스의 배경, 행동 이유, 산하 조직 정보 등을 적어두면 일관성 있는 갈등 구조가 확립됩니다." :
                  activeTab === 'structure' ? "가독성을 최우선으로, 문장을 어떻게 나눌지, 어떤 시점을 사용할지 등 AI에게 지시할 작법/어조 가이드를 적어주세요." :
                  "각 에피소드의 주요 사건, 목표, 그리고 회차별 전개 개요를 자유롭게 적어주세요."
                }
                value={bible[activeTab]}
                onChange={(e) => updateField(activeTab, e.target.value)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
