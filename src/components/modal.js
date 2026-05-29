/**
 * Modal Component
 * @param {Object} options
 * @param {string} options.id - Modal unique ID
 * @param {string} options.title - Modal title
 * @param {string} options.content - Modal content HTML
 * @param {string} [options.actionText] - Action button text
 * @returns {string} - HTML string
 */
export const Modal = ({ id, title, content, actionText }) => {
  return `
    <div id="${id}" class="fixed inset-0 z-[100] hidden items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="document.getElementById('${id}').classList.add('hidden'); document.getElementById('${id}').classList.remove('flex');"></div>
      
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all">
        <div class="p-6 border-b border-[var(--color-input-border)] flex items-center justify-between">
          <h3 class="text-xl font-extrabold text-[var(--color-text)]">${title}</h3>
          <button onclick="document.getElementById('${id}').classList.add('hidden'); document.getElementById('${id}').classList.remove('flex');" class="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-8">
          ${content}
        </div>
        
        ${actionText ? `
          <div class="p-6 bg-[var(--color-background)] flex justify-end gap-3">
            <button onclick="document.getElementById('${id}').classList.add('hidden'); document.getElementById('${id}').classList.remove('flex');" class="btn-secondary">Cancelar</button>
            <button class="btn-primary">${actionText}</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};
