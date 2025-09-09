const fs = require('fs');

// Fix all parameter validation issues
const files = [
  'src/controllers/kycController.ts',
  'src/controllers/payoutController.ts', 
  'src/controllers/safeTransferController.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add parameter validation for common patterns
  content = content.replace(
    /const \{ ([^}]+) \} = req\.params;\s*const userId = req\.user\?\.id;\s*if \(!userId\) \{[\s\S]*?\}\s*if \(!([^)]+)\) \{[\s\S]*?\}\s*await/g,
    (match, params, paramName) => {
      return match; // Already has validation
    }
  );
  
  // Add missing parameter validation
  content = content.replace(
    /const \{ ([^}]+) \} = req\.params;\s*const userId = req\.user\?\.id;\s*if \(!userId\) \{[\s\S]*?\}\s*await/g,
    (match, params) => {
      const paramList = params.split(',').map(p => p.trim());
      const checks = paramList.map(p => `if (!${p}) { throw new AppError('Missing required parameter: ${p}', 400); }`).join('\n    ');
      return match.replace(/const \{ ([^}]+) \} = req\.params;\s*const userId = req\.user\?\.id;\s*if \(!userId\) \{[\s\S]*?\}/, 
        `const { ${params} } = req.params;\n    const userId = req.user?.id;\n\n    if (!userId) {\n      throw new AppError('User not authenticated', 401);\n    }\n\n    ${checks}\n\n    `);
    }
  );
  
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});

console.log('Quick fix applied!');

