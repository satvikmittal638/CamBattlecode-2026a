"""Validate the frozen report without running games or contacting the platform."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
from datetime import datetime, timezone
import hashlib
import json
import re
import struct
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

OUT = Path(__file__).resolve().parents[1]


def read(name):
    return json.loads((OUT / name).read_text())


def digest(data):
    return hashlib.sha256(data).hexdigest()


checks = {}
source_hashes = read('evidence/source_hashes.json')
assert len(source_hashes) == 29
for row in source_hashes:
    assert digest((OUT / 'source' / row['path']).read_bytes()) == row['sha256']
assert len(list((OUT / 'source/src').rglob('*.*'))) == 29
checks['sourceFilesByteMatched'] = 29

with zipfile.ZipFile(OUT / 'v58_source_snapshot.zip') as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == {row['path'] for row in source_hashes}
    for row in source_hashes:
        assert digest(archive.read(row['path'])) == row['sha256']
checks['archiveFilesByteMatched'] = 29

protocol = read('evidence/local/PROTOCOL.json')
for version in ('v56', 'v57'):
    for name, expected in protocol['hashes'][version].items():
        assert digest((OUT / 'comparison' / version / 'src' / name).read_bytes()) == expected
checks['comparisonSourcesMatchFrozenProtocol'] = True

excerpts = read('evidence/code_excerpt_index.json')
readme = (OUT / 'README.md').read_text()
blocks = re.findall(r'```cpp\n(.*?)\n```', readme, re.S)
assert len(blocks) == len(excerpts) == 33
for row, block in zip(excerpts, blocks):
    lines = (OUT / row['file']).read_text().splitlines()
    expected = '\n'.join(lines[row['firstLine'] - 1:row['lastLine']])
    assert expected == block
    assert digest(block.encode()) == row['sha256']
checks['exactSourceExcerpts'] = 33
assert len(re.findall(r'^### F\d\d ', readme, re.M)) == 18
checks['findingSections'] = 18

def anchors(text):
    result = set()
    counts = {}
    for heading in re.findall(r'^#{1,6}\s+(.+)', text, re.M):
        heading = re.sub(r'[*`]', '', heading).lower()
        slug = ''.join(c for c in heading if c in '_- ' or unicodedata.category(c)[0] in 'LN')
        slug = slug.replace(' ', '-')
        suffix = counts.get(slug, 0)
        counts[slug] = suffix + 1
        result.add(slug + (f'-{suffix}' if suffix else ''))
    return result

link_count = 0
for name in ('README.md', 'SOURCE_GUIDE.md', 'MATCHES.md'):
    path = OUT / name
    text = path.read_text()
    assert '/Users/' not in text
    assert 'data:image/' not in text
    text = re.sub(r'```.*?```', '', text, flags=re.S)
    for target in re.findall(r'!?\[[^\]\n]*\]\(([^)]+)\)', text):
        target = target.strip('<>')
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc:
            continue
        destination = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
        assert destination.is_relative_to(OUT), (name, target, 'outside package')
        assert destination.exists(), (name, target, 'missing')
        if parsed.fragment:
            if re.fullmatch(r'L\d+', parsed.fragment):
                assert int(parsed.fragment[1:]) <= len(destination.read_text().splitlines())
            elif destination.suffix == '.md':
                assert parsed.fragment in anchors(destination.read_text()), (name, target, 'anchor')
        link_count += 1
checks['relativeLinksChecked'] = link_count
checks['missingRelativeLinks'] = 0

images = []
for stem in ('economy_combat', 'local_comparison', 'replay_timelines', 'capture_deadlock'):
    data = (OUT / (stem + '.png')).read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    width, height = struct.unpack('>II', data[16:24])
    assert width > 0 and height > 0
    ET.parse(OUT / (stem + '.svg'))
    assert f']({stem}.png)' in readme
    images.append({'png': stem + '.png', 'svg': stem + '.svg', 'width': width, 'height': height})
checks['rootImageFiles'] = 8

matches = read('evidence/matches.json')
finished = [m for m in matches if m['status'] == 'finished']
queued = [m for m in matches if m['status'] == 'queued']
index = read('replays/index.json')
metrics = read('evidence/metrics.json')['rows']
ids = {m['id'] for m in finished}
assert len(matches) == 135 and len(finished) == len(ids) == 130 and len(queued) == 5
assert ids == {r['matchId'] for r in index} == {r['matchId'] for r in metrics}
replays = list((OUT / 'replays').rglob('*.repl26a'))
assert len(replays) == 130
for row in index:
    assert (OUT / 'replays' / row['file']).stat().st_size > 0
assert {p.stem for p in (OUT / 'evidence/official_summaries').glob('*.json')} == ids
aggregates = {r['matchId']: r for r in read('evidence/official_aggregates.json')}
assert set(aggregates) == ids
for row in metrics:
    official = read('evidence/official_summaries/' + row['matchId'] + '.json')
    assert official['match']['roundsStarted'] == row['rounds']
    us = 'teamA' if row['side'] == 'a' else 'teamB'
    assert official['us'] == us
    assert official['match']['outcome'] == (us if row['result'] == 'win' else ('teamB' if us == 'teamA' else 'teamA'))
    assert aggregates[row['matchId']]['us']['submittedGems'] == row['score']
    assert aggregates[row['matchId']]['enemy']['submittedGems'] == row['oppScore']
assert sum(r['result'] == 'win' for r in metrics) == 55
assert sum(r['steps'] for r in metrics) == 26502007
checks.update(platformReplays=130, officialSummaries=130, queuedExcluded=5,
              officialScoresOutcomesRoundsMatched=130, nativeSteps=26502007)

local = read('evidence/local/results.json')['rows']
assert len(local) == len({r['key'] for r in local}) == 280
assert len(list((OUT / 'local_replays').glob('*.repl26a'))) == 280
for row in local:
    assert (OUT / 'local_replays' / Path(row['replay']).name).stat().st_size > 0
    assert row['myFaults'] == row['opFaults'] == 0
for group in read('evidence/local/paired_flips.json').values():
    for row in group['lossCases']:
        for key in ('v58Replay', 'previousReplay'):
            assert (OUT / row[key]).is_file()
checks['localReplays'] = 280
checks['localBotFaults'] = 0

validation = {'at': datetime.now(timezone.utc).isoformat(), 'status': 'passed',
              'scope': 'Package integrity and evidence consistency; no new gameplay trials.',
              'checks': checks, 'images': images,
              'readmeWordsIncludingCode': len(readme.split()),
              'newBotChanges': 0, 'newSubmissions': 0, 'newChallenges': 0}
(OUT / 'VALIDATION.json').write_text(json.dumps(validation, indent=2) + '\n')
files = []
for path in sorted(OUT.rglob('*')):
    if path.is_file() and path.name != 'PACKAGE_MANIFEST.json' and '__pycache__' not in path.parts:
        data = path.read_bytes()
        files.append({'path': str(path.relative_to(OUT)), 'bytes': len(data), 'sha256': digest(data)})
manifest = {'version': 58, 'submissionId': '8f42f685-6d52-4cae-896c-cbb27925a808',
            'replayCutoff': '2026-10-23T13:58:59.309Z', 'readme': 'README.md',
            'hashAlgorithm': 'SHA256', 'selfExcluded': 'PACKAGE_MANIFEST.json',
            'fileCount': len(files), 'totalBytes': sum(f['bytes'] for f in files), 'files': files}
(OUT / 'PACKAGE_MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'status': 'passed', 'checks': checks, 'files': len(files),
                  'megabytes': round(manifest['totalBytes'] / 1e6, 1)}, indent=2))
