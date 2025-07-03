const fs = require('fs');
const path = require('path');

const prodEnvPath = path.resolve(__dirname, 'src/environments/environment.ts');
let fileContent = fs.readFileSync(prodEnvPath, 'utf8');

fileContent = fileContent
  .replace('SUPABASE_URL_PLACEHOLDER', process.env.SUPABASE_URL)
  .replace('SUPABASE_ANON_KEY_PLACEHOLDER', process.env.SUPABASE_ANON_KEY);

fs.writeFileSync(prodEnvPath, fileContent);

console.log('Ambiente de produção atualizado com variáveis do Vercel.');
