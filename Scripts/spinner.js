const spinnerOverlay = document.getElementById('spinnerOverlay');
const spinnerText = document.getElementById('spinnerText');
let dotInterval;
// Function to show spinner
export function showSpinner() {
  if (!spinnerOverlay || !spinnerText) return;
  spinnerOverlay.style.opacity = '1';
  spinnerOverlay.style.pointerEvents = 'auto';
  startSpinnerDots();
}

// Function to hide spinner
export function hideSpinner() {
  if (!spinnerOverlay || !spinnerText) return;
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
  }, 500); // Every 400ms, add a dot
}

// Function to stop the dots animation
function stopSpinnerDots() {
  clearInterval(dotInterval);
  spinnerText.textContent = 'Processing...'; // Reset text
}

