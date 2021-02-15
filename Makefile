DATASETS=$(wildcard datasets/*.json)
COMPRESSED=$(patsubst datasets/%, compressed/%, $(DATASETS))

data.js: $(COMPRESSED)
	python collect_datasets.py

compressed/%.json: datasets/%.json
	node compress.js $< $@
