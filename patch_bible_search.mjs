import fs from 'fs';
let code = fs.readFileSync('src/components/BiblePanel.tsx', 'utf-8');

// Replace the groups to only show if there are items, and add a global empty state
const groupsTarget = `        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          {/* 그룹 1: 기본 설정 */}`;

const groupsReplace = `        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          {filteredTabs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Search className="w-8 h-8 mb-3 text-slate-300" />
              <p className="text-[13px] font-medium">검색 결과가 없습니다.</p>
            </div>
          )}
          {/* 그룹 1: 기본 설정 */}`;

code = code.replace(groupsTarget, groupsReplace);

// Wrap Group 1
const group1Target = `          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400">기본 기획</div>`;
const group1Replace = `          {filteredTabs.filter(t => ['logline', 'story', 'structure'].includes(t.id)).length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400">기본 기획</div>`;
code = code.replace(group1Target, group1Replace);

const group1EndTarget = `          </div>

          {/* 그룹 2: 상세 설정 */}`;
const group1EndReplace = `          </div>
          )}

          {/* 그룹 2: 상세 설정 */}`;
code = code.replace(group1EndTarget, group1EndReplace);


// Wrap Group 2
const group2Target = `          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-100">세계관 및 캐릭터</div>`;
const group2Replace = `          {filteredTabs.filter(t => ['world', 'system', 'item', 'character', 'villain'].includes(t.id)).length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-100">세계관 및 캐릭터</div>`;
code = code.replace(group2Target, group2Replace);

const group2EndTarget = `          </div>

          {/* 그룹 3: 에피소드 진행 */}`;
const group2EndReplace = `          </div>
          )}

          {/* 그룹 3: 에피소드 진행 */}`;
code = code.replace(group2EndTarget, group2EndReplace);


// Wrap Group 3
const group3Target = `          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-100">전개 및 타임라인</div>`;
const group3Replace = `          {filteredTabs.filter(t => ['timeline', 'episode'].includes(t.id)).length > 0 && (
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-100">전개 및 타임라인</div>`;
code = code.replace(group3Target, group3Replace);

const group3EndTarget = `          </div>

          {/* 그룹 4: 커스텀 추가 탭 */}`;
const group3EndReplace = `          </div>
          )}

          {/* 그룹 4: 커스텀 추가 탭 */}`;
code = code.replace(group3EndTarget, group3EndReplace);

// Wrap Group 4
const group4Target = `          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-100">커스텀 탭</div>`;
const group4Replace = `          {(filteredTabs.filter(t => 'isCustom' in t && t.isCustom).length > 0 || isAddingTab || !searchTerm) && (
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 pt-2 border-t border-slate-100">커스텀 탭</div>`;
code = code.replace(group4Target, group4Replace);

const group4EndTarget = `            )}
          </div>
        </div>`;
const group4EndReplace = `            )}
          </div>
          )}
        </div>`;
code = code.replace(group4EndTarget, group4EndReplace);

fs.writeFileSync('src/components/BiblePanel.tsx', code);
