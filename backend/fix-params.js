const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'src/controllers/accountController.ts',
  'src/controllers/kycController.ts', 
  'src/controllers/payoutController.ts',
  'src/controllers/safeTransferController.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix parameter validation patterns
  content = content.replace(
    /const \{ ([^}]+) \} = req\.params;\s*const userId = req\.user\?\.id;\s*if \(!userId\) \{[\s\S]*?\}\s*if \(!([^)]+)\) \{[\s\S]*?\}\s*await/g,
    (match, params, paramName) => {
      const paramList = params.split(',').map(p => p.trim());
      const checks = paramList.map(p => `if (!${p}) { throw new AppError('Missing required parameter: ${p}', 400); }`).join('\n    ');
      return match.replace(/if \(!([^)]+)\) \{[\s\S]*?\}/g, '').replace(/const \{ ([^}]+) \} = req\.params;\s*const userId = req\.user\?\.id;\s*if \(!userId\) \{[\s\S]*?\}/, 
        `const { ${params} } = req.params;\n    const userId = req.user?.id;\n\n    if (!userId) {\n      throw new AppError('User not authenticated', 401);\n    }\n\n    ${checks}\n\n    `);
    }
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});

console.log('All parameter validation issues fixed!');

