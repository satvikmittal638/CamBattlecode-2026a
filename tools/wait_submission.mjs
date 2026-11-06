import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const dir = path.join(os.homedir(), 'Library/Application Support/cambc');
const files = fs.readdirSync(dir).filter(f => f.startsWith('session-'));
const sess = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'));

const targetVer = Number(process.argv[2] || 167);
console.log(`Waiting for submission v${targetVer} to finish building...`);

while (true) {
  try {
    const res = await fetch('https://2026a.battlecode.co.uk/api/v1/public/submissions', {
      headers: {
        'authorization': `Bearer ${sess.token}`,
        'accept': 'application/json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const sub = data.submissions.find(s => s.version === targetVer);
      if (sub) {
        console.log(`v${sub.version} status: ${sub.status} (active: ${sub.active})`);
        if (sub.status !== 'queued' && sub.status !== 'building' && sub.status !== 'pending' && sub.status !== 'compiling') {
          console.log(`Finished: v${sub.version} is ${sub.status}!`);
          process.exit(0);
        }
      }
    }
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
  await new Promise(r => setTimeout(r, 5000));
}
