/**
 * Alert Card Component (Clean SaaS Style)
 * @param {Object} options
 * @param {string} options.title - Alert title
 * @param {string} options.description - Alert description
 * @param {'success' | 'warning' | 'danger' | 'info'} type - Alert type
 * @returns {string} - HTML string
 */
export const AlertCard = ({ title, description, type = 'info' }) => {
  const configs = {
    success: { border: 'border-l-success', bg: 'bg-green-50/50', icon: 'text-success', svg: 'M5 13l4 4L19 7' },
    warning: { border: 'border-l-warning', bg: 'bg-amber-50/50', icon: 'text-warning', svg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    danger: { border: 'border-l-danger', bg: 'bg-red-50/50', icon: 'text-danger', svg: 'M6 18L18 6M6 6l12 12' },
    info: { border: 'border-l-info', bg: 'bg-sky-50/50', icon: 'text-info', svg: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  };

  const config = configs[type] || configs.info;

  return `
    <div class="card border-l-4 ${config.border} ${config.bg} flex items-start gap-4">
      <div class="mt-0.5 ${config.icon} flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${config.svg}" />
        </svg>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-[var(--color-text)] mb-1">${title}</h4>
        <p class="text-sm text-[var(--color-text-muted)]">${description}</p>
      </div>
    </div>
  `;
};
