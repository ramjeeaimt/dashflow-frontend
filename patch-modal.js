const fs = require('fs');
const path = 'C:/Users/Pc/Desktop/CRM1/difmo_crm_frontend/src/features/employee/components/EmployeeModal.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix role selection buttons
content = content.replace(
  /key=\{role\.id\}\s+onClick=\{\(\) => \{/g,
  'key={role.id} type="button" onClick={(e) => { e.preventDefault();'
);

// 2. Fix permission buttons
content = content.replace(
  /key=\{perm\.id\}\s+disabled=\{isInherited \|\| isReadOnly\}\s+onClick=\{\(\) => \{/g,
  'key={perm.id} type="button" disabled={isInherited || isReadOnly} onClick={(e) => { e.preventDefault();'
);

// 3. Improve Save button visibility
content = content.replace(
  /<button\s+onClick=\{handleSave\}/g,
  '<button type="button" onClick={handleSave}'
);

content = content.replace(
  /className={`px-8 py-2\.5 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center space-x-2 \$\{/g,
  'className={`px-8 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center space-x-2 min-w-[140px] justify-center ${'
);

fs.writeFileSync(path, content);
console.log('Successfully patched EmployeeModal.jsx');
