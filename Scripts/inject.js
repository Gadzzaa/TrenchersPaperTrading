// Core state
let appInjected = false;
let lastPathname = location.pathname;
let contractObserver = null;
let lastFullPath = location.pathname;
let lastContract = null;

// 🚀 Start the app
monitorRouteChanges();
getSolPrice();
setInterval(getSolPrice, 60 * 60 * 500);


window.addEventListener('message', async (event) => {
  const { type, requestId } = event.data;

  if (type === 'CONTRACT_REQUEST' && requestId) {
    const contract = extractContractFromImage();
    event.source.postMessage({
      type: 'CONTRACT_RESPONSE',
      contract,
      requestId
    }, '*');
  }
  if (type === 'PRICE_REQUEST' && requestId) {
    const price = await getPrice();
    event.source.postMessage({
      type: 'PRICE_RESPONSE',
      price,
      requestId
    }, '*');
  }
  if (type === 'SYMBOL_REQUEST' && requestId) {
    const symbol = extractSymbol();
    event.source.postMessage({
      type: 'SYMBOL_RESPONSE',
      symbol,
      requestId
    }, '*');
  }
});
// Extract contract from image src
function extractContractFromImage() {
  const links = document.querySelectorAll('a[href*="x.com/search?q="]');

  for (const link of links) {
    const target = link.getAttribute('target');
    const rel = link.getAttribute('rel');

    const hasCorrectTarget = target === '_blank';
    const hasCorrectRel = rel?.split(' ').includes('noopener') && rel?.split(' ').includes('noreferrer');

    if (!hasCorrectTarget || !hasCorrectRel) continue; // skip if attributes are missing

    try {
      const url = new URL(link.href);
      const contract = url.searchParams.get('q');

      // Validate it's a real contract-looking string
      if (contract && /^[A-Za-z0-9]{32,}$/.test(contract)) {
        return contract;
      }
    } catch (error) {
      console.error('❌ Error parsing contract from link:', error);
    }
  }

  return null;
}
function extractSymbol() {
  const xpath = '/html/body/div[1]/div[3]/div/div/div/div/div[1]/div[1]/div/div[1]/div[2]/div/div[1]/div[2]/div[1]/span[1]'
  const symbolElement = getElementByXPath(xpath);
  if (!symbolElement) return null;
  try {
    const symbol = symbolElement.innerText;
    if (symbol && symbol.length > 0) {
      return symbol.trim();
    }
  } catch (error) {
    console.error('❌ Error parsing symbol from element:', error);
  }
}
function getElementByXPath(xpath, context = document) {
  const result = document.evaluate(
    xpath,
    context,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  return result.singleNodeValue;
}

function makeDraggable(target, handle) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - target.getBoundingClientRect().left;
    offsetY = e.clientY - target.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';

    // 🔥 Dim the opacity while dragging
    target.style.transition = 'opacity 0.15s ease';
    target.style.opacity = '0.8';
    target.style.transform = 'scale(0.98)';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      target.style.left = (e.clientX - offsetX) + 'px';
      target.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
      // 🔥 Restore opacity
      target.style.opacity = '1';
      target.style.transform = 'scale(1)';
    }
  });
}


function handleRouteChange() {
  const currentPath = location.pathname;
  const isOnMemePage = currentPath.startsWith('/meme');
  lastFullPath = currentPath;

  if (isOnMemePage) {
    if (!appInjected) {
      injectApp();
      appInjected = true;
    }
  } else {
    if (appInjected) {
      removeApp();
      appInjected = false;
    }
  }
}

function removeApp() {
  const appContainer = document.getElementById('TrenchersPaperTrading');
  if (appContainer) {
    appContainer.remove();
    console.log('✅ App removed cleanly');
  }
}

function injectApp() {
  const appContainer = document.createElement('div');
  appContainer.id = 'TrenchersPaperTrading';
  Object.assign(appContainer.style, {
    position: 'fixed',
    top: '100px',
    left: '100px',
    width: '340px',
    height: '530px',
    zIndex: '99999',
    background: 'rgba(30, 30, 30, 0.95)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
    userSelect: 'none',
    opacity: '0',
    transition: 'opacity 0.3s ease',
  });

  const appIframe = document.createElement('iframe');
  appIframe.src = chrome.runtime.getURL('account.html');
  Object.assign(appIframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '12px',
  });

  appContainer.appendChild(appIframe);
  document.body.appendChild(appContainer);

  const moveHandle = document.createElement('div');
  Object.assign(moveHandle.style, {
    position: 'absolute',
    top: '10px',
    left: '280px',
    width: '50px',
    height: '35px',
    cursor: 'all-scroll',
    background: 'transparent',
    zIndex: '999999',
  });

  appContainer.appendChild(moveHandle);
  makeDraggable(appContainer, moveHandle);

  setTimeout(() => {
    appContainer.style.opacity = '1';
  }, 50);
}

