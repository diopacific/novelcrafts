import fs from 'fs';

// 1. Create CelestialLibrary.tsx
fs.mkdirSync('src/components/3d', { recursive: true });
const celestialCode = `
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function FloatingBooks() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });
  return (
    <group ref={group}>
      {Array.from({ length: 25 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={1.5} floatIntensity={2} position={[
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * -20 - 5
        ]}>
          <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
            <boxGeometry args={[0.8, 1.2, 0.2]} />
            <meshStandardMaterial 
              color={new THREE.Color().setHSL(0.1 + Math.random() * 0.1, 0.4, 0.8)} 
              roughness={0.3} 
              metalness={0.2} 
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function MagicCircle() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, -5, -10]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[8, 8.2, 64]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SceneController({ isAuth, currentSection }: { isAuth: boolean, currentSection: string }) {
  useFrame((state) => {
    // Subtle parallax based on mouse
    const targetX = (state.pointer.x * 2);
    const targetY = (state.pointer.y * 2);
    
    state.camera.position.x += (targetX - state.camera.position.x) * 0.02;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.02;
    
    // Adjust base Z based on auth & section (Entrance vs Main Hall vs Rooms)
    let targetZ = isAuth ? 8 : 18;
    if (currentSection === 'workspace') targetZ = 4; // Zoom in for writing room (desk focus)
    if (currentSection === 'bible') targetZ = 6;     // Worldview/Character room
    
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export function CelestialLibrary({ isAuth, currentSection }: { isAuth: boolean, currentSection: string }) {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-50/50">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={45} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} color="#fef08a" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c7d2fe" />
        
        {/* Dust Particles */}
        <Sparkles count={600} scale={25} size={2} speed={0.3} opacity={0.5} color="#fbbf24" />
        <Sparkles count={300} scale={25} size={1} speed={0.5} opacity={0.3} color="#ffffff" />
        
        <FloatingBooks />
        <MagicCircle />
        
        <fog attach="fog" args={['#f8fafc', 8, 30]} />
        <SceneController isAuth={isAuth} currentSection={currentSection} />
      </Canvas>
    </div>
  );
}
`;
fs.writeFileSync('src/components/3d/CelestialLibrary.tsx', celestialCode);

// 2. Patch App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');
if (!app.includes("import { CelestialLibrary }")) {
  app = app.replace(
    "import { ToastContainer } from './components/ui/ToastContainer';", 
    "import { CelestialLibrary } from './components/3d/CelestialLibrary';\nimport { ToastContainer } from './components/ui/ToastContainer';"
  );
  app = app.replace(
    '<div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans font-medium overflow-hidden antialiased">',
    '<div className="flex flex-col h-screen w-full bg-transparent text-slate-900 font-sans font-medium overflow-hidden antialiased relative">\n      <CelestialLibrary isAuth={!!user} currentSection={currentSection} />'
  );
  app = app.replace('nav className="h-14 bg-white', 'nav className="h-14 bg-white/60 backdrop-blur-md');
  fs.writeFileSync('src/App.tsx', app);
}

// 3. Patch Home.tsx
let home = fs.readFileSync('src/components/Home.tsx', 'utf-8');
home = home.replace("import { ThreeBackground } from './ThreeBackground';\n", "");
home = home.replace("      <ThreeBackground />\n", "");
home = home.replace(/bg-\[#f8fafc\]/g, 'bg-transparent');
home = home.replace(/bg-white/g, 'bg-white/60 backdrop-blur-xl');
home = home.replace(/<div className="absolute top-\[-150px\] left-\[-100px\][^>]+><\/div>/g, '');
home = home.replace(/<div className="absolute bottom-\[-150px\] right-\[-100px\][^>]+><\/div>/g, '');
fs.writeFileSync('src/components/Home.tsx', home);

// 4. Patch Workspace & BiblePanel & Tools to be translucent
function makeTranslucent(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  code = code.replace(/bg-\[#f8fafc\]/g, 'bg-transparent');
  code = code.replace(/bg-white(?!(\/| text| border))/g, 'bg-white/70 backdrop-blur-md');
  code = code.replace(/bg-slate-50\b/g, 'bg-slate-50/50 backdrop-blur-sm');
  fs.writeFileSync(filePath, code);
}
makeTranslucent('src/components/Workspace.tsx');
makeTranslucent('src/components/BiblePanel.tsx');
makeTranslucent('src/components/ToolsPanel.tsx');

