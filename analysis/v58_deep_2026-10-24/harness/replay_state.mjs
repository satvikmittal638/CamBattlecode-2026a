// Open a replay in the engine and stop at the start of one champion's turn (the state the bot saw).
//   const s = await openAtTurn(file, { round, team, type })   // type: champion type name (Ryth, HeartOfRuin, ...) or id
// Returns { eng, game, st, champion, meta } where st is the decoded timeline state at that step.
import { Engine, readReplayBytes, replayEngineVersion, decodeTimeline, CHAMPION_TYPES } from '../../../tools/replay_dump.mjs';

const TIMELINE_SNAPSHOT_SIZE = 40152;

export async function openReplay(file) {
  const bytes = readReplayBytes(file);
  const eng = await Engine.create(replayEngineVersion(bytes));
  const p = eng.exp.Engine_Malloc(bytes.length);
  new Uint8Array(eng.exp.memory.buffer, p, bytes.length).set(bytes);
  eng.check(eng.exp.Game_FromReplayFileBytes(p, bytes.length, eng.outBuf));
  const game = eng.outHandle;
  eng.exp.Engine_Free(p);
  const snap = eng.exp.Engine_Malloc(TIMELINE_SNAPSHOT_SIZE);
  eng.check(eng.exp.Game_Visualiser_Timeline_GetMain(game, eng.outBuf));
  const main = eng.outHandle;
  eng.check(eng.exp.Game_Visualiser_Timeline_Seek(game, main, 0, 0));
  const read = () => { eng.check(eng.exp.Game_Visualiser_ReadTimelineState(game, snap)); return decodeTimeline(eng.view, snap); };
  const next = () => { try { eng.check(eng.exp.Game_Visualiser_Timeline_ReplayNext(game, 1)); return read(); } catch { return null; } };
  return { eng, game, read, next };
}

export const isTurnStart = (st) => st.step.kind === 3 && st.step.phase === 14 && st.phase === 10;

export async function openAtTurn(file, { round, team, type, id }) {
  const r = await openReplay(file);
  let st = r.read();
  for (;;) {
    st = r.next();
    if (!st) throw new Error(`turn not found: round ${round} team ${team} ${type ?? id}`);
    if (st.round > round) throw new Error(`passed round ${round} without a matching turn start`);
    if (st.round !== round || !isTurnStart(st)) continue;
    const c = st.champions.find((x) => x.entity.index === st.currentChampion);
    if (!c || c.team !== team) continue;
    if (id !== undefined && c.entity.index !== id) continue;
    if (type !== undefined && CHAMPION_TYPES[c.type] !== type) continue;
    return { ...r, st, champion: c };
  }
}
