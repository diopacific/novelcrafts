import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');
console.log(code.match(/className="[^"]*bg-white[^"]*"/g));
