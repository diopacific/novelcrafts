import fs from 'fs';
let code = fs.readFileSync('src/components/Home.tsx', 'utf-8');

// Add import for ThreeBackground
code = code.replace("import { motion } from 'motion/react';", "import { motion } from 'motion/react';\nimport { ThreeBackground } from './ThreeBackground';");

// Replace the subtle background decoration with ThreeBackground + existing blurred circles (maybe they still look good together, or we replace them)
const bgTarget = `      {/* Subtle background decoration */}
      <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>`;

const bgReplace = `      {/* 3D Background Decoration */}
      <ThreeBackground />
      {/* Subtle background decoration fallback / accent */}
      <div className="absolute top-[-150px] left-[-100px] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>`;

code = code.replace(bgTarget, bgReplace);

fs.writeFileSync('src/components/Home.tsx', code);
