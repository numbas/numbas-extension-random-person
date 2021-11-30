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
  let normalized_map = (s) =>
    prefix_map(normalize_data(data["names"][s] || []));
  let normalized_reduced_map = (s) => reduce_prefix_map(normalized_map(s));
  //console.log(JSON.stringify(normalized_reduced_map("male"), null, 2));
  //
  let names = {
    neutral: normalized_reduced_map("neutral"),
    male: normalized_reduced_map("male"),
    female: normalized_reduced_map("female"),
  };

  // Check calculations
  let cloned_names = JSON.parse(JSON.stringify(names));
  for (let gender of Object.keys(data.names)) {
    count_reduced_prefix_map(cloned_names[gender]);
    if (data.totals[gender] !== cloned_names[gender]["#"]) {
      console.error(
        "Invalid prefix maps, counts are ",
        data.totals[gender],
        "and",
        cloned_names[gender]["#"]
      );
    }
  }

  return {
    names,
    totals: data.totals,
  };
};

// list is a list of [name, count] pairs
// Returns a (verbose) prefix map
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

const is_reducible = (map, key) => {
  let sub_keys = Object.keys(map[key]);
  if (sub_keys.length === 1) {
    return sub_keys[0];
  } else {
    return null;
  }
};

// map is a prefix map
// reduces the prefix map to be as small as possible by combining subnodes that have only one child
const reduce_prefix_map = (map) => {
  let keys_to_reduce = Object.keys(map);
  while (keys_to_reduce.length > 0) {
    let key = keys_to_reduce.pop();
    let subkey = is_reducible(map, key);
    if (subkey !== null) {
      let current = map[key];
      delete map[key];
      map[key + subkey] = current[subkey];
      keys_to_reduce.push(key + subkey); // Let this one be checked again
    } else {
      reduce_prefix_map(map[key]);
    }
  }
  return map;
};

/** Find count for a key in a counted reduce_prefix_map
 *
 */
function find_count(map, key) {
  if (Object.keys(map[key]).length === 0) {
    return map[key];
  } else {
    return map[key]["#"];
  }
}

/** Change a reduced prefix map so it becomes a counted reduced prefix map
 * It contains an extra field "#" in each map that has to total number usages of names in the node (including subnodes)
 * The top level contains an "#" field with the total number of occurrences
 */
var count_reduced_prefix_map = function (map) {
  var keys = Object.keys(map);
  if (keys.length === 0) {
    return;
  }
  for (var key_index in keys) {
    var key = keys[key_index];
    count_reduced_prefix_map(map[key]);
  }
  var count = 0;
  for (var key_index in keys) {
    var key = keys[key_index];
    count += find_count(map, key);
  }
  map["#"] = count;
};

fs.readFile(infile, { encoding: "utf-8" }, (err, data) => {
  let comp = JSON.stringify(calculate_prefix_maps(JSON.parse(data)));
  comp = LZString.compressToBase64(comp);
  fs.writeFile(outfile, comp, { encoding: "utf-8" }, (err) => {});
});
