import fs from 'node:fs';import {get} from './http.mjs';
const [s,q]=await Promise.all([get('/submissions'),get('/challenges')]);const d={at:new Date().toISOString(),version:s.active?.version,submissionId:s.active?.id,rank:q.requesterRank,quota:q.quota,ready:q.ready};fs.writeFileSync(import.meta.dirname+'/status_latest.json',JSON.stringify(d,null,2));console.log(JSON.stringify(d));
