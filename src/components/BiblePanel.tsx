import React, { useState, useEffect, useMemo } from 'react';
import { BibleState } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CharacterGraph } from './CharacterGraph';
import { Book, Users, Map, Swords, Skull, LayoutTemplate, Save, Cloud, Loader2, Zap, Copy, FilePlus, Lightbulb, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BiblePanelProps {
  bible: BibleState;
  setBible: (bible: BibleState) => void;
}

type Tab = keyof BibleState;

const TAB_TIPS: Record<Tab, { title: string; items: string[] }> = {
  logline: {
    title: "로그라인 작성 팁",
    items: [
      "누가(주인공), 어떤 결핍을 가졌고, 무엇을 목표로 하는지 명확히 하세요.",
      "웹소설 독자는 '사이다'를 기대합니다. 장애물을 어떻게 시원하게 돌파할지 한 줄에 담아보세요.",
      "제목은 글의 얼굴입니다. 장르 직관성이 높고 트렌디한 키워드를 포함하세요."
    ]
  },
  story: {
    title: "스토리 플롯 팁",
    items: [
      "초반 1~5화 안에서 주인공의 특별한 능력과 확실한 목적을 부여해야 합니다.",
      "기승전결에서 '승'과 '전'을 길게 끌면 독자가 이탈합니다. 빠른 템포를 유지하세요.",
      "위기 다음엔 반드시 그보다 큰 보상과 카타르시스가 따라와야 합니다."
    ]
  },
  world: {
    title: "세계관 설정 팁",
    items: [
      "고유 명사는 최소한으로 사용하세요. 독자가 직관적으로 이해할 수 있는 단어가 좋습니다.",
      "모든 설정을 초반에 설명하지 마세요. 스토리가 전개되며 자연스럽게 드러나는 것이 좋습니다.",
      "세계관의 규칙은 주인공에게 유리하게 작용하기도 하지만, 때로는 제약이 되어 긴장감을 줍니다."
    ]
  },
  system: {
    title: "능력 및 설정 팁",
    items: [
      "주인공의 능력(치트)은 독자가 기대하는 시원한 전개의 핵심 동력입니다.",
      "초반부터 모든 능력을 열지 말고, 성장과 성취감을 줄 수 있도록 해금 조건을 설정하세요.",
      "긴장감을 위해 적절한 패널티나 한계점(쿨타임, 조건)을 부여하면 더욱 흥미로워집니다."
    ]
  },
  character: {
    title: "캐릭터 조형 팁",
    items: [
      "주인공은 주도적이고 목표지향적이어야 합니다. 끌려다니는 주인공은 매력이 떨어집니다.",
      "매력적인 조력자는 주인공의 결핍을 채워주거나, 주인공의 능력을 돋보이게 하는 역할입니다.",
      "입체적인 인물을 위해 그들만의 사소한 버릇이나 행동 원리를 하나쯤 부여하세요."
    ]
  },
  villain: {
    title: "빌런 조형 팁",
    items: [
      "빌런이 강하고 압도적일수록, 그를 꺾었을 때의 카타르시스는 배가 됩니다.",
      "이해할 수 없는 악행보다는, 그들만의 뒤틀린 신념이나 목적이 있을 때 매력적입니다.",
      "주인공의 성장에 맞춰 계단식으로 등장할 수 있도록 세력화/연결성을 부여하세요."
    ]
  },
  structure: {
    title: "집필 지침 팁",
    items: [
      "모바일 구독 환경에 맞춰 2~3문장마다 자주 줄바꿈(엔터)을 하세요.",
      "배경 설명보다는 인물의 대사와 행동 위주로 장면을 전개하는 것이 흡입력이 높습니다.",
      "한 화의 마지막(클리프행어)은 항상 '다음 화가 궁금해지는 타이밍'에서 끊으세요."
    ]
  },
  episode: {
    title: "에피소드 개요 팁",
    items: [
      "각 에피소드는 명확한 '소주제'와 '보상'을 담고 있어야 합니다.",
      "이번 사건을 해결함으로써 주인공이 얻는 이득(아이템, 명성, 단서)을 먼저 정하세요.",
      "무의미한 일상 파트를 줄이고, 메인 플롯과 연결되는 사건을 촘촘히 배치하세요."
    ]
  }
};

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

  const tabs = useMemo(() => [
    { id: 'logline', label: '핵심/로그라인', description: '제목, 장르, 로그라인, 기대효과', icon: <Zap className="w-5 h-5" /> },
    { id: 'story', label: '스토리', description: '기승전결 및 핵심 시놉시스', icon: <Book className="w-5 h-5" /> },
    { id: 'system', label: '능력', description: '치트, 무공, 마법, 특수 체질', icon: <Swords className="w-5 h-5" /> },
    { id: 'character', label: '캐릭터', description: '주인공 및 주요 인물, 관계도', icon: <Users className="w-5 h-5" /> },
    { id: 'villain', label: '빌런', description: '최종 보스, 적대 세력', icon: <Skull className="w-5 h-5" /> },
    { id: 'structure', label: '집필지침', description: '어조, 문체, 주의사항', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 'episode', label: '에피소드', description: '주요 사건과 회차별 개요', icon: <Map className="w-5 h-5" /> },
  ], []);

  const currentTabInfo = useMemo(() => tabs.find(t => t.id === activeTab), [tabs, activeTab]);

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
                <div className="flex items-center justify-between mb-1">
                  <span className={`block font-bold text-[15px] ${activeTab === tab.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {tab.label}
                  </span>
                  {bible[tab.id as Tab]?.trim().length > 0 && (
                    <span className="shrink-0 bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 작 성
                    </span>
                  )}
                </div>
                <span className={`block text-[13px] font-medium leading-snug ${activeTab === tab.id ? 'text-indigo-600/70' : 'text-slate-500'}`}>
                  {tab.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editing Area */}
      <div className="flex-1 flex relative bg-white">
        {/* Editor Center Area */}
        <div className="flex-1 flex flex-col h-full border-r border-slate-100">
          <header className="h-[72px] shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur top-0 sticky z-10">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                 {currentTabInfo?.icon}
               </div>
               <div>
                 <h2 className="text-lg font-bold text-slate-800">
                   {currentTabInfo?.label}
                 </h2>
               </div>
             </div>
             
             <div className="flex items-center gap-4">
               {/* Text Stats */}
               <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md">
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
                       <Cloud className="w-3.5 h-3.5" /> 자동 저장됨
                     </span>
                  ) : (
                     <span className="text-slate-400 flex items-center gap-2">
                       <Cloud className="w-3.5 h-3.5 opacity-50" /> 최신 상태
                     </span>
                  )}
               </div>
             </div>
          </header>

          {/* Action Toolbar */}
          <div className="border-b border-slate-100 bg-white/50 px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm z-10 shrink-0">
             <p className="text-[13px] text-slate-500 font-medium">자동 양식을 사용하면 틀에 맞춰 쉽게 설정을 정리할 수 있습니다.</p>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={insertTemplate} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 bg-white h-8 text-[13px]">
                  <FilePlus className="w-3.5 h-3.5 mr-1.5" /> 템플릿 채우기
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-slate-600 border-slate-200 hover:bg-slate-50 bg-white h-8 text-[13px]">
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> 복사하기
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
                {activeTab === 'character' ? (
                  <div className="flex flex-col gap-6 h-full w-full">
                    <Textarea 
                      className="flex-1 min-h-[300px] text-[15px] leading-relaxed font-medium bg-white focus-visible:bg-white border-slate-200 shadow-sm resize-none rounded-xl p-8 placeholder:text-slate-300"
                      placeholder={"• [주인공] (이름, 외양, 결핍, 성격, 행동 원리, 전투 스펙, 치트 능력)\n• [주요 조력자/동료] (이름, 능력, 주인공과의 관계)\n• [실시간 관계도 시각화]\n텍스트에 'A -> B : 관계' 또는 '이름: A' 형식으로 작성하면 하단에 노드 관계도가 실시간으로 생성됩니다."}
                      value={bible[activeTab]}
                      onChange={(e) => updateField(activeTab, e.target.value)}
                    />
                    <div className="h-[400px] shrink-0 flex flex-col mt-2">
                      <h3 className="text-sm font-bold text-slate-700 mb-3 ml-1 flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        실시간 인물 관계도
                      </h3>
                      <CharacterGraph text={bible.character} />
                    </div>
                  </div>
                ) : (
                  <Textarea 
                    className="flex-1 h-full min-h-[500px] text-[15px] leading-relaxed font-medium bg-white focus-visible:bg-white border-slate-200 shadow-sm resize-none rounded-xl p-8 placeholder:text-slate-300"
                    placeholder={
                      activeTab === 'logline' ? "• [장르] (예: 현대판타지, 회빙환)\n• [제목 추천 후보]\n• [로그라인/1줄 요약] (예: 최하급 헌터가 죽음 직전 과거로 돌아가 모든 걸 씹어먹는 이야기)\n• [기대효과/독자 후킹 포인트] (예: 사이다 전개, 성좌들의 반응)" :
                      activeTab === 'story' ? "• [전반적인 주제]\n• [핵심 시놉시스 (3줄 요약)]\n• [기승전결(플롯) 및 주요 갈등]\n• [1~15화 초반 전개 방향 및 떡밥]" :
                      activeTab === 'system' ? "• [치트키/사이다 액션 요소]\n• [주인공만의 특별한 능력/상태창/보상 시스템]\n• [세계관 고유의 마법/무공 규칙과 부작용]\n• [상성 및 스펙 밸런스 설정]" :
                      activeTab === 'villain' ? "• [최종 보스/흑막] (배경, 목적, 행동 이유)\n• [중간 보스 및 안티고니스트]\n• [주인공과의 대립 구조 및 적대 세력(산하 조직)]\n• [위기감 조성 방식]" :
                      activeTab === 'structure' ? "• [어조 및 문체] (예: 가독성을 최우선으로, 짧고 간결한 문장, 웹소설식 엔터키 활용)\n• [전개 속도] (예: 지루한 설명은 빼고 대사와 행동 위주로)\n• [시점] (예: 1인칭 주인공 시점, 독백과 내면 심리 적극 활용)\n• [클리프행어/회차 끊기 규칙]" :
                      "• [현재 진행 중인 에피소드 목표]\n• [이 회차의 주요 사건 및 갈등]\n• [주인공이 얻게 되는 보상 혹은 깨달음]\n• [회차별 전개 개요 자유 작성]"
                    }
                    value={bible[activeTab]}
                    onChange={(e) => updateField(activeTab, e.target.value)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar for Consultant Tips */}
        <div className="w-80 bg-slate-50/50 hidden xl:flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100 bg-white/50">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              스토리 컨설턴트 팁
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
              현재 탭에 맞는 웹소설 전문 작법 팁을 확인하고 더 매력적인 설정을 구성해 보세요.
            </p>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "-tips"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
                    {TAB_TIPS[activeTab].title}
                  </h3>
                  <ul className="space-y-4">
                    {TAB_TIPS[activeTab].items.map((item, idx) => (
                      <li key={idx} className="text-[13px] text-slate-600 leading-relaxed flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 bg-slate-100 rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                  <h4 className="text-[12px] font-bold text-slate-600 mb-1">AI 자동 완성 제안</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed">상단 툴바의 '템플릿 채우기' 버튼을 활용하면 기본 양식을 자동으로 생성할 수 있습니다.</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
