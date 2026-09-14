import fs from 'fs';

// 1. Rewrite CelestialLibrary.tsx
const celestialCode = `
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';

function OpenBook({ position, rotation, scale = 1 }: any) {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} position={position} rotation={rotation}>
      <group scale={scale}>
        {/* Pages */}
        <mesh position={[-0.45, 0.05, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.9, 0.02, 1.2]} />
          <meshStandardMaterial color="#fffbeb" roughness={0.7} emissive="#fef08a" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.45, 0.05, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.9, 0.02, 1.2]} />
          <meshStandardMaterial color="#fffbeb" roughness={0.7} emissive="#fef08a" emissiveIntensity={0.3} />
        </mesh>
        {/* Covers */}
        <mesh position={[-0.46, 0.02, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.92, 0.04, 1.25]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.9} />
        </mesh>
        <mesh position={[0.46, 0.02, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.92, 0.04, 1.25]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.9} />
        </mesh>
        <pointLight position={[0, 0.5, 0]} intensity={1.5} distance={15} color="#fef08a" />
      </group>
    </Float>
  );
}

function Astrolabe({ position, rotation, scale = 1 }: any) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.z -= 0.005;
      ref.current.children[0].rotation.z += 0.01;
    }
  });
  return (
    <group position={position} rotation={rotation} scale={scale} ref={ref}>
      <mesh>
        <ringGeometry args={[3, 3.1, 64]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
         <ringGeometry args={[2, 2.05, 64]} />
         <meshBasicMaterial color="#fef08a" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI/4]}>
         <planeGeometry args={[0.05, 6]} />
         <meshBasicMaterial color="#fef08a" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI/4]}>
         <planeGeometry args={[0.05, 6]} />
         <meshBasicMaterial color="#fef08a" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function LibraryStructure() {
  return (
    <group position={[0, -5, -20]}>
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[40, 40, 60, 32, 1, true, -Math.PI/2, Math.PI]} />
        <meshStandardMaterial color="#0a0503" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
         <mesh key={i} position={[0, -25 + i * 5, 0]} rotation={[0, 0, 0]}>
           <cylinderGeometry args={[39.8, 39.8, 0.4, 32, 1, true, -Math.PI/2, Math.PI]} />
           <meshStandardMaterial color="#1a0b05" roughness={0.8} emissive="#fb923c" emissiveIntensity={0.1} side={THREE.DoubleSide} />
         </mesh>
      ))}
    </group>
  )
}

function FloatingPages() {
  return (
    <group position={[0, -10, -5]}>
      {Array.from({ length: 40 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={1} floatIntensity={1} position={[
          (Math.random() - 0.5) * 60,
          Math.random() * 8,
          (Math.random() - 0.5) * 30 - 10
        ]}>
          <mesh rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5]}>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.5} side={THREE.DoubleSide} emissive="#7dd3fc" emissiveIntensity={0.3} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function SceneController({ isAuth, currentSection }: { isAuth: boolean, currentSection: string }) {
  useFrame((state) => {
    const targetX = (state.pointer.x * 2);
    const targetY = (state.pointer.y * 2);
    state.camera.position.x += (targetX - state.camera.position.x) * 0.02;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.02;
    
    let targetZ = isAuth ? 8 : 22; 
    if (currentSection === 'workspace') targetZ = 2; 
    if (currentSection === 'bible') targetZ = 5;
    
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export function CelestialLibrary({ isAuth, currentSection }: { isAuth: boolean, currentSection: string }) {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#020010]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 22]} fov={50} />
        <color attach="background" args={['#020010']} />
        <fog attach="fog" args={['#020010', 15, 60]} />
        
        <ambientLight intensity={0.1} color="#4c1d95" />
        <directionalLight position={[0, 20, 10]} intensity={0.5} color="#1e1b4b" />
        
        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0.5} fade speed={0.5} />
        <Sparkles count={400} scale={40} size={2} speed={0.2} opacity={0.3} color="#fef08a" />
        
        <LibraryStructure />
        
        <Astrolabe position={[-15, 8, -15]} rotation={[0, Math.PI/4, 0]} scale={1.5} />
        <Astrolabe position={[15, 2, -18]} rotation={[0, -Math.PI/4, 0]} scale={2} />
        <Astrolabe position={[0, 12, -25]} rotation={[0, 0, 0]} scale={3} />
        
        <OpenBook position={[-9, -2, -10]} rotation={[0.2, 0.5, 0]} scale={2} />
        <OpenBook position={[9, -4, -12]} rotation={[0.1, -0.6, 0]} scale={2.5} />
        <OpenBook position={[0, -6, -8]} rotation={[-0.2, 0, 0]} scale={3} />
        
        <FloatingPages />
        
        <SceneController isAuth={isAuth} currentSection={currentSection} />
      </Canvas>
    </div>
  );
}
`;
fs.writeFileSync('src/components/3d/CelestialLibrary.tsx', celestialCode);

