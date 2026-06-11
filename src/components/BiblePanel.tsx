import React, { useState } from 'react';
import { BibleState } from '../types';
import { Textarea } from './ui/textarea';
import { Book, Users, Map, Swords, Skull, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BiblePanelProps {
  bible: BibleState;
  setBible: (bible: BibleState) => void;
}

type Tab = keyof BibleState;

export function BiblePanel({ bible, setBible }: BiblePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('story');

  const updateField = (field: keyof BibleState, value: string) => {
    setBible({ ...bible, [field]: value });
  };

  const tabs = [
    { id: 'story', label: '스토리', icon: <Book className="w-[18px] h-[18px]" /> },
    { id: 'world', label: '세계관', icon: <Map className="w-[18px] h-[18px]" /> },
    { id: 'system', label: '퇴마/능력', icon: <Swords className="w-[18px] h-[18px]" /> },
    { id: 'character', label: '캐릭터', icon: <Users className="w-[18px] h-[18px]" /> },
    { id: 'villain', label: '빌런', icon: <Skull className="w-[18px] h-[18px]" /> },
    { id: 'structure', label: '작품 구성', icon: <LayoutTemplate className="w-[18px] h-[18px]" /> },
  ] as const;

  return (
    <div className="w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
      <div className="p-6 pb-5 border-b border-slate-100 shrink-0">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">작품 설정 바이블</h2>
        <p className="text-[13px] text-slate-500 mt-1.5 font-medium leading-relaxed">
          총 6종류의 설정집을 작성하여 로컬에 안전하게 저장합니다.<br/>
          인공지능이 이를 참고하여 완벽한 일관성을 유지합니다.
        </p>
      </div>
      
      <div className="px-5 py-4 border-b border-slate-200 gap-2.5 flex flex-wrap bg-slate-50/50 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-3 py-2.5 text-[13px] rounded-xl font-semibold flex items-center justify-center grow gap-2 transition-all ${
              activeTab === tab.id 
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 ring-1 ring-indigo-500/10' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 relative custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'story' && (
            <motion.div key="story" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="h-full flex flex-col">
              <label className="text-[15px] font-bold text-slate-800 block mb-3 flex items-center gap-2">
                <Book className="w-4 h-4 text-indigo-500" /> 스토리 (Story)
              </label>
              <Textarea 
                className="flex-1"
                placeholder="전반적인 주제, 시놉시스, 기승전결(플롯), 떡밥 등을 적어주세요."
                value={bible.story}
                onChange={(e) => updateField('story', e.target.value)}
              />
            </motion.div>
          )}

          {activeTab === 'world' && (
            <motion.div key="world" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="h-full flex flex-col">
              <label className="text-[15px] font-bold text-slate-800 block mb-3 flex items-center gap-2">
                <Map className="w-4 h-4 text-indigo-500" /> 세계관 (World)
              </label>
              <Textarea 
                className="flex-1"
                placeholder="지리적 특성, 주요 국가/조직, 세력 구도, 역사적 배경 등 세계관을 자세히 적어주세요."
                value={bible.world}
                onChange={(e) => updateField('world', e.target.value)}
              />
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div key="system" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="h-full flex flex-col">
              <label className="text-[15px] font-bold text-slate-800 block mb-3 flex items-center gap-2">
                <Swords className="w-4 h-4 text-indigo-500" /> 퇴마/능력 시스템 (System)
              </label>
              <Textarea 
                className="flex-1"
                placeholder="마법, 신성력, 기, 영력, 주술 등 작품에 등장하는 초월적 능력의 원리, 상성 체계, 제약이나 대가 등을 구체적으로 서술해주세요."
                value={bible.system}
                onChange={(e) => updateField('system', e.target.value)}
              />
            </motion.div>
          )}

          {activeTab === 'character' && (
            <motion.div key="character" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="h-full flex flex-col">
              <label className="text-[15px] font-bold text-slate-800 block mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> 주요 캐릭터 (Characters)
              </label>
              <Textarea 
                className="flex-1"
                placeholder="주인공 및 든든한 조력자들의 이름, 외형, 능력, 성향, 말버릇, 동기, 약점 등을 나열해주세요."
                value={bible.character}
                onChange={(e) => updateField('character', e.target.value)}
              />
            </motion.div>
          )}

          {activeTab === 'villain' && (
            <motion.div key="villain" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="h-full flex flex-col">
              <label className="text-[15px] font-bold text-slate-800 block mb-3 flex items-center gap-2">
                <Skull className="w-4 h-4 text-indigo-500" /> 빌런/세력 (Villains)
              </label>
              <Textarea 
                className="flex-1"
                placeholder="최종 보스, 중간 보스, 적대적인 세력이나 괴물들의 스펙, 목적, 특성, 주인공과의 갈등 요소를 적어주세요."
                value={bible.villain}
                onChange={(e) => updateField('villain', e.target.value)}
              />
            </motion.div>
          )}

          {activeTab === 'structure' && (
            <motion.div key="structure" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="h-full flex flex-col">
              <label className="text-[15px] font-bold text-slate-800 block mb-3 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-indigo-500" /> 작품 구성 및 전개 (Structure)
              </label>
              <Textarea 
                className="flex-1"
                placeholder="각 장(에피소드)별 분량, 사건이 진행되는 템포, 1인칭 관찰자 시점 등 전개에 필요한 규칙과 연출 방향을 적어주세요."
                value={bible.structure}
                onChange={(e) => updateField('structure', e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
