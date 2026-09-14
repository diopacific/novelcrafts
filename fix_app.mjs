import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
    "const [currentSection, setCurrentSection] = useState<'home' | 'bible' | 'workspace' | 'tools'>('home');",
    "const [currentSection, setCurrentSection] = useState<'home' | 'bible' | 'workspace' | 'tools'>('home');\n  const [show3D, setShow3D] = useState(() => localStorage.getItem('hide3D') !== 'true');\n  const toggle3D = () => { const next = !show3D; setShow3D(next); localStorage.setItem('hide3D', (!next).toString()); };"
);

fs.writeFileSync('src/App.tsx', code);
