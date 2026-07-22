import fs from 'fs';
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf-8');
code = code.replace("                </motion.div>\\n              ))}\\n              </AnimatePresence>\\n            )}", "                </div>\\n              ))}\\n            )}");
fs.writeFileSync('src/components/Workspace.tsx', code);
