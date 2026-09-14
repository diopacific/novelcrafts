import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { BibleState, CustomBibleTab } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CharacterGraph } from './CharacterGraph';
import { 
  Book, Users, Map, Swords, Skull, LayoutTemplate, Save, Cloud, Loader2, 
  Zap, Copy, FilePlus, FileMinus, Lightbulb, CheckCircle2, Plus, Trash2, 
  Edit2, Check, X, Sparkles, Globe, Package, Clock, PanelRightClose, 
  PanelRightOpen, Search, ShieldAlert, Wand2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from '../lib/toast';
import { GenrePresetModal } from './bible/GenrePresetModal';
import { BibleAuditModal, BibleAuditResult } from './bible/BibleAuditModal';

interface BiblePanelProps {
  bible: BibleState;
  setBible: (bible: BibleState) => void;
}

type Tab = string;

const TAB_TIPS: Record<string, { title: string; items: string[] }> = {
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
  item: {
    title: "아이템/아티팩트 팁",
    items: [
      "각 아이템의 획득 난이도와 그에 걸맞은 가치를 부여하세요.",
      "아이템이 주인공의 능력을 어떻게 보완하거나 증폭시키는지 명시하세요.",
      "오버밸런스를 막기 위한 사용 조건이나 페널티를 추가하면 스토리에 긴장감이 생깁니다."
    ]
  },
  timeline: {
    title: "연표/타임라인 팁",
    items: [
      "과거의 중요한 역사적 사건이나 전쟁 등을 순서대로 기록하세요.",
      "주인공의 성장 과정이나 주요 에피소드의 시간적 흐름을 정리하세요.",
      "시간선에 따른 떡밥 회수나 복선을 계획할 때 유용합니다."
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

export const BiblePanel = memo(function BiblePanel({ bible, setBible }: BiblePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('story');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState('');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTabLabel, setEditTabLabel] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiIdea, setAiIdea] = useState<string | null>(null);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editorFontSize, setEditorFontSize] = useState(15);

  // New features: Genre Presets and AI Bible Audit
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<BibleAuditResult | null>(null);

  const previousTextRef = useRef<Record<string, string>>({});

  const baseTabs = useMemo(() => [
    { id: 'logline', label: '핵심/로그라인', description: '제목, 장르, 로그라인, 기대효과', icon: <Zap className="w-4 h-4" /> },
    { id: 'story', label: '스토리', description: '기승전결 및 핵심 시놉시스', icon: <Book className="w-4 h-4" /> },
    { id: 'world', label: '세계관/장소', description: '배경, 규칙, 세력', icon: <Globe className="w-4 h-4" /> },
    { id: 'system', label: '능력', description: '치트, 무공, 마법, 특수 체질', icon: <Swords className="w-4 h-4" /> },
    { id: 'item', label: '아이템/유물', description: '핵심 아이템 및 장비', icon: <Package className="w-4 h-4" /> },
    { id: 'character', label: '캐릭터', description: '주인공 및 주요 인물, 관계도', icon: <Users className="w-4 h-4" /> },
    { id: 'villain', label: '빌런', description: '최종 보스, 적대 세력', icon: <Skull className="w-4 h-4" /> },
    { id: 'timeline', label: '연표/타임라인', description: '과거 사건 및 시간선', icon: <Clock className="w-4 h-4" /> },
    { id: 'structure', label: '집필지침', description: '어조, 문체, 주의사항', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'episode', label: '에피소드', description: '주요 사건과 회차별 개요', icon: <Map className="w-4 h-4" /> },
  ], []);

  const allTabs = useMemo(() => {
    const custom = (bible.customTabs || []).map(t => ({
      id: t.id,
      label: t.label,
      description: '커스텀 설정 항목',
      icon: <Book className="w-4 h-4" />,
      isCustom: true
    }));
    return [...baseTabs, ...custom];
  }, [baseTabs, bible.customTabs]);

  // Fix bug: was filtering filteredTabs recursively, causing ReferenceError
  const filteredTabs = useMemo(() => {
    if (!searchTerm.trim()) return allTabs;
    const lowerTerm = searchTerm.toLowerCase();
    return allTabs.filter(t => 
      t.label.toLowerCase().includes(lowerTerm) || 
      getFieldValue(t.id).toLowerCase().includes(lowerTerm)
    );
  }, [allTabs, searchTerm, bible]);

  const currentTabInfo = useMemo(() => allTabs.find(t => t.id === activeTab), [allTabs, activeTab]);

  const updateField = (field: string, value: string) => {
    if (field.startsWith('custom_')) {
      const updatedTabs = (bible.customTabs || []).map(t => 
        t.id === field ? { ...t, content: value } : t
      );
      setBible({ ...bible, customTabs: updatedTabs });
    } else {
      setBible({ ...bible, [field as keyof BibleState]: value });
    }
  };

  const getFieldValue = (field: string): string => {
    if (field.startsWith('custom_')) {
      return (bible.customTabs || []).find(t => t.id === field)?.content || '';
    }
    return (bible[field as keyof BibleState] as string) || '';
  };

  // Run AI Bible Audit
  const handleRunAudit = async () => {
    setIsAuditModalOpen(true);
    setIsAuditing(true);
    try {
      const response = await fetch('/api/ai/bible-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bible })
      });
      const data = await response.json();
      if (response.ok && data.commercialScore !== undefined) {
        setAuditResult(data);
      } else {
        toast.error(data.error || '진단 분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('설정 진단 중 오류가 발생했습니다.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateIdea = async () => {
    setIsGenerating(true);
    setAiIdea(null);
    try {
      const fullContext = `로그라인: ${bible.logline}\n스토리: ${bible.story}\n세계관: ${bible.world}\n캐릭터: ${bible.character}`;
      const response = await fetch('/api/ai/bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabName: baseTabs.find(t => t.id === activeTab)?.label || activeTab,
          text: getFieldValue(activeTab),
          fullContext
        })
      });
      
      const data = await response.json();
      if (response.ok && data.text) {
        setAiIdea(data.text);
      } else {
        toast.error(data.error || 'AI 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOrganizeDraft = async () => {
    const text = getFieldValue(activeTab);
    if (!text || text.trim().length < 10) {
      toast.info('정리할 초안 내용을 최소 10자 이상 입력해주세요.');
      return;
    }
    
    setIsOrganizing(true);
    try {
      const fullContext = `로그라인: ${bible.logline}\n스토리: ${bible.story}\n세계관: ${bible.world}\n캐릭터: ${bible.character}`;
      const response = await fetch('/api/ai/bible-organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabName: baseTabs.find(t => t.id === activeTab)?.label || activeTab,
          text,
          fullContext
        })
      });
      
      const data = await response.json();
      if (response.ok && data.organizedText) {
        previousTextRef.current[activeTab + '_ai_backup'] = text;
        updateField(activeTab, data.organizedText);
        setAiIdea("✨ 초안이 깔끔하게 정리되었습니다.\n\n[편집자 코멘트]\n" + data.feedback + "\n\n💡 마음에 들지 않는다면 하단의 '원본 복구' 버튼을 눌러 되돌릴 수 있습니다.");
      } else {
        toast.error(data.error || 'AI 초안 정리에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsOrganizing(false);
    }
  };

  // Debounce save indicator
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [bible]);

  // Keyboard shortcut Ctrl/Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getCurrentTemplate = () => {
    switch(activeTab) {
      case 'logline':
        return "■ 제목 후보\n1. \n2. \n3. \n\n■ 장르\n- \n\n■ 로그라인 (1줄 요약)\n- \n\n■ 핵심 셀링 포인트 (사이다 요소, 매력 포인트)\n1. \n2. \n";
      case 'story':
        return "■ 핵심 갈등 플롯\n- \n\n■ 기승전결 플롯 (3줄 요약)\n[기] (발단 및 목적 부여): \n[승] (장애물과 시련): \n[전] (위기 및 전환점): \n[결] (카타르시스와 보상): \n\n■ 초반 전개 (1~5화) 요약\n- \n";
      case 'system':
        return "■ 주인공의 고유 능력 (치트)\n- \n\n■ 파워 밸런스 / 성장의 척도\n- \n\n■ 세계관 특수 설정 (마법/무공/상태창)\n- \n\n■ 패널티 / 한계점\n- \n";
      case 'world':
        return "■ 주요 배경/장소\n- \n\n■ 세계관 고유 규칙/상식\n- \n\n■ 주요 세력 및 조직\n- \n";
      case 'item':
        return "■ 핵심 아이템/아티팩트\n- 이름: \n- 등급/가치: \n- 획득 조건: \n- 능력 및 효과: \n- 페널티: \n\n■ 주요 장비 목록\n- \n";
      case 'timeline':
        return "■ 과거 주요 연표\n- [년도/시기]: (사건 내용)\n- [년도/시기]: (사건 내용)\n\n■ 본편 타임라인\n- [에피소드 1]: \n- [에피소드 2]: \n";
      case 'character':
        return "■ 주인공\n- 이름: \n- 성격/행동 원리: \n- 외형: \n- 핵심 결핍/욕망: \n- 주요 능력: \n\n■ 주요 조력자 1\n- 이름: \n- 주인공과의 관계: \n- 특징: \n\n■ 인물 관계도 작성 (A -> B : 관계)\n주인공 -> 한유라 : 신뢰하는 조력자\n장태산 -> 주인공 : 숙적/살해 위협\n";
      case 'villain':
        return "■ 최종 보스/흑막\n- 정체: \n- 목적: \n- 압도적인 능력/규모: \n\n■ 대립 세력 / 안티고니스트\n- \n\n■ 대립 이유\n- \n";
      case 'structure':
        return "■ 어조 및 문체\n- \n\n■ 시점\n- \n\n■ 전개 속도 및 주의사항\n- 웹소설식 짧고 간결한 문장 사용 (2~3문장마다 줄바꿈)\n- 지루한 설명은 빼고 대사와 행동 위주로 전개\n\n■ 회차 끊기 / 클리프행어 지침\n- \n";
      case 'episode':
        return "■ [진행 중] 에피소드 개요\n- 메인 목표: \n- 주요 사건: \n- 얻게 되는 보상/카타르시스: \n\n■ 회차별 트리트먼트\n1화: \n2화: \n3화: \n";
      default:
        return "■ 새로운 설정 항목\n- \n";
    }
  };

  const hasTemplate = () => {
    const template = getCurrentTemplate();
    const firstLine = template.trim().split('\n')[0];
    return getFieldValue(activeTab).includes(firstLine);
  };

  const toggleTemplate = () => {
    const template = getCurrentTemplate();
    const currentText = getFieldValue(activeTab);
    const firstLine = template.trim().split('\n')[0];
    
    if (currentText.includes(firstLine)) {
      const prev = previousTextRef.current[activeTab];
      if (prev !== undefined) {
        updateField(activeTab, prev);
      } else {
        updateField(activeTab, '');
      }
    } else {
      previousTextRef.current[activeTab] = currentText;
      const newText = currentText ? currentText + "\n\n" + template : template;
      updateField(activeTab, newText);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getFieldValue(activeTab));
      toast.success('현재 탭의 내용이 클립보드에 복사되었습니다.');
    } catch (err) {
      toast.error('복사에 실패했습니다.');
    }
  };

  const addCustomTab = () => {
    if (!newTabLabel.trim()) return;
    const newTab: CustomBibleTab = {
      id: `custom_${Date.now()}`,
      label: newTabLabel.trim(),
      content: ''
    };
    setBible({ ...bible, customTabs: [...(bible.customTabs || []), newTab] });
    setNewTabLabel('');
    setIsAddingTab(false);
    setActiveTab(newTab.id);
  };

  const deleteCustomTab = (id: string) => {
    if (confirm('이 커스텀 탭을 삭제하시겠습니까? 기록된 내용은 모두 사라집니다.')) {
      const updatedTabs = (bible.customTabs || []).filter(t => t.id !== id);
      setBible({ ...bible, customTabs: updatedTabs });
      if (activeTab === id) {
        setActiveTab('story');
      }
    }
  };

  const saveEditTab = () => {
    if (!editingTabId || !editTabLabel.trim()) return;
    const updatedTabs = (bible.customTabs || []).map(t => 
      t.id === editingTabId ? { ...t, label: editTabLabel.trim() } : t
    );
    setBible({ ...bible, customTabs: updatedTabs });
    setEditingTabId(null);
  };

  const getPlaceholder = (tabId: string) => {
    switch (tabId) {
      case 'logline': return "• [장르] (예: 현대판타지, 회빙환)\n• [제목 추천 후보]\n• [로그라인/1줄 요약] (예: 최하급 헌터가 죽음 직전 과거로 돌아가 모든 걸 씹어먹는 이야기)\n• [기대효과/독자 후킹 포인트] (예: 사이다 전개, 성좌들의 반응)";
      case 'story': return "• [전반적인 주제]\n• [핵심 시놉시스 (3줄 요약)]\n• [기승전결(플롯) 및 주요 갈등]\n• [1~15화 초반 전개 방향 및 떡밥]";
      case 'world': return "• [주요 배경/장소]\n• [세계관 고유 규칙/상식]\n• [주요 세력 및 조직]";
      case 'system': return "• [치트키/사이다 액션 요소]\n• [주인공만의 특별한 능력/상태창/보상 시스템]\n• [세계관 고유의 마법/무공 규칙과 부작용]\n• [상성 및 스펙 밸런스 설정]";
      case 'item': return "• [핵심 아이템/아티팩트]\n• [주요 장비 목록]";
      case 'villain': return "• [최종 보스/흑막] (배경, 목적, 행동 이유)\n• [중간 보스 및 안티고니스트]\n• [주인공과의 대립 구조 및 적대 세력(산하 조직)]\n• [위기감 조성 방식]";
      case 'timeline': return "• [과거 주요 연표]\n• [본편 에피소드 진행 타임라인]";
      case 'structure': return "• [어조 및 문체] (예: 가독성을 최우선으로, 짧고 간결한 문장, 웹소설식 엔터키 활용)\n• [전개 속도] (예: 지루한 설명은 빼고 대사와 행동 위주로)\n• [시점] (예: 1인칭 주인공 시점, 독백과 내면 심리 적극 활용)\n• [클리프행어/회차 끊기 규칙]";
      case 'episode': return "• [현재 진행 중인 에피소드 목표]\n• [이 회차의 주요 사건 및 갈등]\n• [주인공이 얻게 되는 보상 혹은 깨달음]\n• [회차별 전개 개요 자유 작성]";
      default: return "자유롭게 설정 항목을 작성해 보세요.";
    }
  };

  return (
    <div className="flex-1 flex w-full h-full bg-[#05060a] overflow-hidden text-slate-100">
      
      {/* Left Sidebar for Tabs (Obsidian Glass) */}
      <div className="w-72 md:w-80 bg-[#070913]/90 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col shrink-0 relative z-20">
        <div className="p-5 pb-3 border-b border-white/[0.08] sticky top-0 z-10 bg-[#070913]/95 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1.5">
            <h1 className="text-sm font-black text-slate-100 flex items-center gap-2 tracking-tight">
              <Book className="w-4 h-4 text-amber-400" />
              <span>설정 공장 (Bible)</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
              {allTabs.length}개 탭
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            세계관, 인물, 규칙을 안전하게 보관하고 AI로 분석합니다.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3.5">
            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              title="장르별 공인 설정 프리셋 열기"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>장르 프리셋</span>
            </button>
            <button
              onClick={() => setIsAddingTab(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>커스텀 탭</span>
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div className="px-3.5 py-2.5 border-b border-white/[0.08] bg-black/20">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="설정 항목 및 본문 검색..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400/50 bg-white/[0.03] text-slate-200 placeholder:text-slate-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
          {filteredTabs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500">
              <Search className="w-6 h-6 mb-2 text-slate-600" />
              <p className="text-xs">일치하는 설정이 없습니다.</p>
            </div>
          )}

          {/* 그룹 1: 기본 기획 */}
          {filteredTabs.filter(t => ['logline', 'story', 'structure'].includes(t.id)).length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                기본 기획 플롯
              </div>
              {filteredTabs.filter(t => ['logline', 'story', 'structure'].includes(t.id)).map((tab) => {
                const isActive = activeTab === tab.id;
                const hasText = getFieldValue(tab.id).trim().length > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 border ${
                      isActive 
                        ? 'bg-amber-400/10 border-amber-400/30 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.08)]' 
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-bold text-xs truncate pr-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {tab.label}
                        </span>
                        {hasText && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="block text-[11px] text-slate-400 truncate">
                        {tab.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 그룹 2: 세계관 및 캐릭터 */}
          {filteredTabs.filter(t => ['world', 'system', 'item', 'character', 'villain'].includes(t.id)).length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono pt-2 border-t border-white/[0.06]">
                세계관 & 캐릭터
              </div>
              {filteredTabs.filter(t => ['world', 'system', 'item', 'character', 'villain'].includes(t.id)).map((tab) => {
                const isActive = activeTab === tab.id;
                const hasText = getFieldValue(tab.id).trim().length > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 border ${
                      isActive 
                        ? 'bg-amber-400/10 border-amber-400/30 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.08)]' 
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-bold text-xs truncate pr-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {tab.label}
                        </span>
                        {hasText && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="block text-[11px] text-slate-400 truncate">
                        {tab.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 그룹 3: 전개 및 타임라인 */}
          {filteredTabs.filter(t => ['timeline', 'episode'].includes(t.id)).length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono pt-2 border-t border-white/[0.06]">
                전개 & 타임라인
              </div>
              {filteredTabs.filter(t => ['timeline', 'episode'].includes(t.id)).map((tab) => {
                const isActive = activeTab === tab.id;
                const hasText = getFieldValue(tab.id).trim().length > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 border ${
                      isActive 
                        ? 'bg-amber-400/10 border-amber-400/30 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.08)]' 
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-bold text-xs truncate pr-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {tab.label}
                        </span>
                        {hasText && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="block text-[11px] text-slate-400 truncate">
                        {tab.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 그룹 4: 커스텀 탭 */}
          <div className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span>커스텀 탭</span>
            </div>
            
            {isAddingTab && (
              <div className="p-2 mb-2 bg-white/[0.05] border border-amber-400/30 rounded-xl flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="새로운 탭 이름" 
                  className="w-full text-xs px-2 py-1 rounded-lg bg-black/40 border border-white/[0.1] text-white focus:outline-none focus:border-amber-400"
                  value={newTabLabel}
                  onChange={e => setNewTabLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCustomTab(); else if (e.key === 'Escape') setIsAddingTab(false); }}
                  autoFocus
                />
                <button onClick={addCustomTab} className="p-1 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsAddingTab(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {filteredTabs.filter(t => 'isCustom' in t && t.isCustom).map((tab) => {
              const isActive = activeTab === tab.id;
              const hasText = getFieldValue(tab.id).trim().length > 0;
              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 border ${
                      isActive 
                        ? 'bg-amber-400/10 border-amber-400/30 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.08)]' 
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        {editingTabId === tab.id ? (
                          <div className="flex items-center gap-1 w-full mr-2" onClick={e => e.stopPropagation()}>
                            <input 
                              type="text" 
                              className="w-full text-xs px-1.5 py-0.5 rounded bg-black/50 border border-amber-400 text-white font-bold"
                              value={editTabLabel}
                              onChange={e => setEditTabLabel(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEditTab(); else if (e.key === 'Escape') setEditingTabId(null); }}
                              autoFocus
                            />
                            <button onClick={saveEditTab} className="text-amber-400 hover:text-amber-300 p-0.5"><Check className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <span className={`font-bold text-xs truncate pr-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {tab.label}
                          </span>
                        )}
                        {hasText && !editingTabId && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="block text-[11px] text-slate-400 truncate">
                        {tab.description}
                      </span>
                    </div>
                  </button>
                  
                  {'isCustom' in tab && tab.isCustom && activeTab === tab.id && !editingTabId && (
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); setEditTabLabel(tab.label); }} 
                        className="p-1 text-slate-400 hover:text-amber-300 transition-colors" 
                        title="이름 변경"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteCustomTab(tab.id); }} 
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors" 
                        title="삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Editing Area (Obsidian Center) */}
      <div className="flex-1 flex relative bg-[#05060a] overflow-hidden">
        <div className="flex-1 flex flex-col h-full border-r border-white/[0.08] overflow-hidden">
          {/* Header */}
          <header className="h-16 shrink-0 border-b border-white/[0.08] flex items-center justify-between px-6 bg-[#070913]/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                {currentTabInfo?.icon}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentTabInfo?.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {currentTabInfo?.description}
                  </span>
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.03] border border-white/[0.08] px-3 py-1 rounded-xl">
                <span>글자 수:</span>
                <span className="font-mono font-bold text-amber-300">{getFieldValue(activeTab).length.toLocaleString()}자</span>
              </div>

              {/* Cloud Sync Status */}
              <div className="flex items-center gap-2 text-xs font-semibold pl-2 border-l border-white/[0.08]">
                {saveStatus === 'saving' ? (
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> 동기화...
                  </span>
                ) : saveStatus === 'saved' ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5" /> 저장됨
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 opacity-50" /> 동기화 완료
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Action Toolbar */}
          <div className="border-b border-white/[0.08] bg-white/[0.015] px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-10">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunAudit}
                className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 h-8 text-xs font-bold rounded-xl"
                title="설정집 전체의 모순과 파워 밸런스를 종합 진단합니다."
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-violet-400" />
                AI 설정 정합성 진단
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOrganizeDraft} 
                disabled={isOrganizing}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 h-8 text-xs font-bold rounded-xl"
                title="거칠게 작성된 현재 설정을 출판 규격 양식으로 매끄럽게 정리합니다."
              >
                {isOrganizing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />}
                AI 초안 정리
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleTemplate} 
                className="bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border-white/[0.08] h-8 text-xs rounded-xl"
              >
                {hasTemplate() ? (
                  <><FileMinus className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> 템플릿 제거</>
                ) : (
                  <><FilePlus className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> 기본 템플릿</>
                )}
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard} 
                className="bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border-white/[0.08] h-8 text-xs rounded-xl"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> 복사
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowTips(!showTips)} 
                className={`h-8 text-xs rounded-xl border transition-all ${
                  showTips 
                    ? 'bg-amber-400/10 border-amber-400/30 text-amber-300' 
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                {showTips ? <PanelRightClose className="w-3.5 h-3.5 mr-1.5" /> : <PanelRightOpen className="w-3.5 h-3.5 mr-1.5" />}
                {showTips ? '팁 닫기' : '팁 열기'}
              </Button>
            </div>
          </div>

          {/* Editor Workspace */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/20">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -8 }} 
                transition={{ duration: 0.15 }}
                className="h-full flex flex-col max-w-4xl mx-auto w-full"
              >
                {activeTab === 'character' ? (
                  <div className="flex flex-col gap-5 h-full w-full">
                    <div className="flex-1 min-h-[320px] relative">
                      <div className="absolute top-0 left-0 bottom-0 w-10 bg-black/40 border-r border-white/[0.06] pointer-events-none rounded-l-2xl z-10 flex flex-col items-center py-4 space-y-4 text-slate-600">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <span key={i} className="text-[10px] font-mono">{i}</span>)}
                      </div>
                      <Textarea 
                        style={{ fontSize: `${editorFontSize}px` }}
                        className="w-full h-full leading-[1.8] font-sans bg-[#080b18]/90 border border-white/[0.08] focus-visible:border-amber-400/50 focus-visible:ring-1 focus-visible:ring-amber-400/20 text-slate-100 placeholder:text-slate-600 resize-none rounded-2xl py-5 pr-5 pl-14 custom-scrollbar shadow-inner"
                        placeholder={"• [주인공] (이름, 외양, 결핍, 성격, 행동 원리, 전투 스펙, 치트 능력)\n• [주요 조력자/동료] (이름, 능력, 주인공과의 관계)\n• [실시간 관계도 시각화]\n아래와 같이 작성하면 하단에 노드 관계도가 실시간 생성됩니다:\n주인공 -> 한유라 : 신뢰하는 조력자\n장태산 -> 주인공 : 숙적"}
                        value={getFieldValue(activeTab)}
                        onChange={(e) => updateField(activeTab, e.target.value)}
                      />
                    </div>

                    <div className="h-[340px] shrink-0 flex flex-col bg-[#070913]/90 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl relative">
                      <div className="px-5 py-3 border-b border-white/[0.08] bg-white/[0.02] flex justify-between items-center relative z-10">
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-400" />
                          <span>인물 노드 관계망 (실시간 시각화)</span>
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                          A {"->"} B : 관계
                        </span>
                      </div>
                      <div className="flex-1 relative z-10 bg-black/40">
                        <CharacterGraph text={getFieldValue(activeTab)} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 h-full min-h-[500px] relative group">
                    <div className="absolute top-0 left-0 bottom-0 w-10 bg-black/40 border-r border-white/[0.06] pointer-events-none rounded-l-2xl z-10 flex flex-col items-center py-4 space-y-4 text-slate-600">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => <span key={i} className="text-[10px] font-mono">{i}</span>)}
                    </div>
                    <Textarea 
                      style={{ fontSize: `${editorFontSize}px` }}
                      className="w-full h-full min-h-[520px] leading-[1.8] font-sans bg-[#080b18]/90 border border-white/[0.08] focus-visible:border-amber-400/50 focus-visible:ring-1 focus-visible:ring-amber-400/20 text-slate-100 placeholder:text-slate-600 resize-none rounded-2xl py-5 pr-5 pl-14 custom-scrollbar shadow-inner"
                      placeholder={getPlaceholder(activeTab)}
                      value={getFieldValue(activeTab)}
                      onChange={(e) => updateField(activeTab, e.target.value)}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar for Consultant Tips (Obsidian Glass) */}
        <AnimatePresence>
          {showTips && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 z-20 xl:hidden backdrop-blur-sm" 
                onClick={() => setShowTips(false)} 
              />
              <motion.div 
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
                className="w-80 bg-[#070913]/95 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col shrink-0 absolute xl:relative right-0 top-0 bottom-0 z-30 shadow-2xl xl:shadow-none h-full max-w-[85vw]"
              >
                <div className="p-5 border-b border-white/[0.08] relative bg-white/[0.01]">
                  <button 
                    onClick={() => setShowTips(false)} 
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg xl:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>스토리 컨설턴트 팁</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    실제 웹소설 플랫폼 상위권 흥행 공식에 따른 맞춤 가이드입니다.
                  </p>
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
                  {/* Tips Card */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 shadow-sm">
                    <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                      {TAB_TIPS[activeTab]?.title || "설정 작성 팁"}
                    </h3>
                    <ul className="space-y-3">
                      {(TAB_TIPS[activeTab]?.items || [
                        "새로운 설정에 대한 자유로운 아이디어를 적어보세요.",
                        "상단 툴바의 '기본 템플릿' 버튼으로 뼈대를 잡을 수 있습니다.",
                        "여러 탭을 나누어 방대한 세계관을 체계적으로 관리하세요."
                      ]).map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Assistant Ideas Generator */}
                  <div className="bg-gradient-to-br from-amber-500/10 via-violet-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden shadow-sm">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI 실시간 아이디어 발상</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      작성된 전체 바이블 맥락을 고려해 현재 탭을 매력적으로 확장할 아이디어를 제안합니다.
                    </p>
                    <Button 
                      onClick={handleGenerateIdea}
                      disabled={isGenerating}
                      className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5 text-amber-400" />}
                      {isGenerating ? '아이디어 발상 중...' : '현재 탭 AI 아이디어 제안'}
                    </Button>
                  </div>

                  {/* AI Idea Result Display */}
                  {aiIdea && (
                    <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-4 relative">
                      <button 
                        onClick={() => setAiIdea(null)} 
                        className="absolute top-3 right-3 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI 제안 결과
                      </h4>
                      <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                        {aiIdea}
                      </div>
                      {aiIdea.includes("초안이 깔끔하게 정리되었습니다") && (
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              if (previousTextRef.current[activeTab + '_ai_backup']) {
                                updateField(activeTab, previousTextRef.current[activeTab + '_ai_backup']);
                                setAiIdea(null);
                                toast.info('이전 원본 내용으로 복구되었습니다.');
                              }
                            }} 
                            className="text-xs text-slate-300 border-white/[0.1] hover:bg-white/[0.08] w-full h-8"
                          >
                            원본 복구하기
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Genre Preset Modal */}
      <GenrePresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        bible={bible}
        setBible={setBible}
      />

      {/* AI Bible Audit Modal */}
      <BibleAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        isLoading={isAuditing}
        result={auditResult}
        onReaudit={handleRunAudit}
      />
    </div>
  );
});
