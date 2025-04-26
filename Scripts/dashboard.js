const presetButtons = document.querySelectorAll('.presetsContainer button');

presetButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.remove('pulse-on-click');
    void button.offsetWidth; // restart animation
    button.classList.add('pulse-on-click');
  });
});

function triggerPulse(elementId) {
  const element = document.getElementById(elementId);
  element.classList.remove('pulse');
  void element.offsetWidth; // re-trigger animation
  element.classList.add('pulse');
}

// Example usage when you update:
/*
document.getElementById('balance').innerText = '1200';
triggerPulse('balance');

document.getElementById('position').innerText = '3';
triggerPulse('position');
*/
