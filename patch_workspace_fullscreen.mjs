import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

const targetStr = `  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#f8fafc] overflow-hidden">`;

const replaceStr = `  return (
    <div className={isFullscreen ? "fixed inset-0 z-[100] flex flex-col w-full h-full bg-[#f8fafc] overflow-hidden" : "flex-1 flex flex-col w-full h-full bg-[#f8fafc] overflow-hidden"}>`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/components/Workspace.tsx', code);
