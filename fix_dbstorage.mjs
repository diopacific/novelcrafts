import fs from 'fs';
let code = fs.readFileSync('src/hooks/useDbStorage.ts', 'utf-8');
code = code.replace(
    "episode: ''\n  });",
    "episode: '',\n    item: '',\n    timeline: '',\n    customTabs: []\n  });"
);
fs.writeFileSync('src/hooks/useDbStorage.ts', code);
