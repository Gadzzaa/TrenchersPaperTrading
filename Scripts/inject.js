// Core state
let appInjected = false;
let lastPathname = location.pathname;
let contractObserver = null;
let lastFullPath = location.pathname;
let lastContract = null;

window.addEventListener('message', (event) => {
  const { type, requestId } = event.data;

  if (type === 'CONTRACT_REQUEST' && requestId) {
    const contract = extractContractFromImage();
    event.source.postMessage({
      type: 'CONTRACT_RESPONSE',
      contract,
      requestId
    }, '*');
  }
});

// Extract contract from image src
function extractContractFromImage() {
  const link = document.querySelector('a[href*="x.com/search?q="]');
  if (!link) return null;

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

  return null;
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
    height: '525px',
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

// 🚀 Start the app
monitorRouteChanges();
