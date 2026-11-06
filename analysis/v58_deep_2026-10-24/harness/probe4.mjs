import { openAtTurn } from './replay_state.mjs';
import { STEP_KINDS } from '../../../tools/replay_dump.mjs';
const [file, round, team, type] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
const s = await openAtTurn(file, { round, team, type });
const { eng, game, champion } = s; const E = eng.exp, V = () => eng.view;
const persp = E.Engine_Malloc(64), out = E.Engine_Malloc(8192);
V().setUint32(persp, team, true); V().setUint32(persp + 4, champion.entity.index, true);
const err = (c) => (c === 0 ? 'ok' : `err ${c} ${eng.cstr(E.GetLastErrorMsg())}`);
console.log('pos', champion.position);
console.log('Runner_GetState', err(E.Game_Runner_GetState(game, out)), Array.from({length:8},(_,k)=>V().getInt32(out+4*k,true)).join(','));
const tx = champion.position.x + 1, ty = champion.position.y;
console.log('Move', err(E.Game_Action_Move(game, tx, ty, out)), V().getInt32(out, true));
E.Game_API_Champion_Get(game, persp, champion.entity.index, out); console.log('after move pos', V().getInt32(out + 8, true), V().getInt32(out + 12, true));
const st2 = s.read(); console.log('timeline state after', st2.round, st2.phase, STEP_KINDS[st2.step.kind], st2.champions.find(c=>c.entity.index===champion.entity.index).position);
// try stepping replay forward after an applied action
const st3 = s.next(); console.log('next', st3 && st3.round, st3 && STEP_KINDS[st3.step.kind], st3 && st3.champions.find(c=>c.entity.index===champion.entity.index).position);
