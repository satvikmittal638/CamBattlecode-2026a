import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const g1 = process.argv[2];
const g2 = process.argv[3];

const dir = path.join(os.homedir(), 'Library/Application Support/cambc');
const files = fs.readdirSync(dir).filter(f => f.startsWith('session-'));
const sess = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'));

console.log(`Polling match groups ${g1} and ${g2}...`);

while (true) {
  try {
    const [r1, r2] = await Promise.all([
      fetch(`https://2026a.battlecode.co.uk/api/v1/public/match-groups/${g1}`, { headers: { 'authorization': `Bearer ${sess.token}`, 'accept': 'application/json' } }),
      fetch(`https://2026a.battlecode.co.uk/api/v1/public/match-groups/${g2}`, { headers: { 'authorization': `Bearer ${sess.token}`, 'accept': 'application/json' } })
    ]);
    if (r1.ok && r2.ok) {
      const d1 = await r1.json();
      const d2 = await r2.json();
      const fin1 = d1.matches.filter(m => m.status === 'finished').length;
      const fin2 = d2.matches.filter(m => m.status === 'finished').length;
      console.log(`Progress: Group 1: ${fin1}/5 finished | Group 2: ${fin2}/5 finished`);
      if (fin1 === 5 && fin2 === 5) {
        console.log('All matches finished!');
        process.exit(0);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  await new Promise(r => setTimeout(r, 6000));
}
