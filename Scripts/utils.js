// Constants
const spinnerOverlay = document.getElementById('spinnerOverlay');
const spinnerText = document.getElementById('spinnerText');
let dotInterval;
const notificationPopup = document.getElementById('notificationPopup');
const notificationText = document.getElementById('notificationText');
const notificationInner = document.getElementById('notificationInner');

let slideOutTimeout;
let popTimeout1;
let popTimeout2;
let glowTimeout1;
let glowTimeout2;

// Spinner.js
export function showSpinner() {
  spinnerOverlay.style.opacity = '1';
  spinnerOverlay.style.pointerEvents = 'auto';
  startSpinnerDots();
}

export function hideSpinner() {
  spinnerOverlay.style.opacity = '0';
  spinnerOverlay.style.pointerEvents = 'none';
  stopSpinnerDots();
}

function startSpinnerDots() {
  let dots = '';
  dotInterval = setInterval(() => {
    dots = dots.length < 3 ? dots + '.' : '';
    spinnerText.textContent = `Processing${dots}`;
  }, 400); // Every 400ms, add a dot
}

function stopSpinnerDots() {
  clearInterval(dotInterval);
  spinnerText.textContent = 'Processing...'; // Reset text
}


// NotificationSystem.js
export function showNotification(message, type) {
  // Clear old animations first if any
  clearTimeout(slideOutTimeout);
  clearTimeout(popTimeout1);
  clearTimeout(popTimeout2);
  clearTimeout(glowTimeout1);
  clearTimeout(glowTimeout2);

  notificationText.textContent = message;

  notificationPopup.classList.remove('successNotification', 'errorNotification', 'infoNotification');
  notificationPopup.style.color = ''; // reset inline color if any

  if (type === 'success') {
    notificationPopup.classList.add('successNotification');
  } else if (type === 'error') {
    notificationPopup.classList.add('errorNotification');
  } else if (type === 'info') {
    notificationPopup.classList.add('infoNotification');
  }

  notificationPopup.style.opacity = '0';
  notificationPopup.style.transform = 'translateX(-50%) translateY(10px)';
  notificationInner.style.transform = 'scale(1)';
  notificationInner.style.transition = 'transform 0.4s ease';
  notificationText.style.animation = '';

  // Animate Slide Up
  setTimeout(() => {
    notificationPopup.style.opacity = '1';
    notificationPopup.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 10);

  // Animate Inner Scale Pop
  popTimeout1 = setTimeout(() => {
    notificationInner.style.transform = 'scale(1.15)'; // pop bigger
    popTimeout2 = setTimeout(() => {
      notificationInner.style.transform = 'scale(1)';
    }, 200); // pop back to normal after 200ms
  }, 100);

  // Animate Text Glow
  glowTimeout1 = setTimeout(() => {
    notificationText.style.animation = 'textGlowPulse 0.8s ease forwards';

    glowTimeout2 = setTimeout(() => {
      notificationText.style.textShadow = 'none';
    }, 800);
  }, 150);

  // Slide Out after 2 seconds
  slideOutTimeout = setTimeout(() => {
    notificationPopup.style.opacity = '0';
    notificationPopup.style.transform = 'translateX(-50%) translateY(10px)';
  }, 3000);
}
