/**
 * Status Badge Component (Clean SaaS Style)
 * @param {string} text - The text to display
 * @param {'success' | 'warning' | 'danger' | 'info'} type - The status type
 * @returns {string} - HTML string
 */
export const StatusBadge = (text, type = 'success') => {
  const typeClasses = {
    success: 'status-success',
    warning: 'status-warning',
    danger: 'status-danger',
    info: 'status-info'
  };

  return `<span class="status-badge ${typeClasses[type] || typeClasses.success}">${text}</span>`;
};
