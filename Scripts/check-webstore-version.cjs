const https = require('https');

/**
 * Fetches the current version of an extension from the Chrome Web Store API
 * Uses the Chrome Web Store Publish API to get extension details
 * @param {string} extensionId - The Chrome extension ID
 * @param {string} accessToken - OAuth2 access token for Chrome Web Store API
 * @returns {Promise<string>} The current version on the Chrome Web Store
 */
function getChromeWebStoreVersion(extensionId, accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      path: `/chromewebstore/v1.1/items/${extensionId}?projection=DRAFT`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-goog-api-version': '2'
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 401) {
            reject(new Error('Unauthorized - invalid or expired access token'));
            return;
          }
          
          if (res.statusCode !== 200) {
            reject(new Error(`API returned status ${res.statusCode}: ${data}`));
            return;
          }
          
          const response = JSON.parse(data);
          
          // The API returns version in the crxVersion field
          if (response.crxVersion) {
            resolve(response.crxVersion);
          } else {
            reject(new Error('Could not find version information in API response'));
          }
        } catch (error) {
          reject(new Error(`Error parsing Chrome Web Store API response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Error fetching Chrome Web Store API: ${error.message}`));
    });
  });
}

/**
 * Gets an OAuth2 access token using refresh token
 * @param {string} clientId - OAuth2 client ID
 * @param {string} clientSecret - OAuth2 client secret
 * @param {string} refreshToken - OAuth2 refresh token
 * @returns {Promise<string>} Access token
 */
function getAccessToken(clientId, clientSecret, refreshToken) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString();
    
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error(`Failed to get access token: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Error parsing OAuth response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Error getting access token: ${error.message}`));
    });
    
    req.write(postData);
    req.end();
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
const clientId = process.argv[4];
const clientSecret = process.argv[5];
const refreshToken = process.argv[6];

if (!extensionId || !newVersion) {
  console.error('Usage: node check-webstore-version.cjs <extension-id> <new-version> [client-id] [client-secret] [refresh-token]');
  console.error('');
  console.error('For private extensions, you must provide OAuth credentials:');
  console.error('  - client-id: Your OAuth2 client ID');
  console.error('  - client-secret: Your OAuth2 client secret');
  console.error('  - refresh-token: Your OAuth2 refresh token');
  process.exit(1);
}

// If OAuth credentials are provided, use the API
if (clientId && clientSecret && refreshToken) {
  console.log('Using Chrome Web Store API with OAuth credentials...');
  
  getAccessToken(clientId, clientSecret, refreshToken)
    .then((accessToken) => {
      return getChromeWebStoreVersion(extensionId, accessToken);
    })
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
} else {
  console.log('⚠ No OAuth credentials provided - skipping version check for private extension');
  console.log('⚠ Proceeding with upload...');
  process.exit(0);
}
