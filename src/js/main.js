// Global JavaScript for LifePet
console.log('LifePet initialized');

// Basic navigation/state management logic
export const initApp = () => {
  console.log('App ready');

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
};

document.addEventListener('DOMContentLoaded', initApp);
