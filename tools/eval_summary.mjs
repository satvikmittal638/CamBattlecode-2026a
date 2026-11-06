import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from './replay_dump.mjs';

const dirs = process.argv.slice(2);
for (const dir of dirs) {
  console.log(`\n========================================`);
  console.log(`EVALUATION: ${dir}`);
  console.log(`========================================`);
  const entries = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory()).sort();
  for (const entry of entries) {
    const replayPath = path.join(dir, entry, 'replay.repl26a');
    if (!fs.existsSync(replayPath)) continue;
    try {
      const dump = await dumpReplay(replayPath, { snapshots: 'none' });
      const meta = dump.meta;
      const isUsTeamA = fs.existsSync(path.join(dir, entry, 'team-a.stdout'));
      const ourSide = isUsTeamA ? 'A' : 'B';
      const oppSide = isUsTeamA ? 'B' : 'A';
      const ourGems = isUsTeamA ? meta.submittedGems[0] : meta.submittedGems[1];
      const oppGems = isUsTeamA ? meta.submittedGems[1] : meta.submittedGems[0];
      const ourDraft = isUsTeamA ? meta.draft[0] : meta.draft[1];
      const oppDraft = isUsTeamA ? meta.draft[1] : meta.draft[0];
      const win = (meta.outcome === 'teamA' && isUsTeamA) || (meta.outcome === 'teamB' && !isUsTeamA);
      
      // Also inspect final item emblems for our team
      const ourChamps = meta.finalChampions.filter(c => c.team === (isUsTeamA ? 0 : 1));
      const oppChamps = meta.finalChampions.filter(c => c.team === (isUsTeamA ? 1 : 0));
      
      const ourEmblems = ourChamps.map(c => `${c.type}:${Object.keys(c.items).filter(k => k.includes('Emblem')).map(k => k.replace(' Emblem of Strength', '(S)').replace(' Emblem of Focus', '(F)').replace(' Emblem of Health', '(H)')).join(',')}`).join(' | ');

      console.log(`Match ${entry}: [${win ? 'WIN' : 'LOSS'}] Rounds: ${meta.finalRound} | Us (${ourSide}): ${ourGems} gems | Opp (${oppSide}): ${oppGems} gems (Diff: ${ourGems - oppGems >= 0 ? '+' : ''}${ourGems - oppGems})`);
      console.log(`  Draft: Us [${ourDraft.join(', ')}] vs Opp [${oppDraft.join(', ')}]`);
      console.log(`  Items: ${ourEmblems}`);
    } catch (e) {
      console.error(`Error dumping ${replayPath}:`, e.message);
    }
  }
}
