/**
 * Lógica de renderização da aba de consultas
 */
import { getAppointments } from '../../services/healthService.js';
import { Logger } from '../../utils/logger.js';
import { safeText, formatDateTimeBR, normalizeStatus } from './pet-utils.js';
import { getTabSkeleton } from './pet-skeletons.js';
import { renderEmptySection } from './pet-empty-states.js';
import { StatusBadge } from '../../../components/status-badge.js';

export const renderConsultas = async (container, petId) => {
  container.innerHTML = getTabSkeleton();
  try {
      const items = await getAppointments(petId);
      Logger.info('Detalhes Pet', 'Consultas carregadas', items);
      
      container.innerHTML = `
        <div class="card">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 class="card-title">Histórico de Consultas</h3>
              <p class="text-xs text-slate-500 font-medium mt-1">Gerencie consultas médicas e veterinárias.</p>
            </div>
            <button class="btn-primary !text-xs" id="btn-add-appointment">Agendar Consulta</button>
          </div>
          ${!items || items.length === 0 ? renderEmptySection('Nenhuma consulta agendada para o pet', 'btn-add-appointment-empty', 'Agendar Consulta') : `
            <div class="space-y-3">
              ${items.map(a => {
                const reason = safeText(a.motivo, "Consulta sem motivo informado");
                const dateTime = formatDateTimeBR(a.data, a.hora);
                const clinicOrVet = a.clinica ? `Clínica: ${a.clinica}` : (a.veterinario ? `Veterinário: ${a.veterinario}` : "");
                
                const statusLabel = normalizeStatus(a.computed_status || a.status);
                const statusType = (a.computed_status || a.status) === 'concluido' ? 'success' : 
                                  ((a.computed_status || a.status) === 'atrasado' ? 'danger' : 'info');

                return `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm relative group">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-primary border border-slate-100 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-900">${reason}</p>
                      <p class="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-0.5 leading-relaxed">
                        ${dateTime}${clinicOrVet ? ` · ${clinicOrVet}` : ''}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 mt-4 sm:mt-0">
                    ${StatusBadge(statusLabel, statusType)}
                    <button class="btn-secondary !p-2 btn-edit-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${a.id}" data-type="appointment" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button class="btn-secondary !p-2 !text-red-600 hover:!bg-red-50 !border-red-100 btn-delete-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${a.id}" data-type="appointment" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    ${a.status !== 'concluido' && a.status !== 'cancelado' ? `<button class="btn-primary !p-2 btn-mark-item" data-id="${a.id}" data-type="appointment" title="Marcar como Realizada">
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
      container.innerHTML = `<div class="text-center py-10 text-red-500">Erro ao carregar consultas.</div>`;
  }
};
