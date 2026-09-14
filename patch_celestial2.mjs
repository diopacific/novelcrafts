import fs from 'fs';
let code = fs.readFileSync('src/components/3d/CelestialLibrary.tsx', 'utf-8');

const doorCode = `
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
`;

code = code.replace("function SceneController", doorCode + "\nfunction SceneController");

const injectComponents = `
        <GiantDoor isOpen={isAuth} />
        {currentSection === 'workspace' && <WritingDesk />}
`;
code = code.replace("<LibraryStructure />", injectComponents + "\n        <LibraryStructure />");

const sceneTarget = `    let targetZ = isAuth ? 8 : 22; 
    if (currentSection === 'workspace') targetZ = 2; 
    if (currentSection === 'bible') targetZ = 5;
    
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03;
    state.camera.lookAt(0, 0, 0);`;

const sceneReplace = `    let targetZ = isAuth ? 8 : 22; 
    let targetY = 0;
    
    if (currentSection === 'workspace') {
      targetZ = 2; 
      targetY = 2; // Look slightly down at desk
    }
    if (currentSection === 'bible') {
      targetZ = 5;
      targetY = 0;
    }
    
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.03;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.03;
    
    if (currentSection === 'workspace') {
      state.camera.lookAt(0, -2, -2);
    } else {
      state.camera.lookAt(0, 0, 0);
    }`;
code = code.replace(sceneTarget, sceneReplace);

fs.writeFileSync('src/components/3d/CelestialLibrary.tsx', code);
