const fs = require('fs');
const path = 'C:/Users/Pc/Desktop/CRM1/difmo_crm_frontend/src/features/employee/components/EmployeeModal.jsx';
let content = fs.readFileSync(path, 'utf8');

// Use a more robust regex for the button visibility logic
content = content.replace(
  /\{\s*!isReadOnly\s*&&\s*\(/g,
  "{ (mode === 'edit' || mode === 'add') && ("
);

fs.writeFileSync(path, content);
console.log('Successfully patched EmployeeModal.jsx (v2)');
