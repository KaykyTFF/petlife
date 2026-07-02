/**
 * Lógica de renderização da aba de vacinas
 */
import { getVaccines } from '../../services/healthService.js';
import { Logger } from '../../utils/logger.js';
import { safeText, formatDateBR, normalizeStatus } from './pet-utils.js';
import { getTabSkeleton } from './pet-skeletons.js';
import { renderEmptySection } from './pet-empty-states.js';
import { StatusBadge } from '../../../components/status-badge.js';

export const renderVacinas = async (container, petId) => {
  container.innerHTML = getTabSkeleton();
  try {
      const items = await getVaccines(petId);
      Logger.info('Detalhes Pet', 'Vacinas carregadas', items);
      
      container.innerHTML = `
        <div class="card">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 class="card-title">Carteira de Vacinação</h3>
              <p class="text-xs text-slate-500 font-medium mt-1">Histórico de doses e próximos agendamentos.</p>
            </div>
            <button class="btn-primary !text-xs" id="btn-add-vaccine">Registrar Vacina</button>
          </div>
          ${!items || items.length === 0 ? renderEmptySection('Nenhuma vacina cadastrada', 'btn-add-vaccine-empty') : `
            <div class="space-y-3">
              ${items.map(v => {
                const vaccineName = safeText(v.nome, "Vacina sem nome");
                const appliedDate = v.ultima_data;
                const nextDate = v.proxima_data;
                
                const appliedFormatted = formatDateBR(appliedDate);
                const nextFormatted = formatDateBR(nextDate);
                
                let detailsParts = [];
                if (appliedFormatted) detailsParts.push(`Aplicada em: ${appliedFormatted}`);
                if (nextFormatted) detailsParts.push(`Próxima dose: ${nextFormatted}`);
                else detailsParts.push(`Próxima dose não definida`);
                
                const detailsText = detailsParts.join(' · ');
                const clinicOrVet = v.clinica ? `Clínica: ${v.clinica}` : (v.veterinario ? `Veterinário: ${v.veterinario}` : "");
                
                const statusLabel = normalizeStatus(v.status);
                const statusType = v.status === 'concluido' || v.status === 'em_dia' ? 'success' : 
                                  (v.status === 'atrasado' ? 'danger' : 'warning');

                return `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm relative group">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-900">${vaccineName}</p>
                      <p class="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-0.5 leading-relaxed">
                        ${detailsText}${clinicOrVet ? `<br>${clinicOrVet}` : ''}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 mt-4 sm:mt-0">
                    ${StatusBadge(statusLabel, statusType)}
                    <button class="btn-secondary !p-2 btn-edit-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${v.id}" data-type="vaccine" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button class="btn-secondary !p-2 !text-red-600 hover:!bg-red-50 !border-red-100 btn-delete-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${v.id}" data-type="vaccine" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    ${!v.concluido ? `<button class="btn-primary !p-2 btn-mark-item" data-id="${v.id}" data-type="vaccine" title="Marcar como Aplicado">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>` : ''}
                  </div>
                </div>
              `}).join('')}
            </div>
          `}
        </div>
      `;
  } catch (err) {
      container.innerHTML = `<div class="text-center py-10 text-red-500">Erro ao carregar vacinas.</div>`;
  }
};
