import { StatusBadge } from './status-badge.js';

/**
 * Pet Card Component (Clean SaaS Style)
 * @param {Object} pet - Pet data
 * @returns {string} - HTML string
 */
export const PetCard = (pet) => {
  return `
    <a href="/pages/detalhes-pet/index.html?id=${pet.id || ''}" class="card group hover:border-[var(--color-primary)] flex flex-col">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
          <img src="${pet.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop'}" alt="${pet.name}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="card-title truncate group-hover:text-[var(--color-primary)] transition-colors text-sm">${pet.name}</h3>
          <p class="text-xs text-slate-500 font-medium truncate">${pet.breed || pet.species}</p>
        </div>
      </div>
      
      <div class="mt-auto space-y-2.5 pt-4 border-t border-slate-50">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Idade</span>
          <span class="text-xs font-bold text-slate-700">${pet.age || 'N/A'}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
          ${StatusBadge(pet.statusText || 'Em dia', pet.statusType || 'success')}
        </div>
      </div>
    </a>
  `;
};
