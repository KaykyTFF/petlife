/**
 * Módulo responsável pela renderização da aba de Medicamentos
 * Gerencia a listagem, categorização (em uso / concluídos) e exibição dos cards
 */
import { getMedicamentos, updateMedicamento } from '../../services/healthService.js';
import { Logger } from '../../utils/logger.js';
import { safeText, formatDateBR } from './pet-utils.js';
import { getTabSkeleton } from './pet-skeletons.js';
import { renderEmptySection } from './pet-empty-states.js';
import { StatusBadge } from '../../../components/status-badge.js';

/**
 * Função principal para renderizar a aba de medicamentos no DOM
 * @param {HTMLElement} container - O elemento HTML onde a aba será renderizada
 * @param {number|string} petId - O ID do pet atual
 */
export const renderMedicamentos = async (container, petId) => {
  // Exibe um skeleton loading enquanto os dados são buscados na API
  container.innerHTML = getTabSkeleton();
  try {
      // Busca a lista de medicamentos do pet via API
      const items = await getMedicamentos(petId);
      Logger.info('Detalhes Pet', 'Medicamentos carregados', items);
      
      // HTML gerado caso a lista de medicamentos esteja vazia
      const emptyHtml = renderEmptySection('Nenhum medicamento registrado', 'btn-add-medicamento-empty');
      
      // Filtra os medicamentos ativos (em uso, agendados ou atrasados)
      const emUso = items ? items.filter(m => m.status === 'em_uso' || m.status === 'agendado' || m.status === 'finalizado_atrasado') : [];
      // Filtra os medicamentos que já tiveram o tratamento concluído
      const concluidos = items ? items.filter(m => m.status === 'concluido') : [];

      /**
       * Sub-função para renderizar o HTML de um único card de medicamento
       * @param {Object} m - Objeto contendo os dados do medicamento
       * @returns {string} - HTML em string do card
       */
      const renderMedicamentoCard = (m) => {
        // Define o texto e a cor do badge de status com base no status da API
        let statusLabel = m.status;
        let statusType = 'info';
        
        if (m.status === 'em_uso') { statusLabel = 'Em uso'; statusType = 'warning'; }
        else if (m.status === 'agendado') { statusLabel = 'Agendado'; statusType = 'info'; }
        else if (m.status === 'finalizado_atrasado') { statusLabel = 'Atrasado'; statusType = 'danger'; }
        else if (m.status === 'concluido') { statusLabel = 'Concluído'; statusType = 'success'; }

        return `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1.5">
                <h4 class="font-bold text-slate-800 text-base">${safeText(m.nome)}</h4>
                ${StatusBadge(statusLabel, statusType)}
                ${m.lembrete_ativo ? `<span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1" title="Lembrete Ativo"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg></span>` : ''}
              </div>
              <p class="text-sm text-slate-500 mb-2">
                ${m.dosagem ? `<strong>Dosagem:</strong> ${safeText(m.dosagem)}` : ''}
                ${m.frequencia ? ` · <strong>Frequência:</strong> ${safeText(m.frequencia)}` : ''}
              </p>
              <div class="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium">
                <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Início: ${formatDateBR(m.data_inicio)}
                </div>
                <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Fim: ${m.data_fim ? formatDateBR(m.data_fim) : 'Uso contínuo'}
                </div>
              </div>
              ${m.observacoes ? `<p class="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">${safeText(m.observacoes)}</p>` : ''}
            </div>
            
            <div class="flex items-center gap-2 sm:flex-col sm:items-end">
              ${m.status !== 'concluido' ? `
                <button class="btn-primary !p-2 !px-3 text-xs btn-mark-item whitespace-nowrap" data-id="${m.id}" data-type="medication">
                  Concluir
                </button>
              ` : ''}
              <div class="flex items-center gap-2 mt-auto">
                <button class="btn-secondary !p-2 btn-edit-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${m.id}" data-type="medication" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button class="btn-secondary !p-2 !text-red-600 hover:!bg-red-50 !border-red-100 btn-delete-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${m.id}" data-type="medication" title="Excluir">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      };

      container.innerHTML = `
        <div class="card">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 class="card-title">Medicamentos</h3>
              <p class="text-xs text-slate-500 font-medium mt-1">Controle de tratamentos e medicamentos contínuos.</p>
            </div>
            <button class="btn-primary !text-xs" id="btn-add-medicamento">Registrar Medicamento</button>
          </div>
        
          <div class="space-y-8">
            ${(!items || items.length === 0) ? emptyHtml : ''}

          ${emUso.length > 0 ? `
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span> Em Uso
              </h4>
              <div class="space-y-3">
                ${emUso.map(renderMedicamentoCard).join('')}
              </div>
            </div>
          ` : ''}

          ${concluidos.length > 0 ? `
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-slate-300"></span> Histórico
              </h4>
              <div class="space-y-3">
                ${concluidos.map(renderMedicamentoCard).join('')}
              </div>
            </div>
          ` : ''}
          </div>
        </div>
      `;
  } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="text-center py-10 text-red-500">Erro ao carregar medicamentos.</div>`;
  }
};
