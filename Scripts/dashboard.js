const presetButtons = document.querySelectorAll('.presetsContainer button');
const spinnerOverlay = document.getElementById('spinnerOverlay');
const actionButtons = document.querySelectorAll('.buyButtons button, .sellButtons button');
const spinnerText = document.getElementById('spinnerText');
const notificationPopup = document.getElementById('notificationPopup');
const notificationText = document.getElementById('notificationText');
const notificationInner = document.getElementById('notificationInner');
const accountNameBtn = document.getElementById('accountNameBtn');
const accountDropdown = document.querySelector('.accountDropdown');
const editModeToggle = document.getElementById('editModeToggle');
const container = document.querySelector('.container');
const buyButtons = document.querySelectorAll('.buyButtons button');
const sellButtons = document.querySelectorAll('.sellButtons button');
let dotInterval;
let dropdownOpen = false;
let editMode = false;

document.addEventListener('DOMContentLoaded', function() {

  actionButtons.forEach(button => {
    const action = button.dataset.action;
    const amount = button.dataset.amount;
    const symbol = button.dataset.symbol;
    const preset = button.dataset.preset;

    // Build button text based on available data
    if (action && amount && symbol) {
      // It's a Buy or Sell button
      button.textContent = `${amount} ${symbol}`;
    } else if (preset) {
      // It's a Preset button
      button.textContent = `Preset ${preset}`;
    } else {
      // Fallback if no data (optional)
      button.textContent = 'Action';
    }
  });
});
accountNameBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Stop event bubbling

  if (!dropdownOpen) {
    // Open dropdown
    accountDropdown.style.animation = 'dropdownExpand 0.3s ease forwards';
    accountDropdown.style.opacity = '1';
    accountDropdown.style.pointerEvents = 'auto';
    dropdownOpen = true;
  } else {
    // Close dropdown
    accountDropdown.style.animation = 'dropdownCollapse 0.3s ease forwards';
    setTimeout(() => {
      accountDropdown.style.opacity = '0';
      accountDropdown.style.pointerEvents = 'none';
    }, 300); // Wait for collapse animation
    dropdownOpen = false;
  }
});

// Close dropdown if click outside
document.addEventListener('click', (e) => {
  if (dropdownOpen && !accountNameBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
    accountDropdown.style.animation = 'dropdownCollapse 0.3s ease forwards';
    setTimeout(() => {
      accountDropdown.style.opacity = '0';
      accountDropdown.style.pointerEvents = 'none';
    }, 300);
    dropdownOpen = false;
  }
});
presetButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.remove('pulse-on-click');
    void button.offsetWidth; // restart animation
    button.classList.add('pulse-on-click');
  });
});

editModeToggle.addEventListener('click', () => {
  editMode = !editMode;
  if (editMode) {
    container.classList.add('editModeActive');
  } else {
    container.classList.remove('editModeActive');
  }
});

buyButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    if (editMode) {
      e.preventDefault();
      e.stopImmediatePropagation(); // <--- FULLY stop the event from continuing
      const newValue = prompt('Enter new BUY label:', button.dataset.amount);
      if (newValue !== null && newValue.trim() !== '') {
        button.dataset.amount = newValue;
        let amount = button.dataset.amount;
        let symbol = button.dataset.symbol;
        button.textContent = `${amount} ${symbol}`;
      }
      return;
    } else {
      // Normal Buy logic (your existing functionality)
      console.log('Normal Buy Action');
    }
  });
});

sellButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    if (editMode) {
      e.preventDefault();
      e.stopImmediatePropagation(); // <--- FULLY stop the event from continuing
      const newValue = prompt('Enter new SELL label:', button.dataset.amount);
      if (newValue !== null && newValue.trim() !== '') {
        button.dataset.amount = newValue;
        let amount = button.dataset.amount;
        let symbol = button.dataset.symbol;
        button.textContent = `${amount} ${symbol}`;
      }
      return;
    } else {
      // Normal Sell logic (your existing functionality)
      console.log('Normal Sell Action');
    }
  });
});

actionButtons.forEach(button => {
  button.addEventListener('click', () => {
    showSpinner();

    // Simulate "server delay"
    setTimeout(() => {
      hideSpinner();
      const action = button.dataset.action;
      const amount = button.dataset.amount;
      const symbol = button.dataset.symbol;

      if (action && amount && symbol) {
        if (action === 'buy') {
          showNotification(`You bought ${amount} ${symbol}!`, 'success');
        } else if (action === 'sell') {
          showNotification(`You sold ${amount} ${symbol}!`, 'error');
        }
      } else {
        showNotification(`Action complete!`, 'info');
      }
    }, 2000); // 2 seconds fake loading
  });
});

function triggerPulse(elementId) {
  const element = document.getElementById(elementId);
  element.classList.remove('pulse');
  void element.offsetWidth; // re-trigger animation
  element.classList.add('pulse');
}

// Function to show spinner
function showSpinner() {
  spinnerOverlay.style.opacity = '1';
  spinnerOverlay.style.pointerEvents = 'auto';
  startSpinnerDots();
}

// Function to hide spinner
function hideSpinner() {
  spinnerOverlay.style.opacity = '0';
  spinnerOverlay.style.pointerEvents = 'none';
  stopSpinnerDots();
}

// Function to start the dots animation
function startSpinnerDots() {
  let dots = '';
  dotInterval = setInterval(() => {
    dots = dots.length < 3 ? dots + '.' : '';
    spinnerText.textContent = `Processing${dots}`;
  }, 400); // Every 400ms, add a dot
}

// Function to stop the dots animation
function stopSpinnerDots() {
  clearInterval(dotInterval);
  spinnerText.textContent = 'Processing...'; // Reset text
}

// Generic Notification System
function showNotification(message, type) {
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
  setTimeout(() => {
    notificationInner.style.transform = 'scale(1.15)'; // pop bigger
    setTimeout(() => {
      notificationInner.style.transform = 'scale(1)';
    }, 200); // pop back to normal after 200ms
  }, 100);

  // Animate Text Glow
  setTimeout(() => {
    notificationText.style.animation = 'textGlowPulse 0.8s ease forwards';

    setTimeout(() => {
      notificationText.style.textShadow = 'none';
    }, 800);
  }, 150);

  // Slide Out
  setTimeout(() => {
    notificationPopup.style.opacity = '0';
    notificationPopup.style.transform = 'translateX(-50%) translateY(10px)';
  }, 2000);
}
// Example usage when you update:
/*
document.getElementById('balance').innerText = '1200';
triggerPulse('balance');

document.getElementById('position').innerText = '3';
triggerPulse('position');
*/
