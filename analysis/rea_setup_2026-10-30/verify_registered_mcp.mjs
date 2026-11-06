import fs from 'node:fs';
import {runProductionMcpDoctor} from '/Users/dmitt/.local/share/rea/npm-cache/_npx/da7caeae9db9c589/node_modules/rea-agents/dist/cli-runtime/mcpDoctor.js';
const registration=JSON.parse(fs.readFileSync(new URL('./codex-registration.json',import.meta.url))),t=registration.transport;
if(!registration.enabled||t.type!=='stdio')throw Error('REA stdio registration is not enabled');
const result=await runProductionMcpDoctor({command:t.command,args:t.args,cwd:t.cwd??process.cwd(),environment:{...process.env,...t.env},deadlineMs:45000});
fs.writeFileSync(new URL('./registered-mcp-verification.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify({healthy:result.healthy,checks:result.checks,inventory:result.inventory}));
if(!result.healthy)process.exitCode=1;
