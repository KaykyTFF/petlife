import { ModalManager } from './modalManager.js';

/**
 * Abre o modal que exibe o histórico completo de atividades do usuário.
 * @param {Array} allActivities - Lista com todas as atividades ordenadas.
 * @param {Date} today - Data atual para cálculo de "Hoje" ou "Ontem".
 */
export const showActivitiesHistoryModal = (allActivities, today) => {
    
    /**
     * Renderiza o ícone apropriado com base no tipo da atividade.
     * @param {string} type - O tipo da atividade (ex: 'vaccine', 'pet_added').
     * @returns {string} HTML contendo o ícone estilizado.
     */
    const renderActivityIcon = (type) => {
        let iconBg = 'bg-slate-50 border border-slate-100';
        let iconText = 'text-[var(--color-primary)]';
        let iconPath = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';

        if (type === 'vaccine') {
            iconPath = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
        } else if (type === 'deworming') {
            iconPath = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
        } else if (type === 'pet_added') {
            iconPath = 'M12 4v16m8-8H4'; // Plus icon
        } else if (type === 'pet_updated') {
            iconPath = 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'; // Refresh icon
        } else if (type === 'vaccine_added' || type === 'deworming_added' || type === 'appointment_added') {
            // Eventos de saúde agendados ou adicionados (ícone de calendário amarelo)
            iconPath = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'; // Calendar icon
        }

        return `
            <div class="activity-icon ${iconBg} ${iconText}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}" />
                </svg>
            </div>
        `;
    };

    let content = `
        <div class="max-h-[70vh] overflow-y-auto no-scrollbar pb-4 space-y-1 -mx-4 px-2">
    `;

    // Verifica se existem atividades registradas
    if (allActivities.length > 0) {
        content += allActivities.map(e => {
            // Força a hora para meio-dia para evitar problemas de fuso horário ao calcular a diferença de dias
            const d = new Date(e.date + 'T12:00:00');
            const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
            
            // Formata a data ou exibe "Hoje" / "Ontem"
            let dayLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            if (diff === 0) dayLabel = 'Hoje';
            else if (diff === 1) dayLabel = 'Ontem';

            return `
                <div class="activity-item rounded-lg px-2 py-3 hover:bg-slate-50 transition-colors border-b border-transparent hover:border-slate-100">
                    ${renderActivityIcon(e.type)}
                    <div class="flex-1 min-w-0 pl-1">
                        <p class="text-sm font-bold text-slate-800">${e.title}</p>
                        <p class="text-[12px] text-slate-500 font-medium mt-0.5">${e.pet_data?.nome || 'Pet'} • ${e.status || 'Realizado'}</p>
                    </div>
                    <div class="text-right flex flex-col items-end pl-2">
                        <span class="text-[10px] font-bold text-slate-400">${dayLabel}</span>
                        <span class="text-[10px] text-slate-300">${e.hora || '00:00'}</span>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Estado vazio (empty state) caso não haja nenhuma atividade no histórico
        content += `<div class="p-8 text-center text-sm text-slate-400 font-medium">Nenhuma atividade registrada ainda.</div>`;
    }

    // Botão de fechar e estrutura final do modal
    content += `
        </div>
        <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button type="button" class="btn-primary w-full" onclick="document.getElementById('modal-activities-history').remove()">Fechar</button>
        </div>
    `;

    // Abre o modal utilizando o gerenciador global
    ModalManager.open('modal-activities-history', 'Histórico Completo de Atividades', content);
};
