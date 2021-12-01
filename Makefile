DATASETS=$(wildcard datasets/*.json)
COMPRESSED=$(patsubst datasets/%, compressed/%, $(DATASETS))

lib/random_person.js: $(COMPRESSED)
	python3 create_extension_file.py

compressed/%.json: datasets/%.json
	node compress.js $< $@
