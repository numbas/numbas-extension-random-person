#!/usr/bin/env python3

from pathlib import Path
import jinja2
import json

datasets = {}

for p in Path('compressed').iterdir():
    if p.is_file:
        with open(p, encoding="utf8") as f:
            datasets[p.stem] = f.read()

datasets_code = 'var datasets = ' + \
    json.dumps(datasets, ensure_ascii=False, indent=2)+';'

complete_code = jinja2.Environment(
    loader=jinja2.FileSystemLoader('./')
).get_template('random_person.js').render(datasets=datasets_code)

with open('lib/random_person.js', 'w', encoding="utf8") as f:
    f.write(complete_code)
