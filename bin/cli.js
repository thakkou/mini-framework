#!/usr/bin/env node

import fs from "fs";
import path from "path";

const template = path.join(import.meta.dirname, "../todomvc");
const destination = process.argv[2];

fs.cpSync(template, destination, {
    recursive: true
});

console.log("Next Steps...");
console.log(" 1. git init");
console.log(" 2. npm i");