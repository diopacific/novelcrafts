import fs from 'fs';
let code = fs.readFileSync('src/components/3d/CelestialLibrary.tsx', 'utf-8');

const spheresCode = `
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
              <line key={\`line-\${i}-\${j}\`}>
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
`;

code = code.replace("function GiantDoor", spheresCode + "\nfunction GiantDoor");

const injectComponents = `        {currentSection === 'bible' && <ConstellationNetwork />}`;
code = code.replace("{currentSection === 'workspace' && <WritingDesk />}", "{currentSection === 'workspace' && <WritingDesk />}\n" + injectComponents);

fs.writeFileSync('src/components/3d/CelestialLibrary.tsx', code);
