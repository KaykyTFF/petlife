/**
 * Empty State Component (Clean SaaS Style)
 * @param {Object} options
 * @param {string} options.title - Title text
 * @param {string} options.description - Description text
 * @param {string} [options.icon] - SVG icon string
 * @param {string} [options.actionText] - Button text
 * @param {string} [options.actionHref] - Button link
 * @returns {string} - HTML string
 */
export const EmptyState = ({ title, description, icon, actionText, actionHref }) => {
  const defaultIcon = `
    <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
  `;

  return `
    <div class="empty-state">
      <div class="flex flex-col items-center max-w-sm">
        ${icon || defaultIcon}
        <h3 class="text-lg font-semibold text-[var(--color-text)] mb-2">${title}</h3>
        <p class="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">${description}</p>
        ${actionText ? `
          <a href="${actionHref || '#'}" class="btn-primary">
            ${actionText}
          </a>
        ` : ''}
      </div>
    </div>
  `;
};
