/**
 * Lógica de renderização da aba de histórico
 */
import { getHealthHistory } from '../../services/healthService.js';
import { getTabSkeleton } from './pet-skeletons.js';
import { renderEmptySection } from './pet-empty-states.js';
import { StatusBadge } from '../../../components/status-badge.js';

export const renderHistorico = async (container, petId) => {
  container.innerHTML = getTabSkeleton();
  try {
      const items = await getHealthHistory(petId);
      container.innerHTML = `
        <div class="card">
          <div class="mb-8">
            <h3 class="card-title">Histórico de Saúde</h3>
            <p class="text-xs text-slate-500 font-medium mt-1">Linha do tempo completa de eventos e cuidados.</p>
          </div>
          ${!items || items.length === 0 ? renderEmptySection('Nenhum evento registrado no histórico') : `
            <div class="space-y-6 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-100 ml-2">
              ${items.map(h => `
                <div class="relative pl-8">
                  <div class="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">${h.data}</span>
                    <p class="text-sm font-bold text-slate-800">${h.descricao || h.description}</p>
                    <div class="mt-2">
                      ${StatusBadge(h.status === 'success' ? 'Concluído' : 'Registro', h.status === 'success' ? 'success' : 'info')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
  } catch (err) {
      container.innerHTML = `<div class="text-center py-10 text-red-500">Erro ao carregar histórico.</div>`;
  }
};
