import fs from 'fs';
let code = fs.readFileSync('src/components/3d/CelestialLibrary.tsx', 'utf-8');

code = code.replace('<Canvas>', "<Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}>");
code = code.replace('count={7000}', 'count={2500}');
code = code.replace('count={400}', 'count={150}');
// add Preload
if (!code.includes('Preload')) {
    code = code.replace("Stars } from '@react-three/drei';", "Stars, Preload } from '@react-three/drei';");
    code = code.replace('</Canvas>', '  <Preload all />\n      </Canvas>');
}

fs.writeFileSync('src/components/3d/CelestialLibrary.tsx', code);
