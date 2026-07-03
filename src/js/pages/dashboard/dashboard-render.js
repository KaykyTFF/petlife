import { PetCard } from '../../../components/pet-card.js';
import { StatusBadge } from '../../../components/status-badge.js';
import { getMediaUrl } from '../../services/apiClient.js';

/**
 * Renderiza o cabeçalho do dashboard.
 * @param {string} greeting - A saudação (ex: "Bom dia").
 * @param {string} summaryText - O texto de resumo.
 * @returns {string} O HTML do cabeçalho.
 */
export const renderHeader = (greeting, summaryText) => `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="flex items-center gap-3 text-3xl md:text-4xl font-black text-[var(--color-primary)] mb-1 tracking-tight">
          <img src="/assets/logos/pata.svg" alt="Logo Pata" width="36" height="36" class="object-contain" />
          ${greeting}
        </h1>
        <p class="page-subtitle">${summaryText}</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/pages/adicionar-pet/index.html" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Pet
        </a>
      </div>
    </div>
`;

/**
 * Renderiza a seção de pets que precisam de atenção.
 * @param {Array} displayPets - Lista de pets formatada para exibição.
 * @returns {string} O HTML da seção de atenção.
 */
export const renderAttentionPets = (displayPets) => `
    <section class="mb-10 animate-fade-in">
      <div class="flex items-center justify-between mb-5">
        <h2 class="section-title mb-0">Atenção Necessária</h2>
        <a href="/pages/meus-pets/index.html" class="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1.5 uppercase tracking-wider">
          Ver todos
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        ${displayPets.length > 0 ? displayPets.map(p => PetCard({
            id: p.id,
            name: p.nome,
            species: p.especie,
            breed: p.raca,
            age: p.idade + ' ' + (p.idade === 1 ? (p.unidade_idade === 'meses' ? 'mês' : p.unidade_idade === 'semanas' ? 'semana' : 'ano') : (p.unidade_idade || 'anos')),
            image: getMediaUrl(p.foto),
            statusText: p.statusText,
            statusType: p.statusType
        })).join('') : '<p class="text-sm text-slate-500 font-medium col-span-2">Nenhum pet cadastrado.</p>'}
      </div>
    </section>
`;

/**
 * Renderiza a lista de próximos cuidados/eventos.
 * @param {Array} nextEvents - A lista dos próximos eventos.
 * @param {Date} today - A data de hoje.
 * @returns {string} O HTML da seção de próximos eventos.
 */
export const renderNextEvents = (nextEvents, today) => `
    <section class="card overflow-hidden h-full flex flex-col">
      <div class="card-header-blue flex items-center justify-between">
        <h3 class="card-title">Próximos Cuidados</h3>
        <span class="text-[10px] font-bold text-white/80 uppercase tracking-widest">Próximos 30 dias</span>
      </div>
      <div class="divide-y divide-slate-100 flex-1 -mx-6 -mb-6">
          ${nextEvents.length > 0 ? nextEvents.map(e => {
              const d = new Date(e.date + 'T12:00:00');
              const isToday = d.toDateString() === today.toDateString();
              const isOverdue = d < today;
              
              let markerClass = '';
              let label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
              if (isToday) { label = 'Hoje'; }
              else if (isOverdue) { label = 'Atrasado'; }

              const petName = e.pet_data?.nome || 'Pet';
              const extra = e.type === 'appointment' ? (e.clinica || 'Clínica') : '';

              return `
                  <a href="/pages/detalhes-pet/index.html?id=${e.pet}" class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer outline-none focus:bg-slate-50">
                    <div class="care-date-marker ${markerClass}">
                      <span class="care-date-label">${label}</span>
                      <span class="care-date-day">${isOverdue ? '--' : d.getDate()}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <p class="text-sm font-bold text-slate-800">${e.title}</p>
                        ${StatusBadge(e.status || 'Pendente', isOverdue ? 'danger' : (isToday ? 'info' : 'warning'))}
                      </div>
                      <p class="text-xs text-slate-500 font-medium">${petName} ${extra ? '• ' + extra : ''}</p>
                    </div>
                    <div class="flex items-center text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
              `;
          }).join('') : '<div class="p-10 text-center"><p class="text-sm text-slate-500 font-medium">Nenhum cuidado agendado para os próximos dias.</p></div>'}
      </div>
    </section>
`;

/**
 * Renderiza o calendário rápido com os eventos do mês.
 * @param {Array} monthEvents - Lista de eventos do mês atual.
 * @returns {string} O HTML do calendário rápido.
 */
export const renderQuickCalendar = (monthEvents) => `
    <section class="card overflow-hidden h-full flex flex-col">
      <div class="card-header-blue flex items-center justify-between">
        <h3 class="card-title">Calendário Rápido</h3>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="space-y-5 flex-1">
        ${monthEvents.length > 0 ? monthEvents.map(e => {
            const d = new Date(e.date + 'T12:00:00');
            const colorClass = 'bg-[var(--color-primary)]';
            const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const timeStr = e.hora ? e.hora.substring(0, 5) : '08:00';

            return `
              <div class="flex gap-4 items-start relative pl-4">
                  <div class="absolute left-0 top-0 bottom-0 w-1 ${colorClass} rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-[13px] font-bold text-slate-800">${e.title}</p>
                    <p class="text-[11px] text-slate-500 font-medium mt-1">${e.pet_data?.nome || 'Pet'} • ${dateStr}, ${timeStr}</p>
                  </div>
              </div>
            `;
        }).join('') : '<p class="text-[11px] text-slate-400 font-medium">Nenhum evento este mês.</p>'}
        
        <div class="pt-5 mt-4 border-t border-slate-100">
          <a href="/pages/calendario/index.html" class="block text-center text-[11px] font-bold text-[var(--color-primary)] hover:bg-slate-50 border border-slate-100 py-3 rounded-xl transition-all uppercase tracking-widest">Ver agenda completa</a>
        </div>
      </div>
    </section>
`;

