// MCP handshake against the exact `rea` registration in ~/.claude.json: initialize, tools/list, prompts/list.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const reg = JSON.parse(fs.readFileSync(process.env.HOME + '/.claude.json', 'utf8')).mcpServers.rea;
const child = spawn(reg.command, reg.args, { env: { ...process.env, ...reg.env }, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '', id = 0; const waiting = new Map();
child.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1);
  try { const m = JSON.parse(line); if (waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } } catch {} } });
const call = (method, params = {}) => new Promise(r => { const n = ++id; waiting.set(n, r); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method, params }) + '\n'); });
const timer = setTimeout(() => { console.log('timeout'); child.kill(); process.exit(1); }, 240000);
const init = await call('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'claude-code-verify', version: '1' } });
console.log('server', JSON.stringify(init.result?.serverInfo), 'protocol', init.result?.protocolVersion);
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
let tools = [], cursor; do { const r = await call('tools/list', cursor ? { cursor } : {}); tools.push(...(r.result?.tools || [])); cursor = r.result?.nextCursor; } while (cursor);
const prompts = (await call('prompts/list')).result?.prompts || [];
console.log('tools', tools.length, 'prompts', prompts.length, 'node', (await import('node:process')).version);
console.log('sample tools', tools.slice(0, 5).map(t => t.name).join(', '));
clearTimeout(timer); child.kill(); process.exit(0);
