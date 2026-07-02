import { requireAuth, logoutUser } from './auth.js';
import { initErrorLogger } from './utils/errorLogger.js';

// Global JavaScript for LifePet
console.log('LifePet initialized');

// Basic navigation/state management logic
export const initApp = () => {
  console.log('App ready');
  initErrorLogger();
  
  // Add floating debug button if in dev
  if (import.meta.env.VITE_DEBUG === 'true' && !window.location.pathname.includes('/debug/')) {
      const btn = document.createElement('a');
      btn.href = '/pages/debug/index.html';
      btn.target = '_blank';
      btn.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg z-50 text-xs font-bold hover:bg-gray-700 transition flex items-center gap-2';
      btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> Debug Panel`;
      document.body.appendChild(btn);
  }
  
  // Check Authentication
  if (!window.location.pathname.includes('/debug/')) {
      requireAuth();
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Handle Logout
  document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('.sidebar-logout');
    if (logoutBtn) {
        e.preventDefault();
        console.log('Logging out...');
        logoutUser();
    }
  });
};

document.addEventListener('DOMContentLoaded', initApp);
