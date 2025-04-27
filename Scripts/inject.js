function injectApp() {
  // 1. Create container
  const appContainer = document.createElement('div');
  appContainer.id = 'TrenchersPaperTrading';
  appContainer.style.position = 'fixed';
  appContainer.style.top = '100px';
  appContainer.style.left = '100px';
  appContainer.style.width = '330px';
  appContainer.style.height = '520px';
  appContainer.style.zIndex = '99999';
  appContainer.style.borderRadius = '20px';
  appContainer.style.overflow = 'hidden';
  appContainer.style.userSelect = 'none';

  // 🆕 Fade in setup
  appContainer.style.opacity = '0';
  appContainer.style.transition = 'opacity 0.3s ease';

  // 2. Create iframe
  const appIframe = document.createElement('iframe');
  appIframe.src = chrome.runtime.getURL('account.html');
  appIframe.style.width = '100%';
  appIframe.style.height = '100%';
  appIframe.style.background = 'linear-gradient(135deg, #0d0d0d, #111111, #0d0d0d)';
  appIframe.style.overflow = 'hidden';

  appContainer.appendChild(appIframe);
  document.body.appendChild(appContainer);

  // 🆕 Trigger the fade-in after 50ms
  setTimeout(() => {
    appContainer.style.opacity = '1';
  }, 50);
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

injectApp();
