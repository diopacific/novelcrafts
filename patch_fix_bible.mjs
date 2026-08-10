import fs from 'fs';
let code = fs.readFileSync('src/components/BiblePanel.tsx', 'utf-8');

// Wrap Group 4
const group4Target = `          {/* 그룹 4: 커스텀 탭 */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">`;
const group4Replace = `          {/* 그룹 4: 커스텀 탭 */}
          {(filteredTabs.filter(t => 'isCustom' in t && t.isCustom).length > 0 || isAddingTab || !searchTerm) && (
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">`;
code = code.replace(group4Target, group4Replace);

fs.writeFileSync('src/components/BiblePanel.tsx', code);
