import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, Color } from 'three';
import { Torus } from '@react-three/drei';

function AnimatedRing({ progress, isWork }: { progress: number, isWork: boolean }) {
  const meshRef = useRef<Mesh>(null);
  
  const targetColor = new Color(isWork ? "#4f46e5" : "#10b981");

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = -progress * Math.PI * 2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Update color smoothly
      // meshRef.current.material.color.lerp(targetColor, 0.1);
    }
  });

  // Calculate circumference based on radius (args=[radius, tube])
  // We use 1.8 for radius, tube 0.1
  // arc length logic: we could actually just use the 'arc' parameter in Torus args!
  // args = [radius, tube, radialSegments, tubularSegments, arc]

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Background ring */}
      <Torus args={[2, 0.08, 16, 100, Math.PI * 2]}>
        <meshStandardMaterial color="#1e2438" />
      </Torus>
      
      {/* Progress ring */}
      <Torus args={[2, 0.12, 16, 100, progress * Math.PI * 2]}>
        <meshStandardMaterial 
          color={isWork ? "#f59e0b" : "#10b981"} 
          roughness={0.2}
          metalness={0.8}
        />
      </Torus>
    </group>
  );
}

export function ThreePomodoroRing({ progress, isWork }: { progress: number, isWork: boolean }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <AnimatedRing progress={Math.max(0.001, progress)} isWork={isWork} />
      </Canvas>
    </div>
  );
}
