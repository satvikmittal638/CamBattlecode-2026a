import json, zipfile, re, struct, statistics
from pathlib import Path
p=Path(__file__).parent
rows=[]
for g in json.loads((p/'games/index.json').read_text()):
    with zipfile.ZipFile(p/'games'/g['file']) as z:
        name='team-'+g['side']
        text=z.read(name+'.stdout').decode('utf-8').replace('\0','') if name+'.stdout' in z.namelist() else ''
        geo=list(map(int,re.findall(r'geo_ready (\d+)',text)))
        geo_all=list(map(int,re.findall(r'geo_all_ready (\d+)',text)))
        suspended=re.findall(r'suspended (\d+) (\d+) ([^\n]+)',text)
        error_lines=[line[:250] for line in text.splitlines() if 'bot error:' in line or re.search(r'errors [1-9]',line) or line.startswith('API ')]
        f=z.read(name+'.fuel') if name+'.fuel' in z.namelist() else b''
        fuel={}
        if f:
            assert len(f)>=77 and (len(f)-77)%8==0
            limits=struct.unpack_from('<4Q',f,13+(g['side']=='b')*32)
            values=struct.unpack('<'+'Q'*((len(f)-77)//8),f[77:])
            picks=len(g['myDraft'])
            ordinary=values[picks+picks+('3' in g['myDraft']):]
            fuel={'limits':limits,'inputs':len(values),'ordinaryInputs':len(ordinary),'atLimit':sum(x>=limits[3] for x in ordinary),'maxOrdinary':max(ordinary,default=0),'meanOrdinary':statistics.mean(ordinary) if ordinary else 0}
        rows.append({'matchId':g['matchId'],'map':g['map'],'result':g['result'],'geoReady':geo,'geoAllReady':geo_all,'expectedBuildLabel':('build prism-tempo-2026-10-23' in text),'suspended':suspended,'errors':error_lines,'fuel':fuel})
out={'games':len(rows),'rows':rows,'summary':{'withFullGeometry':sum(bool(r['geoAllReady']) for r in rows),'fullGeometryLogs':sum(len(r['geoAllReady']) for r in rows),'fullGeometryMedianRound':statistics.median([x for r in rows for x in r['geoAllReady']]) if any(r['geoAllReady'] for r in rows) else None,'expectedBuildLabelGames':sum(r['expectedBuildLabel'] for r in rows),'withGeo':sum(bool(r['geoReady']) for r in rows),'geoLogs':sum(len(r['geoReady']) for r in rows),'firstAltarMedianRound':statistics.median([x for r in rows for x in r['geoReady']]) if any(r['geoReady'] for r in rows) else None,'suspended':sum(len(r['suspended']) for r in rows),'errorGames':sum(bool(r['errors']) for r in rows),'ordinaryInputs':sum(r['fuel'].get('ordinaryInputs',0) for r in rows),'atLimit':sum(r['fuel'].get('atLimit',0) for r in rows)}}
(p/'log_audit.json').write_text(json.dumps(out,indent=1))
print(json.dumps(out['summary'],indent=2))
