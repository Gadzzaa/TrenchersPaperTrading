function injectApp() {
  // 1. Create container
  const appContainer = document.createElement('div');
  appContainer.id = 'my-extension-app';
  appContainer.style.position = 'fixed';
  appContainer.style.top = '100px';
  appContainer.style.left = '100px';
  appContainer.style.width = '340px';
  appContainer.style.height = '525px';
  appContainer.style.zIndex = '99999';
  appContainer.style.background = 'rgba(30, 30, 30, 0.95)';
  appContainer.style.borderRadius = '12px';
  appContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  appContainer.style.overflow = 'hidden';
  appContainer.style.backdropFilter = 'blur(8px)';
  appContainer.style.userSelect = 'none';

  // 🆕 Fade in setup
  appContainer.style.opacity = '0';
  appContainer.style.transition = 'opacity 0.3s ease';

  // 2. Create iframe
  const appIframe = document.createElement('iframe');
  appIframe.src = chrome.runtime.getURL('account.html'); // or dashboard.html
  appIframe.style.width = '100%';
  appIframe.style.height = '100%';
  appIframe.style.border = 'none';
  appIframe.style.borderRadius = '12px';

  appContainer.appendChild(appIframe);
  document.body.appendChild(appContainer);

  // 3. Create move handle
  const moveHandle = document.createElement('div');
  moveHandle.style.position = 'absolute';
  moveHandle.style.top = '10px';
  moveHandle.style.left = '280px';
  moveHandle.style.width = '50px';
  moveHandle.style.height = '35px';
  moveHandle.style.cursor = 'move';
  moveHandle.style.background = 'transparent';
  moveHandle.style.zIndex = '999999';
  appContainer.appendChild(moveHandle);

  // 4. Make draggable
  makeDraggable(appContainer, moveHandle);

  // 🆕 Trigger the fade-in after 50ms
  setTimeout(() => {
    appContainer.style.opacity = '1';
  }, 50);
}
// Draggable function
function makeDraggable(target, handle) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - target.getBoundingClientRect().left;
    offsetY = e.clientY - target.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      target.style.left = (e.clientX - offsetX) + 'px';
      target.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });
}

// Inject on page load
injectApp();
