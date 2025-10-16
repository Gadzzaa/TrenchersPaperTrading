const fs = require("fs");

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
manifest.version = process.argv[2];
fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));

console.log("Updated manifest.json to version", manifest.version);
