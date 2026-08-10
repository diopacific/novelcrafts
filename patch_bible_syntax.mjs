import fs from 'fs';
let code = fs.readFileSync('src/components/BiblePanel.tsx', 'utf-8');

// There is a missing `)}` for Group 3.
// Let's find where Group 3 ends and Group 4 begins.
const target = `            ))}
          </div>

          {/* 그룹 4: 커스텀 탭 */}`;
const replace = `            ))}
          </div>
          )}

          {/* 그룹 4: 커스텀 탭 */}`;

code = code.replace(target, replace);
fs.writeFileSync('src/components/BiblePanel.tsx', code);
