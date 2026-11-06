import { openAtTurn } from './replay_state.mjs';
import { STEP_KINDS } from '../../../tools/replay_dump.mjs';
const [file, round, team, type] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
const s = await openAtTurn(file, { round, team, type });
const { eng, game, champion } = s; const E = eng.exp, V = () => eng.view;
const out = E.Engine_Malloc(8192);
const err = (c) => (c === 0 ? 'ok' : `err ${c} ${eng.cstr(E.GetLastErrorMsg())}`);
let st = s.st;
for (let i = 0; i < 8; i++) {
  E.Game_Runner_GetState(game, out);
  console.log(i, st.round, 'phase', st.phase, 'stepphase', st.step.phase, STEP_KINDS[st.step.kind], 'cur', st.currentChampion, 'runner', Array.from({length:6},(_,k)=>V().getInt32(out+4*k,true)).join(','));
  st = s.next();
}
