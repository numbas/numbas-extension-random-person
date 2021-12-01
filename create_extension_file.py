#!/usr/bin/env python3

from pathlib import Path
import jinja2
import json

datasets = {}

for p in Path('compressed').iterdir():
    if p.is_file:
        with open(p) as f:
            datasets[p.stem] = f.read()

datasets_code = 'var datasets = '+json.dumps(datasets)+';'

complete_code = jinja2.Environment(
        loader=jinja2.FileSystemLoader('./')
    ).get_template('random_person.js').render(datasets=datasets_code)

with open('lib/random_person.js','w') as f:
     f.write(complete_code)
