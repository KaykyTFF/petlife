/**
 * Toast Component
 * @param {string} message - Toast message
 * @param {'success' | 'warning' | 'danger' | 'info'} type - Toast type
 * @returns {string} - HTML string
 */
export const Toast = (message, type = 'success') => {
  const icons = {
    success: 'M5 13l4 4L19 7',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    danger: 'M6 18L18 6M6 6l12 12',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  const bgClasses = {
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    info: 'bg-sky-600'
  };

  return `
    <div class="fixed bottom-8 right-8 z-[200] ${bgClasses[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce-in">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${icons[type]}" />
      </svg>
      <p class="font-bold tracking-wide">${message}</p>
    </div>
  `;
};
