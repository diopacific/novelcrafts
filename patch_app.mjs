import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("import { ToastContainer } from './components/ui/ToastContainer';", "import { ToastContainer } from './components/ui/ToastContainer';\nimport { toast } from './lib/toast';");
code = code.replace(/alert\(\`인증 시스템 연결에 실패했습니다\.\\n사파리나 모바일 브라우저의 경우 '크로스 사이트 추적 방지\(서드파티 쿠키 차단\)' 설정이 원인일 수 있습니다\.\\n\\n오류: \$\{e.message\}\`\);/g, "toast.error(`인증 실패: ${e.message}`);");
fs.writeFileSync('src/App.tsx', code);
