import React, { useState, useEffect } from 'react';
import { BibleState } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Book, Users, Map, Swords, Skull, LayoutTemplate, Save, Cloud, Loader2, Zap, Copy, FilePlus } from 'lucide-react';
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
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [bible]);

  const updateField = (field: keyof BibleState, value: string) => {
    setBible({ ...bible, [field]: value });
  };

  const insertTemplate = () => {
    let template = '';
    switch(activeTab) {
        case 'logline':
            template = "■ 제목 후보\n1. \n2. \n3. \n\n■ 장르\n- \n\n■ 로그라인 (1줄 요약)\n- \n\n■ 핵심 셀링 포인트 (사이다 요소, 매력 포인트)\n1. \n2. \n";
            break;
        case 'story':
            template = "■ 핵심 갈등 플롯\n- \n\n■ 기승전결 플롯 (3줄 요약)\n[기] (발단 및 목적 부여): \n[승] (장애물과 시련): \n[전] (위기 및 전환점): \n[결] (카타르시스와 보상): \n\n■ 초반 전개 (1~5화) 요약\n- \n";
            break;
        case 'system':
            template = "■ 주인공의 고유 능력 (치트)\n- \n\n■ 파워 밸런스 / 성장의 척도\n- \n\n■ 세계관 특수 설정 (마법/무공/상태창)\n- \n\n■ 패널티 / 한계점\n- \n";
            break;
        case 'character':
            template = "■ 주인공\n- 이름: \n- 성격/행동 원리: \n- 외형: \n- 핵심 결핍/욕망: \n- 주요 능력: \n\n■ 주요 조력자 1\n- 이름: \n- 주인공과의 관계: \n- 특징: \n\n■ 임시 인물들\n- \n";
            break;
        case 'villain':
            template = "■ 최종 보스/흑막\n- 정체: \n- 목적: \n- 압도적인 능력/규모: \n\n■ 대립 세력 / 안티고니스트\n- \n\n■ 대립 이유\n- \n";
            break;
        case 'structure':
            template = "■ 어조 및 문체\n- \n\n■ 시점\n- \n\n■ 전개 속도 및 주의사항\n- 웹소설식 짧고 간결한 문장 사용 (2~3문장마다 줄바꿈)\n- 지루한 설명은 빼고 대사와 행동 위주로 전개\n\n■ 회차 끊기 / 클리프행어 지침\n- \n";
            break;
        case 'episode':
            template = "■ [진행 중] 에피소드 개요\n- 메인 목표: \n- 주요 사건: \n- 얻게 되는 보상/카타르시스: \n\n■ 회차별 트리트먼트\n1화: \n2화: \n3화: \n";
            break;
    }
    
    // Append or replace? Append with newlines if content exists.
    const currentText = bible[activeTab];
    const newText = currentText ? currentText + "\n\n" + template : template;
    updateField(activeTab, newText);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bible[activeTab]);
      alert('현재 탭의 내용이 클립보드에 복사되었습니다.');
    } catch (err) {
      alert('복사에 실패했습니다.');
    }
  };

  const tabs = [
    { id: 'logline', label: '핵심/로그라인', description: '제목, 장르, 로그라인, 기대효과', icon: <Zap className="w-5 h-5" /> },
    { id: 'story', label: '스토리', description: '기승전결 및 핵심 시놉시스', icon: <Book className="w-5 h-5" /> },
    { id: 'system', label: '능력', description: '치트, 무공, 마법, 특수 체질', icon: <Swords className="w-5 h-5" /> },
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
             <div>
               <h2 className="text-lg font-bold text-slate-800">
                 {tabs.find(t => t.id === activeTab)?.label}
               </h2>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             {/* Text Stats */}
             <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
               <span>공백포함: {bible[activeTab].length.toLocaleString()}자</span>
             </div>

             {/* Cloud Sync Status */}
             <div className="flex items-center gap-2 text-[13px] font-semibold tracking-wide border-l border-slate-200 pl-4">
                {saveStatus === 'saving' ? (
                   <span className="text-slate-500 flex items-center gap-2">
                     <Loader2 className="w-3.5 h-3.5 animate-spin" /> 동기화 중...
                   </span>
                ) : saveStatus === 'saved' ? (
                   <span className="text-emerald-600 flex items-center gap-2">
                     <Cloud className="w-3.5 h-3.5" /> 클라우드 저장됨
                   </span>
                ) : (
                   <span className="text-slate-400 flex items-center gap-2">
                     <Cloud className="w-3.5 h-3.5 opacity-50" /> 동기화 완료
                   </span>
                )}
             </div>
           </div>
        </header>

        {/* Action Toolbar */}
        <div className="border-b border-slate-100 bg-white/50 px-8 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
           <p className="text-[13px] text-slate-500 font-medium">자동 양식을 사용하면 틀에 맞춰 쉽게 설정을 정리할 수 있습니다.</p>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={insertTemplate} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 bg-white h-8 text-[13px]">
                <FilePlus className="w-3.5 h-3.5 mr-1.5" /> 템플릿(양식) 채우기
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-slate-600 border-slate-200 hover:bg-slate-50 bg-white h-8 text-[13px]">
                <Copy className="w-3.5 h-3.5 mr-1.5" /> 현재 탭 복사
              </Button>
           </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
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
                className="flex-1 h-full min-h-[400px] text-[15px] leading-relaxed font-medium bg-white focus-visible:bg-white border-slate-200 shadow-sm resize-none rounded-xl p-6"
                placeholder={
                  activeTab === 'logline' ? "• [장르] (예: 현대판타지, 회빙환)\n• [제목 추천 후보]\n• [로그라인/1줄 요약] (예: 최하급 헌터가 죽음 직전 과거로 돌아가 모든 걸 씹어먹는 이야기)\n• [기대효과/독자 후킹 포인트] (예: 사이다 전개, 성좌들의 반응)" :
                  activeTab === 'story' ? "• [전반적인 주제]\n• [핵심 시놉시스 (3줄 요약)]\n• [기승전결(플롯) 및 주요 갈등]\n• [1~15화 초반 전개 방향 및 떡밥]" :
                  activeTab === 'system' ? "• [치트키/사이다 액션 요소]\n• [주인공만의 특별한 능력/상태창/보상 시스템]\n• [세계관 고유의 마법/무공 규칙과 부작용]\n• [상성 및 스펙 밸런스 설정]" :
                  activeTab === 'character' ? "• [주인공] (이름, 외양, 결핍, 성격, 행동 원리, 영적 스탯, 치트 능력)\n• [주요 조력자/동료] (이름, 능력, 주인공과의 관계)\n• [캐릭터 관계도 및 케미스트리 포인트]" :
                  activeTab === 'villain' ? "• [최종 보스/흑막] (배경, 목적, 행동 이유)\n• [중간 보스 및 안티고니스트]\n• [주인공과의 대립 구조 및 적대 세력(산하 조직)]\n• [위기감 조성 방식]" :
                  activeTab === 'structure' ? "• [어조 및 문체] (예: 가독성을 최우선으로, 짧고 간결한 문장, 웹소설식 엔터키 활용)\n• [전개 속도] (예: 지루한 설명은 빼고 대사와 행동 위주로)\n• [시점] (예: 1인칭 주인공 시점, 독백과 내면 심리 적극 활용)\n• [클리프행어/회차 끊기 규칙]" :
                  "• [현재 진행 중인 에피소드 목표]\n• [이 회차의 주요 사건 및 갈등]\n• [주인공이 얻게 되는 보상 혹은 깨달음]\n• [회차별 전개 개요 자유 작성]"
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
