const accountNameBtn = document.getElementById('accountNameBtn');
const accountDropdown = document.querySelector('.accountDropdown');
const signOutBtn = document.getElementById('signOutBtn');
const resetAccBtn = document.getElementById('resetAccBtn');
let dropdownOpen = false;

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

resetAccBtn.addEventListener('click', () => {

});

signOutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedInUsername');
  localStorage.removeItem('sessionToken');
  window.location.href = 'account.html';
});
