const https = require('https');

/**
 * Fetches the current version of an extension from the Chrome Web Store
 * @param {string} extensionId - The Chrome extension ID
 * @returns {Promise<string>} The current version on the Chrome Web Store
 */
function getChromeWebStoreVersion(extensionId) {
  return new Promise((resolve, reject) => {
    const url = `https://chrome.google.com/webstore/detail/${extensionId}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // The Chrome Web Store embeds version info in a specific meta tag or script
          // Pattern: "version":"X.Y.Z"
          const versionMatch = data.match(/"version":"([^"]+)"/);
          
          if (versionMatch && versionMatch[1]) {
            resolve(versionMatch[1]);
          } else {
            // Try alternative pattern
            const altMatch = data.match(/Version:\s*([0-9]+\.[0-9]+\.[0-9]+)/i);
            if (altMatch && altMatch[1]) {
              resolve(altMatch[1]);
            } else {
              reject(new Error('Could not find version information on Chrome Web Store'));
            }
          }
        } catch (error) {
          reject(new Error(`Error parsing Chrome Web Store response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Error fetching Chrome Web Store: ${error.message}`));
    });
  });
}

/**
 * Compares two semantic version strings
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

// Main execution
const extensionId = process.argv[2];
const newVersion = process.argv[3];

if (!extensionId || !newVersion) {
  console.error('Usage: node check-webstore-version.cjs <extension-id> <new-version>');
  process.exit(1);
}

getChromeWebStoreVersion(extensionId)
  .then((currentVersion) => {
    console.log(`Current Chrome Web Store version: ${currentVersion}`);
    console.log(`New version to publish: ${newVersion}`);
    
    const comparison = compareVersions(newVersion, currentVersion);
    
    if (comparison > 0) {
      console.log('✓ New version is newer than Chrome Web Store version');
      process.exit(0);
    } else if (comparison === 0) {
      console.log('⚠ New version is the same as Chrome Web Store version');
      process.exit(2);
    } else {
      console.log('✗ New version is older than Chrome Web Store version');
      process.exit(3);
    }
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    console.log('⚠ Could not verify Chrome Web Store version, proceeding with upload...');
    // Exit with 0 to allow the workflow to continue if we can't check the version
    process.exit(0);
  });