function monitorRouteChanges() {
  console.log('🚀 Starting router monitoring...');

  const observer = new MutationObserver(() => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      handleRouteChange();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', () => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      handleRouteChange();
    }
  });

  window.addEventListener('hashchange', () => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      handleRouteChange();
    }
  });

  handleRouteChange();
}

/**
 * Parses a compact number string like "27.9K", "1B", "123M" into a Number.
 */
function parseCompactNumber(txt) {
  // 1) Make sure we have a string
  const raw = String(txt).trim();

  // 2) Remove any leading $ or commas
  const cleaned = raw.replace(/[$,]/g, "");

  // 3) Regex: capture number + optional unit (K/M/B)
  const re = /^(\d+(?:\.\d+)?)([KMB])?$/i;
  const m = cleaned.match(re);
  if (!m) {
    const asNum = Number(cleaned);
    if (isNaN(asNum)) {
      throw new Error(`Unrecognized number format: "${txt}"`);
    }
    return asNum;
  }

  // 4) Parse the numeric part
  const num = parseFloat(m[1]);
  const unit = (m[2] || "").toUpperCase();

  // 5) Apply multiplier if needed
  const mult = unit === "K" ? 1e3
    : unit === "M" ? 1e6
      : unit === "B" ? 1e9
        : 1;

  return num * mult;
}


/**
 * Finds the on-page "Supply" label, reads the next span's text,
 * and returns the circulating supply as a Number.
 */
function getSupply() {
  return 1000000000; // TODO: Fix this
  /*
  // 1. Grab all spans that style numeric values
  const els = document.querySelectorAll('span.text-textPrimary');
  // 2. Regex: digits (with optional decimals) ending in K, M, or B
  const re = /^(\d+(?:\.\d+)?)([KMB])$/;

  for (const el of els) {
    const txt = el.textContent.trim();
    const m = txt.match(re);
    if (m) {
      // parseCompactNumber is your helper from before
      const supply = parseCompactNumber(txt);
      console.log('Parsed supply:', supply);
      return supply;
    }
  }
  */

  throw new Error('Supply element not found');
}

function getMarketCapFromTitle() {
  const title = document.title.trim();
  // e.g. "MyTokenName → $8.71K | Price: 0.00003 SOL"

  // 1) Split on arrow
  const arrowParts = title.split('$');
  if (arrowParts.length < 2) {
    throw new Error('Title missing arrow separator');
  }

  // 2) Take right side and split on pipe
  const rightSide = arrowParts[1].trim();     // "$8.71K | Price:…"
  const pipeParts = rightSide.split('|');
  if (pipeParts.length < 1) {
    throw new Error('Title missing pipe separator');
  }

  // 3) The first segment is the market cap string
  const rawCap = pipeParts[0].trim();         // "$8.71K"

  // 4) Parse it
  const capNumber = parseCompactNumber(rawCap);
  return capNumber;
}
function fetchWithTimeout(url, options = {}, ms = 5000) {
  const timeout = new Promise((_, rej) =>
    setTimeout(() => rej(new Error('Request timed out')), ms)
  );
  return Promise.race([fetch(url, options), timeout]);
}

async function getPrice() {
  try {
    const tokenSupply = getSupply();
    const marketCapUsd = getMarketCapFromTitle();
    const solUsdPrice = localStorage.getItem('solUsdPrice');
    const tokenPriceUsd = marketCapUsd / tokenSupply;
    console.log('Finished getting price:', (tokenPriceUsd / solUsdPrice).toFixed(9), solUsdPrice);
    return (tokenPriceUsd / solUsdPrice).toFixed(9);
  } catch (error) {
    console.error('Error fetching price:', error);
    return null;
  }
}
async function getSolPrice() {
  const resp = await fetchWithTimeout(
    'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
    {},
    5000
  );
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
  const { solana } = await resp.json();
  const solUsdPrice = solana.usd;
  localStorage.setItem('solUsdPrice', solUsdPrice);
}
