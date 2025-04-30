let slideOutTimeout;
let popTimeout1;
let popTimeout2;
let glowTimeout1;
let glowTimeout2;

// Generic Notification System
export function showNotification(message, type) {
  const notificationPopup = document.getElementById('notificationPopup');
  const notificationText = document.getElementById('notificationText');
  const notificationInner = document.getElementById('notificationInner');
  if (!notificationPopup || !notificationText || !notificationInner) return;
  // Clear old animations first if any
  clearTimeout(slideOutTimeout);
  clearTimeout(popTimeout1);
  clearTimeout(popTimeout2);
  clearTimeout(glowTimeout1);
  clearTimeout(glowTimeout2);

  notificationText.textContent = message;

  notificationPopup.classList.remove('successNotification', 'errorNotification', 'infoNotification');
  notificationPopup.style.color = ''; // reset inline color if any

  const typeClasses = {
    success: 'successNotification',
    error: 'errorNotification',
    info: 'infoNotification'
  };
  notificationPopup.classList.add(typeClasses[type] || '');
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
