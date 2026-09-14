import fs from 'fs';
let code = fs.readFileSync('src/components/3d/CelestialLibrary.tsx', 'utf-8');

const regex = /function SceneController\(\{[\s\S]*?return null;\n\}/;
const replacement = `function SceneController({ isAuth, currentSection }: { isAuth: boolean, currentSection: string }) {
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
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/3d/CelestialLibrary.tsx', code);