// 2. Rewrite Home.tsx
const homeCode = `import React, { useMemo, memo } from 'react';
import { Book, PenTool, Plus, Settings, Archive, TrendingUp, ChevronRight, PlayCircle, Sparkles, BookOpen, Clock, FileText, CheckCircle2, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { Episode, BibleState } from '../types';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export const Home = memo(function Home({ episodes, bible, onNavigate }: { episodes: Episode[], bible: BibleState, onNavigate: (section: 'bible' | 'workspace' | 'tools') => void }) {
  const totalCharacters = episodes.reduce((acc, ep) => acc + ep.content.length, 0);
  const TARGET_CHARS_VOLUME = 150000;
  const currentTarget = Math.ceil(Math.max(totalCharacters, 1) / TARGET_CHARS_VOLUME) * TARGET_CHARS_VOLUME;
  const progressPercent = Math.min(Math.round((totalCharacters / currentTarget) * 100), 100);

  const recentEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => b.number - a.number).slice(0, 4);
  }, [episodes]);

  const bibleCompletion = useMemo(() => {
    const fields = ['logline', 'story', 'world', 'system', 'character', 'villain', 'timeline', 'structure', 'episode'];
    let filled = 0;
    fields.forEach(field => {
      if (bible[field as keyof BibleState] && (bible[field as keyof BibleState] as string).trim().length > 10) {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
  }, [bible]);

  const [todayTip, setTodayTip] = React.useState("웹소설은 가독성이 생명입니다. 한 문단은 2~3문장을 넘지 않게 하세요.");
  const TIPS = [
    "웹소설은 가독성이 생명입니다. 한 문단은 2~3문장을 넘지 않게 하세요.",
    "주인공의 목적과 결핍이 명확할수록 독자는 쉽게 몰입합니다.",
    "클리프행어(절단신공)는 위기뿐만 아니라 보상 직전에도 효과적입니다.",
    "조연은 주인공의 매력을 돋보이게 하는 거울 역할을 해야 합니다."
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 lg:p-16 bg-transparent text-slate-100 relative overflow-y-auto custom-scrollbar w-full h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1200px] w-full z-10 space-y-12">
        <motion.div variants={itemVariants} className="text-left space-y-5 pt-8 mb-12">
           <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0a0f25]/80 text-amber-300 text-sm font-bold border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] backdrop-blur-md">
             <Archive className="w-4 h-4 text-amber-400" />
             천공의 도서관 스튜디오
           </div>
           <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
             당신의 세계를 완성하는 곳,<br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">소설공장</span>
           </h1>
           <p className="text-[17px] text-indigo-200/90 font-medium max-w-2xl leading-relaxed">
             우주의 지혜가 담긴 서고에서 영감을 얻으세요. 세계관 구축부터 회차별 분량 조절, 통합 백업까지 완벽한 3D 몰입형 집필 환경을 제공합니다.
           </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Progress */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-[#0a0f25]/60 backdrop-blur-xl rounded-[32px] border border-indigo-500/20 p-10 shadow-[0_0_30px_rgba(30,27,75,0.4)] relative overflow-hidden group hover:border-indigo-400/40 transition-colors">
            <div className="absolute right-[-40px] top-[-40px] opacity-[0.05] pointer-events-none transition-transform duration-1000 group-hover:scale-110">
              <TrendingUp className="w-96 h-96 text-amber-100" />
            </div>
            <div className="flex flex-col h-full relative z-10">
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-900/40 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-sm">
                    <Sparkles className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl tracking-tight">현재 집필 진척도</h3>
                    <p className="text-[15px] font-medium text-indigo-200/70 mt-1">누적된 별들의 지식 분량</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 mb-1">
                    {totalCharacters.toLocaleString()}자
                  </div>
                  <div className="text-[13px] font-bold text-indigo-300/80">
                    목표 {currentTarget.toLocaleString()}자
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-[13px] font-bold text-indigo-200/80 mb-3">
                  <span>달성률 {progressPercent}%</span>
                  <span>남은 글자 수 {(currentTarget - totalCharacters).toLocaleString()}자</span>
                </div>
                <div className="w-full h-3.5 bg-indigo-950/50 rounded-full overflow-hidden border border-indigo-900/50 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-1000 relative shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                    style={{ width: \`\${progressPercent}%\` }}
                  >
                    <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sub items */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-8">
            <div onClick={() => onNavigate('bible')} className="flex-1 bg-gradient-to-br from-indigo-900/60 to-[#0a0f25]/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_0_20px_rgba(30,27,75,0.4)] border border-indigo-500/20 cursor-pointer group hover:border-amber-400/40 transition-all overflow-hidden relative">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                <Book className="w-40 h-40 text-amber-100" />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2.5 mb-3 text-indigo-200">
                  <BookOpen className="w-6 h-6" />
                  <span className="font-bold text-[15px]">설정 공장 완성도</span>
                </div>
                <div className="text-5xl font-black mb-5 tracking-tight text-white">{bibleCompletion}%</div>
                <p className="text-[15px] font-medium text-indigo-200/80 leading-relaxed mb-8">
                  우주의 기틀을 잡는 설정은<br/>이야기의 중력이 됩니다.
                </p>
                <div className="mt-auto inline-flex items-center text-[14px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 w-fit px-6 py-3 rounded-xl group-hover:bg-amber-500/20 transition-all">
                  설정 다듬기 <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
            
            <div className="bg-[#0a0f25]/60 backdrop-blur-xl rounded-[32px] border border-indigo-500/20 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-6 h-6 text-amber-400" />
                  <h3 className="font-bold text-white text-[16px]">마법의 작법 팁</h3>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTodayTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
                  }}
                  className="text-[12px] font-bold text-indigo-300 hover:text-amber-300 bg-indigo-900/30 hover:bg-indigo-800/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 다른 팁
                </button>
              </div>
              <p className="text-[15px] font-medium text-indigo-200/90 leading-relaxed italic border-l-4 border-indigo-500/30 pl-4 py-1">
                "{todayTip}"
              </p>
            </div>
          </motion.div>

          {/* Recent Episodes */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-[#0a0f25]/60 backdrop-blur-xl rounded-[32px] border border-indigo-500/20 p-10 shadow-[0_0_30px_rgba(30,27,75,0.4)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-900/40 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-sm">
                  <Clock className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="font-bold text-white text-xl tracking-tight">최근 기록된 회차</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { onNavigate('workspace'); setTimeout(() => window.dispatchEvent(new CustomEvent('createNewEpisode')), 100); }} className="text-[14px] font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-1.5" /> 새 서판 열기
                </button>
                <button onClick={() => onNavigate('workspace')} className="text-[14px] font-bold text-indigo-300 hover:text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-indigo-900/40 transition-colors border border-transparent hover:border-indigo-500/30">
                  전체 보기 <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
            {recentEpisodes.length > 0 ? (
              <div className="space-y-4">
                {recentEpisodes.map(ep => (
                  <div key={ep.id} onClick={() => onNavigate('workspace')} className="flex items-center justify-between p-5 rounded-2xl border border-indigo-900/40 bg-indigo-950/20 hover:bg-indigo-900/40 hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] cursor-pointer transition-all duration-200 group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-indigo-950/80 rounded-xl border border-indigo-500/20 flex items-center justify-center shadow-inner font-black text-amber-200 text-lg group-hover:border-amber-400/40 group-hover:bg-indigo-900/80 transition-colors">
                        {ep.number}
                      </div>
                      <div>
                        <div className="font-bold text-white text-[16px] mb-1.5 group-hover:text-amber-200 transition-colors">
                          {ep.summary ? ep.summary : \`\${ep.number}화\`}
                        </div>
                        <div className="flex items-center gap-4 text-[13px] font-semibold text-indigo-300/80">
                          <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 opacity-70" /> {ep.content.length.toLocaleString()}자</span>
                          {ep.status === 'completed' && <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-4 h-4" /> 탈고 완료</span>}
                          {ep.status === 'revision' && <span className="text-amber-400 flex items-center gap-1.5"><PenTool className="w-4 h-4" /> 퇴고 중</span>}
                          {ep.status === 'draft' && <span className="text-indigo-400 flex items-center gap-1.5"><Book className="w-4 h-4" /> 초안</span>}
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-indigo-800/50 transition-colors">
                      <ChevronRight className="w-5 h-5 text-indigo-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center font-medium flex flex-col items-center bg-indigo-950/30 rounded-2xl border border-indigo-900/40 border-dashed group hover:bg-indigo-900/30 hover:border-amber-500/30 transition-colors">
                <div className="w-16 h-16 bg-indigo-900/50 rounded-2xl shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                  <FileText className="w-8 h-8 text-indigo-400" />
                </div>
                <span className="text-[15px] text-indigo-300/70 mb-6">서가에 보관된 회차가 없습니다.<br/>첫 번째 우주를 창조해보세요.</span>
                <button 
                  onClick={() => { onNavigate('workspace'); setTimeout(() => window.dispatchEvent(new CustomEvent('createNewEpisode')), 100); }} 
                  className="text-[14px] font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  기록 시작하기
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick Nav */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-8">
            <button 
              onClick={() => onNavigate('tools')} 
              className="flex items-center p-8 bg-[#0a0f25]/60 backdrop-blur-xl rounded-[32px] border border-indigo-500/20 shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:border-indigo-400/50 hover:-translate-y-1 transition-all duration-300 text-left group h-[160px]"
            >
              <div className="w-16 h-16 shrink-0 bg-indigo-900/40 text-indigo-300 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 group-hover:text-amber-400 group-hover:border-amber-400/30 border border-indigo-500/30 transition-all duration-300">
                <Settings className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">마법 도구실</h3>
                <p className="text-[14px] text-indigo-200/70 font-medium leading-relaxed">로컬 백업 및 서판 내보내기</p>
              </div>
            </button>
            
            <button 
              onClick={() => onNavigate('workspace')} 
              className="flex items-center p-8 bg-[#0a0f25]/60 backdrop-blur-xl rounded-[32px] border border-indigo-500/20 shadow-sm hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:border-emerald-400/50 hover:-translate-y-1 transition-all duration-300 text-left group h-[160px]"
            >
              <div className="w-16 h-16 shrink-0 bg-indigo-900/40 text-emerald-400 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 border border-indigo-500/30 group-hover:border-emerald-400/30 transition-all duration-300">
                <PenTool className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">회차 보관함</h3>
                <p className="text-[14px] text-indigo-200/70 font-medium leading-relaxed">AI 마법사의 도움으로 원고 작성</p>
              </div>
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
});
`
fs.writeFileSync('src/components/Home.tsx', homeCode);