/**
 * Renderiza as atividades recentes.
 * @param {Array} recentActivities - A lista de atividades recentes.
 * @param {Date} today - A data de hoje.
 * @returns {string} O HTML das atividades recentes.
 */
export const renderRecentActivities = (recentActivities, today) => `
    <section class="card overflow-hidden h-full flex flex-col">
      <div class="card-header-blue flex items-center justify-between">
        <h3 class="card-title">Atividades Recentes</h3>
        <button id="btn-view-all-activities" class="text-[10px] font-bold text-white/80 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
          Histórico
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div class="space-y-1 flex-1 -mx-2">
          ${recentActivities.length > 0 ? recentActivities.map(e => {
              const d = new Date(e.date + 'T12:00:00');
              const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
              let dayLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
              if (diff === 0) dayLabel = 'Hoje';
              else if (diff === 1) dayLabel = 'Ontem';

               let iconBg = 'bg-slate-50 border border-slate-100';
               let iconText = 'text-[var(--color-primary)]';
               let iconPath = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';

               if (e.type === 'vaccine') {
                   iconPath = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
               } else if (e.type === 'deworming') {
                   iconPath = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
               } else if (e.type === 'pet_added') {
                   iconPath = 'M12 4v16m8-8H4'; // Plus icon
               } else if (e.type === 'pet_updated') {
                   iconPath = 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'; // Refresh icon
               } else if (e.type === 'vaccine_added' || e.type === 'deworming_added' || e.type === 'appointment_added') {
                   iconPath = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'; // Calendar icon
               }

              return `
                  <div class="activity-item">
                    <div class="activity-icon ${iconBg} ${iconText}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-800">${e.title}</p>
                      <p class="text-[12px] text-slate-500 font-medium mt-0.5">${e.pet_data?.nome || 'Pet'} • ${e.status || 'Realizado'}</p>
                    </div>
                    <div class="text-right flex flex-col items-end">
                      <span class="text-[10px] font-bold text-slate-400">${dayLabel}</span>
                      <span class="text-[10px] text-slate-300">${e.hora || '00:00'}</span>
                    </div>
                  </div>
              `;
          }).join('') : '<div class="p-8 text-center text-sm text-slate-400 font-medium">Nenhuma atividade recente.</div>'}
      </div>
    </section>
`;

/**
 * Renderiza o painel de resumo da semana.
 * @param {Array} allEvents - Todos os eventos do calendário.
 * @param {Array} petsWithStatus - A lista de pets com seus status calculados.
 * @param {Date} today - A data de hoje.
 * @param {Date} nextWeek - A data da próxima semana.
 * @param {number} overdueCount - A quantidade de eventos atrasados.
 * @returns {string} O HTML do resumo.
 */
export const renderSummary = (allEvents, petsWithStatus, today, nextWeek, overdueCount) => `
    <section class="card h-full overflow-hidden">
      <div class="card-header-blue">
        <h3 class="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Resumo da Semana
        </h3>
      </div>
      <div class="space-y-7">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
            </div>
            <span class="text-sm font-semibold text-slate-600">Vacinas próximas</span>
          </div>
          <span class="text-sm font-black text-slate-800">${allEvents.filter(e => e.type === 'vaccine' && new Date(e.date + 'T12:00:00') >= today && new Date(e.date + 'T12:00:00') <= nextWeek).length}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
            </div>
            <span class="text-sm font-semibold text-slate-600">Consultas pendentes</span>
          </div>
          <span class="text-sm font-black text-slate-800">${allEvents.filter(e => e.type === 'appointment' && new Date(e.date + 'T12:00:00') < today && e.status !== 'realizado').length}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
            </div>
            <span class="text-sm font-semibold text-slate-600">Pets em dia</span>
          </div>
          <span class="text-sm font-black text-slate-800">${petsWithStatus.filter(p => p.statusType === 'success').length}</span>
        </div>
      </div>
      <div class="mt-10 pt-6 border-t border-slate-50">
        <p class="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">
          ${overdueCount === 0 ? 'Tudo sob controle!' : 'Existem pendências atrasadas.'}
        </p>
      </div>
    </section>
`;

/**
 * Renderiza a tela de erro do dashboard.
 * @returns {string} O HTML do estado de erro.
 */
export const renderErrorState = () => `
    <div class="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <p class="text-slate-800 font-black uppercase tracking-widest text-sm">Erro ao carregar Dashboard</p>
        <p class="text-slate-500 text-xs mt-1">Verifique sua conexão e tente novamente.</p>
        <button onclick="window.location.reload()" class="btn-primary mt-6 px-8">Recarregar</button>
    </div>
`;
