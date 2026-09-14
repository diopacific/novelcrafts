
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float, PerspectiveCamera, Stars, Preload } from '@react-three/drei';
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



function ConstellationNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });
  
  const nodes = [
    [0, 2, 0], [3, 4, 2], [-2, 1, 3], [4, -1, -2], [-3, 3, -1], [1, 5, -3]
  ];
  
  return (
    <group ref={groupRef} position={[0, -2, -6]}>
      {/* Network Lines */}
      {nodes.map((pos, i) => (
        nodes.slice(i + 1).map((pos2, j) => {
          const dist = new THREE.Vector3(...pos).distanceTo(new THREE.Vector3(...pos2));
          if (dist < 6) {
            const points = [new THREE.Vector3(...pos), new THREE.Vector3(...pos2)];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            return (
              <line key={`line-${i}-${j}`}>
                <primitive object={lineGeometry} attach="geometry" />
                <lineBasicMaterial color="#7dd3fc" transparent opacity={0.2} />
              </line>
            );
          }
          return null;
        })
      ))}
      
      {/* Floating Orbs (Characters/Worlds) */}
      {nodes.map((pos, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1} position={pos as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} emissive="#0284c7" emissiveIntensity={0.5} transparent opacity={0.8} />
          </mesh>
          <pointLight color="#38bdf8" intensity={0.5} distance={3} />
        </Float>
      ))}
    </group>
  );
}

function GiantDoor({ isOpen }: { isOpen: boolean }) {
  const leftDoor = useRef<THREE.Mesh>(null);
  const rightDoor = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (leftDoor.current && rightDoor.current) {
      const targetRotation = isOpen ? Math.PI * 0.6 : 0;
      leftDoor.current.rotation.y += (targetRotation - leftDoor.current.rotation.y) * 0.05;
      rightDoor.current.rotation.y += (-targetRotation - rightDoor.current.rotation.y) * 0.05;
    }
  });

  return (
    <group position={[0, -5, 12]}>
      {/* Left Door */}
      <group position={[-2, 0, 0]}>
        <mesh ref={leftDoor} position={[2, 10, 0]}>
          <boxGeometry args={[4, 20, 0.5]} />
          <meshStandardMaterial color="#171717" roughness={0.8} metalness={0.5} />
          {/* Decorative glowing lines on door */}
          <mesh position={[0, 0, 0.26]}>
             <planeGeometry args={[3, 18]} />
             <meshStandardMaterial color="#333" emissive="#fbbf24" emissiveIntensity={0.2} transparent opacity={0.5} />
          </mesh>
        </mesh>
      </group>
      {/* Right Door */}
      <group position={[2, 0, 0]}>
        <mesh ref={rightDoor} position={[-2, 10, 0]}>
          <boxGeometry args={[4, 20, 0.5]} />
          <meshStandardMaterial color="#171717" roughness={0.8} metalness={0.5} />
          <mesh position={[0, 0, 0.26]}>
             <planeGeometry args={[3, 18]} />
             <meshStandardMaterial color="#333" emissive="#fbbf24" emissiveIntensity={0.2} transparent opacity={0.5} />
          </mesh>
        </mesh>
      </group>
      {/* Door Frame */}
      <mesh position={[0, 10, -0.5]}>
        <boxGeometry args={[9, 21, 1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function WritingDesk() {
  const quillRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (quillRef.current) {
      // Simulate writing motion
      quillRef.current.position.x = Math.sin(state.clock.elapsedTime * 5) * 0.2 + 0.5;
      quillRef.current.position.z = Math.cos(state.clock.elapsedTime * 3) * 0.1;
      quillRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.1 - 0.2;
    }
  });

  return (
    <group position={[0, -2, -2]}>
      {/* Desk Surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[12, 0.2, 6]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>
      {/* Giant Open Book (Editor background) */}
      <mesh position={[-2.5, 0.15, 0]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[4.8, 0.1, 5]} />
        <meshStandardMaterial color="#fefce8" roughness={0.8} />
      </mesh>
      <mesh position={[2.5, 0.15, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[4.8, 0.1, 5]} />
        <meshStandardMaterial color="#fefce8" roughness={0.8} />
      </mesh>
      {/* Floating Quill */}
      <group ref={quillRef} position={[2, 0.5, 1]} rotation={[0, -0.5, -0.2]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.2, 1.5, 0]} rotation={[0, 0, -0.2]}>
          <planeGeometry args={[0.5, 1.5]} />
          <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function SceneController({ isAuth, currentSection }: { isAuth: boolean, currentSection: string }) {
  useFrame((state) => {
    const mouseX = (state.pointer.x * 2);
    const mouseY = (state.pointer.y * 2);
    
    let targetZ = isAuth ? 8 : 22; 
    let baseCamY = 0;
    
    if (currentSection === 'workspace') {
      targetZ = 4; // Not too close so we can see the desk
      baseCamY = 1; // Look down at desk
    }
    if (currentSection === 'bible') {
      targetZ = 6;
      baseCamY = 0;
    }
    
    state.camera.position.x += (mouseX - state.camera.position.x) * 0.03;
    state.camera.position.y += ((mouseY + baseCamY) - state.camera.position.y) * 0.03;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03;
    
    if (currentSection === 'workspace') {
      state.camera.lookAt(0, -2, -2);
    } else {
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

export function CelestialLibrary({ isAuth, currentSection }: { isAuth: boolean, currentSection: string }) {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#020010]">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 22]} fov={50} />
        <color attach="background" args={['#020010']} />
        <fog attach="fog" args={['#020010', 15, 60]} />
        
        <ambientLight intensity={0.1} color="#4c1d95" />
        <directionalLight position={[0, 20, 10]} intensity={0.5} color="#1e1b4b" />
        
        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={0.5} />
        <Sparkles count={150} scale={40} size={2} speed={0.2} opacity={0.3} color="#fef08a" />
        
        
        <GiantDoor isOpen={isAuth} />
        {currentSection === 'workspace' && <WritingDesk />}
        {currentSection === 'bible' && <ConstellationNetwork />}

        <LibraryStructure />
        
        <Astrolabe position={[-15, 8, -15]} rotation={[0, Math.PI/4, 0]} scale={1.5} />
        <Astrolabe position={[15, 2, -18]} rotation={[0, -Math.PI/4, 0]} scale={2} />
        <Astrolabe position={[0, 12, -25]} rotation={[0, 0, 0]} scale={3} />
        
        <OpenBook position={[-9, -2, -10]} rotation={[0.2, 0.5, 0]} scale={2} />
        <OpenBook position={[9, -4, -12]} rotation={[0.1, -0.6, 0]} scale={2.5} />
        <OpenBook position={[0, -6, -8]} rotation={[-0.2, 0, 0]} scale={3} />
        
        <FloatingPages />
        
        <SceneController isAuth={isAuth} currentSection={currentSection} />
        <Preload all />
      </Canvas>
    </div>
  );
}