// 3. Patch App.tsx Navbar conditionally
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

appCode = appCode.replace(
  /<nav className="h-14 bg-white\/60 backdrop-blur-md border-b border-slate-200\/50 flex items-center px-4 md:px-6 justify-between z-50 shrink-0 shadow-sm">/,
  "<nav className={`h-14 backdrop-blur-md border-b flex items-center px-4 md:px-6 justify-between z-50 shrink-0 shadow-sm transition-colors duration-500 ${currentSection === 'home' ? 'bg-[#030014]/40 border-indigo-900/50' : 'bg-white/60 border-slate-200/50'}`}>"
);

// App.tsx brand label
appCode = appCode.replace(
  /className="flex items-center text-slate-800 font-black/g,
  "className={`flex items-center font-black transition-colors ${currentSection === 'home' ? 'text-amber-400 hover:text-amber-300' : 'text-slate-800 hover:text-indigo-600'}"
);
appCode = appCode.replace(
  /<BookOpen className="w-5 h-5 mr-1.5 md:mr-2 text-indigo-600" \/>/g,
  "<BookOpen className={`w-5 h-5 mr-1.5 md:mr-2 transition-colors ${currentSection === 'home' ? 'text-amber-400' : 'text-indigo-600'}`} />"
);

// App.tsx user email
appCode = appCode.replace(
  /className="text-slate-600 font-semibold text-\[13px\] hidden md:inline-block tracking-wide"/g,
  "className={`font-semibold text-[13px] hidden md:inline-block tracking-wide ${currentSection === 'home' ? 'text-indigo-200' : 'text-slate-600'}`"
);

