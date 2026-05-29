import { StatusBadge } from './status-badge.js';

/**
 * Pet Card Component (Clean SaaS Style)
 * @param {Object} pet - Pet data
 * @returns {string} - HTML string
 */
export const PetCard = (pet) => {
  return `
    <a href="/pages/detalhes-pet/index.html?id=${pet.id || ''}" class="card group hover:border-[var(--color-primary)] hover:shadow-md transition-all flex flex-col">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img src="${pet.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop'}" alt="${pet.name}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="card-title truncate group-hover:text-[var(--color-primary)] transition-colors">${pet.name}</h3>
          <p class="card-description truncate">${pet.breed || pet.species}</p>
        </div>
      </div>
      
      <div class="mt-auto space-y-3 pt-4 border-t border-[var(--color-input-border)]">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-[var(--color-text-muted)]">Idade</span>
          <span class="text-sm font-medium text-[var(--color-text)]">${pet.age || 'N/A'}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-[var(--color-text-muted)]">Status</span>
          ${StatusBadge(pet.statusText || 'Em dia', pet.statusType || 'success')}
        </div>
      </div>
    </a>
  `;
};
