#!/usr/bin/env node

const infile = process.argv[2];
const outfile = process.argv[3];

const LZString = require('./lz_string.js');
const fs = require('fs');

fs.readFile(infile, {encoding: 'utf-8'}, (err,data) => {
    const comp = LZString.compressToUTF16(data);
    fs.writeFile(outfile,comp,{encoding:'utf-8'}, (err) => {});
});
