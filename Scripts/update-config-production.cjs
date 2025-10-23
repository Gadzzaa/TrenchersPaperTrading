const fs = require("fs");

/**
 * Updates config.js to set USE_LOCAL to false for production releases
 */

const configPath = "config.js";
const configContent = fs.readFileSync(configPath, "utf8");

// Replace USE_LOCAL = true with USE_LOCAL = false
const updatedContent = configContent.replace(
  /export const USE_LOCAL = true;/,
  "export const USE_LOCAL = false;"
);

if (configContent === updatedContent) {
  console.log("Warning: USE_LOCAL was already set to false or not found");
} else {
  fs.writeFileSync(configPath, updatedContent);
  console.log("Updated config.js: Set USE_LOCAL to false");
}
