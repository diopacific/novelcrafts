import fs from 'fs';
let code = fs.readFileSync('src/components/ui/button.tsx', 'utf-8');
code = code.replace(
    "variant?: 'primary' | 'secondary' | 'outline' | 'ghost';",
    "variant?: 'primary' | 'secondary' | 'outline' | 'ghost';\n  size?: 'default' | 'sm' | 'lg' | 'icon';"
);
code = code.replace(
    "({ className = '', variant = 'primary', ...props }, ref) => {",
    "({ className = '', variant = 'primary', size = 'default', ...props }, ref) => {"
);
fs.writeFileSync('src/components/ui/button.tsx', code);
