/**
 * Lógica de renderização da aba de vermífugos
 */
import { getDeworming } from '../../services/healthService.js';
import { Logger } from '../../utils/logger.js';
import { safeText, formatDateBR, normalizeStatus } from './pet-utils.js';
import { getTabSkeleton } from './pet-skeletons.js';
import { renderEmptySection } from './pet-empty-states.js';
import { StatusBadge } from '../../../components/status-badge.js';

const calculateDewormingStatus = (nextDateStr, completed) => {
  if (completed) return { text: 'Concluído', type: 'success' };
  if (!nextDateStr) return { text: 'Sem data', type: 'info' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDate = new Date(nextDateStr + 'T12:00:00');
  
  const diffTime = nextDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: 'Vencido', type: 'danger' };
  if (diffDays <= 7) return { text: 'Próximo', type: 'warning' };
  return { text: 'Em dia', type: 'success' };
};

export const renderVermifugo = async (container, petId) => {
  container.innerHTML = getTabSkeleton();
  try {
      const items = await getDeworming(petId);
      Logger.info('Detalhes Pet', 'Vermífugos carregados', items);
      
      container.innerHTML = `
        <div class="card">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 class="card-title">Controle de Vermífugo</h3>
              <p class="text-xs text-slate-500 font-medium mt-1">Acompanhe a frequência de desparasitação.</p>
            </div>
            <button class="btn-primary !text-xs" id="btn-add-deworming">Registrar Dose</button>
          </div>
          ${!items || items.length === 0 ? renderEmptySection('Nenhum registro de vermífugo encontrado', 'btn-add-deworming-empty', 'Adicionar Vermífugo') : `
            <div class="space-y-3">
              ${items.map(v => {
                const productName = safeText(v.nome_produto || v.nome_produto, "Vermífugo sem nome");
                const nextDateFormatted = formatDateBR(v.proxima_data);
                const dosageText = v.dosagem ? `Dosagem: ${v.dosagem} · ` : '';
                const nextDateText = nextDateFormatted ? `Próxima aplicação: ${nextDateFormatted}` : 'Próxima aplicação não definida';
                const frequencyText = v.frequencia ? `<br>Frequência: ${v.frequencia}` : '';
                const status = calculateDewormingStatus(v.proxima_data, v.concluido);

                return `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm relative group">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-900">${productName}</p>
                      <p class="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-0.5 leading-relaxed">
                        ${dosageText}${nextDateText}${frequencyText}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 mt-4 sm:mt-0">
                    ${StatusBadge(status.text, status.type)}
                    <button class="btn-secondary !p-2 btn-edit-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${v.id}" data-type="deworming" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button class="btn-secondary !p-2 !text-red-600 hover:!bg-red-50 !border-red-100 btn-delete-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${v.id}" data-type="deworming" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    ${!v.concluido ? `<button class="btn-primary !p-2 btn-mark-item" data-id="${v.id}" data-type="deworming" title="Marcar como Aplicado">
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
      container.innerHTML = `<div class="text-center py-10 text-red-500">Erro ao carregar vermífugos.</div>`;
  }
};
