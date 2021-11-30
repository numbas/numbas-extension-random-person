#!/usr/bin/env node

const infile = process.argv[2];
const outfile = process.argv[3];

const LZString = require("./lz_string.js");
const fs = require("fs");

const normalize_data = (names_list) => {
  let list = [];
  for (let { name, count } of names_list) {
    list.push([name, count]);
  }
  return list;
};

// Data is of form { "names": {  "neutral": {"name": ..., "count": number}[], "female": [], "male": []}, "totals": {"neutral": number, "female": number, "male": number } }
const calculate_prefix_maps = (data) => {
  let normalized_map = (s) => prefix_map(normalize_data(data["names"][s]));
  //console.log(JSON.stringify(normalized_map("male"), null, 2));
  return {
    neutral: normalized_map("neutral"),
    male: normalized_map("male"),
    female: normalized_map("female"),
  };
};

// list is a list of [name, count] pairs
const prefix_map = (list) => {
  let tree = {};
  for (let list_index in list) {
    let item = list[list_index];
    let name = item[0];
    let current_tree = tree;
    for (character_index in name) {
      let character = name[character_index];
      if (Object.keys(current_tree).indexOf(character) === -1) {
        current_tree[character] = {};
      }
      current_tree = current_tree[character];
    }
    current_tree[""] = item[1]; // set the score
  }
  return tree;
};

fs.readFile(infile, { encoding: "utf-8" }, (err, data) => {
  //const comp = LZString.compressToUTF16(data);
  const comp = JSON.stringify(calculate_prefix_maps(JSON.parse(data)));
  fs.writeFile(outfile, comp, { encoding: "utf-8" }, (err) => {});
});