// App.tsx user profile block
appCode = appCode.replace(
  /className="flex items-center gap-2 md:gap-3 bg-slate-50 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-slate-200 shadow-sm"/g,
  "className={`flex items-center gap-2 md:gap-3 px-2 py-1 md:px-3 md:py-1.5 rounded-full border shadow-sm ${currentSection === 'home' ? 'bg-indigo-950/50 border-indigo-800/50' : 'bg-slate-50 border-slate-200'}`"
);

// App.tsx logout button
appCode = appCode.replace(
  /className="flex items-center text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-1 md:p-1.5 rounded-full border border-slate-200"/g,
  "className={`flex items-center transition-colors p-1 md:p-1.5 rounded-full border ${currentSection === 'home' ? 'text-indigo-400 bg-indigo-900/40 border-indigo-800/50 hover:text-red-400 hover:bg-red-900/40' : 'text-slate-400 bg-white border-slate-200 hover:text-red-500 hover:bg-red-50'}`"
);

// NavButton function rewrite
const navBtnTarget = `function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={\`h-full px-2 sm:px-4 flex items-center font-bold text-[13px] sm:text-[14px] tracking-wide transition-colors relative \${
        active ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }\`}
    >`;
const navBtnReplace = `function NavButton({ active, isDark, onClick, icon, label }: { active: boolean, isDark?: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={\`h-full px-2 sm:px-4 flex items-center font-bold text-[13px] sm:text-[14px] tracking-wide transition-colors relative \${
        active 
          ? (isDark ? 'text-amber-400 bg-indigo-900/40' : 'text-indigo-600 bg-indigo-50/50') 
          : (isDark ? 'text-indigo-200/70 hover:text-white hover:bg-indigo-900/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
      }\`}
    >`;
appCode = appCode.replace(navBtnTarget, navBtnReplace);

// NavButton calls rewrite
appCode = appCode.replace(
  /<NavButton \n               active=\{currentSection === 'bible'\}/g,
  "<NavButton \n               isDark={currentSection === 'home'} \n               active={currentSection === 'bible'}"
);
appCode = appCode.replace(
  /<NavButton \n               active=\{currentSection === 'workspace'\}/g,
  "<NavButton \n               isDark={currentSection === 'home'} \n               active={currentSection === 'workspace'}"
);
appCode = appCode.replace(
  /<NavButton \n               active=\{currentSection === 'tools'\}/g,
  "<NavButton \n               isDark={currentSection === 'home'} \n               active={currentSection === 'tools'}"
);

fs.writeFileSync('src/App.tsx', appCode);
