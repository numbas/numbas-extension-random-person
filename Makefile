DATASETS=$(wildcard datasets/*.json)
COMPRESSED=$(patsubst datasets/%, compressed/%, $(DATASETS))

lib/random_person.js: random_person.js $(COMPRESSED)
	python create_extension_file.py

compressed/%.json: datasets/%.json
	@mkdir -p compressed
	node compress.js $< $@
