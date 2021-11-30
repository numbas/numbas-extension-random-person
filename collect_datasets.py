#!/usr/bin/env python3

from pathlib import Path
import json

datasets = {}

for p in Path('compressed').iterdir():
    if p.is_file:
        with open(p) as f:
            datasets[p.stem] = f.read()

with open('data.js','w') as f:
    f.write('var datasets = '+json.dumps(datasets)+';')
