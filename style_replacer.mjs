import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');

// Header & Panels
code = code.replace(/bg-white border-b border-slate-200/g, 'bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-700/50');
code = code.replace(/bg-white\/70 backdrop-blur-md/g, 'bg-[#0f172a]/70 backdrop-blur-md border border-slate-700/50');
code = code.replace(/bg-slate-50\/50 backdrop-blur-sm/g, 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50');
code = code.replace(/bg-white border-r border-slate-200/g, 'bg-[#0f172a]/60 backdrop-blur-xl border-r border-slate-700/50');
code = code.replace(/border-slate-100/g, 'border-slate-700/50');
code = code.replace(/border-slate-200/g, 'border-slate-700/50');
code = code.replace(/bg-slate-50/g, 'bg-slate-800');

// Texts
code = code.replace(/text-slate-800/g, 'text-slate-100');
code = code.replace(/text-slate-700/g, 'text-slate-200');
code = code.replace(/text-slate-600/g, 'text-slate-300');
code = code.replace(/text-slate-500/g, 'text-slate-400');
code = code.replace(/text-slate-400/g, 'text-slate-400');

// Buttons / Hovers
code = code.replace(/hover:bg-slate-100/g, 'hover:bg-slate-700');
code = code.replace(/hover:text-indigo-600/g, 'hover:text-indigo-400');
code = code.replace(/bg-white text-slate-500/g, 'bg-slate-800/60 text-slate-400');

// Selected / Active states
code = code.replace(/bg-indigo-50 text-indigo-700 border-indigo-200/g, 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50');
code = code.replace(/bg-emerald-50 text-emerald-700 border-emerald-200/g, 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50');
code = code.replace(/bg-slate-900 text-white/g, 'bg-slate-700 text-slate-100');
code = code.replace(/text-indigo-600/g, 'text-indigo-400');
code = code.replace(/text-emerald-600/g, 'text-emerald-400');

// Inputs & Textareas
code = code.replace(/bg-transparent text-slate-800/g, 'bg-transparent text-slate-100');
code = code.replace(/placeholder:text-slate-400/g, 'placeholder:text-slate-500');
code = code.replace(/focus:ring-indigo-500\/20 focus:border-indigo-400/g, 'focus:ring-indigo-500/40 focus:border-indigo-500');

// Main Container Background
code = code.replace(/bg-white/g, 'bg-[#0f172a]/60 backdrop-blur-xl');
code = code.replace(/bg-slate-100/g, 'bg-slate-800');

fs.writeFileSync('src/components/Workspace.tsx', code);
