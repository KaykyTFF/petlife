import { getPets } from '../services/petService.js';
import { getVaccines, getDeworming, getAppointments } from '../services/healthService.js';
import { getCurrentUser } from '../services/authService.js';
import { SkeletonDashboard } from '../../components/skeleton.js';
import { Logger } from '../utils/logger.js';
import { renderHeader, renderAttentionPets, renderNextEvents, renderQuickCalendar, renderRecentActivities, renderSummary, renderErrorState } from './dashboard/dashboard-render.js';
import { showActivitiesHistoryModal } from '../modals/modal-activities.js';

/**
 * Auxiliar para obter o status de um pet com base em seus eventos
 */
const getPetStatus = (petId, allEvents) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const petEvents = allEvents.filter(e => e.pet === petId);
    
    const overdue = petEvents.find(e => {
        const eventDate = new Date(e.date + 'T12:00:00');
        return eventDate < today && e.status !== 'concluido' && e.status !== 'realizado';
    });
    
    if (overdue) return { text: 'Atrasado', type: 'danger' };
    
    const upcoming = petEvents.find(e => {
        const eventDate = new Date(e.date + 'T12:00:00');
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return eventDate >= today && eventDate <= nextWeek;
    });
    
    if (upcoming) return { text: 'Próximo', type: 'warning' };
    
    return { text: 'Em dia', type: 'success' };
};

/**
 * Lógica Principal do Dashboard
 */
export const initDashboard = async () => {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    Logger.info('Dashboard', 'Carregando dashboard...', { element: '#dashboard-content' });

    // Mostra o skeleton imediatamente
    container.innerHTML = SkeletonDashboard();

    try {
        // Busca todos os dados em paralelo
        const [user, pets, vaccines, deworming, appointments] = await Promise.all([
            getCurrentUser().catch(() => ({ first_name: 'Usuário' })),
            getPets(),
            getVaccines(),
            getDeworming(),
            getAppointments()
        ]);

        // Adiciona um pequeno atraso para melhores transições de UX (skeleton -> dados reais)
        await new Promise(resolve => setTimeout(resolve, 600));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // Normaliza eventos
        const allEvents = [
            ...(vaccines || []).map(v => ({ ...v, date: v.proxima_data, type: 'vaccine', title: `Vacina: ${v.nome}` })),
            ...(deworming || []).map(d => ({ ...d, date: d.proxima_data, type: 'deworming', title: `Vermífugo: ${d.nome_produto}` })),
            ...(appointments || []).map(a => ({ ...a, date: a.data, type: 'appointment', title: `Consulta: ${a.motivo}` }))
        ];

        // Ordena eventos por data
        const sortedEvents = allEvents
            .filter(e => e.date) // Ensure date exists
            .sort((a, b) => new Date(a.date + 'T12:00:00') - new Date(b.date + 'T12:00:00'));

        // Calcula os resumos
        const overdueEvents = allEvents.filter(e => {
            const eventDate = new Date(e.date + 'T12:00:00');
            return eventDate < today && e.status !== 'concluido' && e.status !== 'realizado';
        });

        const upcomingEvents = allEvents.filter(e => {
            const eventDate = new Date(e.date + 'T12:00:00');
            return eventDate >= today && eventDate <= nextWeek;
        });

        const overdueCount = overdueEvents.length;
        const upcomingCount = upcomingEvents.length;

        // Saudação do Cabeçalho
        const greeting = `Olá, ${user.first_name || user.name || 'Usuário'}`;
        const summaryText = `Você tem ${upcomingCount} cuidado${upcomingCount !== 1 ? 's' : ''} próximo${upcomingCount !== 1 ? 's' : ''} e ${overdueCount} pendência${overdueCount !== 1 ? 's' : ''} atrasada${overdueCount !== 1 ? 's' : ''}!`;

        // Seção 1: Atenção Necessária (Pets com status atrasado ou próximo)
        const petsWithStatus = (pets || []).map(pet => {
            const status = getPetStatus(pet.id, allEvents);
            return { ...pet, statusText: status.text, statusType: status.type };
        });

        const attentionPets = petsWithStatus
            .filter(p => p.statusType === 'danger' || p.statusType === 'warning')
            .slice(0, 2);

        // Se nenhum pet precisa de atenção, apenas mostra os dois primeiros pets
        const displayPets = attentionPets.length > 0 ? attentionPets : petsWithStatus.slice(0, 2);

        // Seção 2: Próximos Cuidados (Próximos 3 eventos)
        const nextEvents = sortedEvents
            .filter(e => new Date(e.date + 'T12:00:00') >= today)
            .slice(0, 3);

        // Seção 2 Direita: Calendário Rápido (Eventos do mês atual)
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const monthEvents = sortedEvents.filter(e => {
            const d = new Date(e.date + 'T12:00:00');
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && d >= today;
        }).slice(0, 2);

        // Seção 3: Atividades Recentes (Eventos concluídos/passados + Atualizações de pets)
        const eventActivities = allEvents
            .filter(e => {
                const d = new Date(e.date + 'T12:00:00');
                return d < today || e.status === 'concluido' || e.status === 'realizado';
            })
            .map(e => ({
                date: e.date,
                hora: e.hora || '12:00',
                type: e.type,
                title: e.title,
                pet_data: e.pet_data || pets?.find(p => p.id === e.pet),
                status: e.status || 'Realizado',
                real_date: new Date(e.date + 'T' + (e.hora ? e.hora.substring(0, 5) : '12:00') + ':00')
            }));

        const petActivities = (pets || []).flatMap(p => {
            const acts = [];
            if (p.created_at) {
                const dt = new Date(p.created_at);
                acts.push({
                    date: p.created_at.split('T')[0],
                    hora: dt.toTimeString().substring(0,5),
                    type: 'pet_added',
                    title: 'Pet Adicionado',
                    pet_data: p,
                    status: 'Sucesso',
                    real_date: dt
                });
            }
            if (p.updated_at && p.created_at) {
                const cDt = new Date(p.created_at);
                const uDt = new Date(p.updated_at);
                // Se a atualização ocorreu depois da criação (com margem de 1 min)
                if (uDt - cDt > 60000) {
                    acts.push({
                        date: p.updated_at.split('T')[0],
                        hora: uDt.toTimeString().substring(0,5),
                        type: 'pet_updated',
                        title: 'Perfil Atualizado',
                        pet_data: p,
                        status: 'Alterado',
                        real_date: uDt
                    });
                }
            }
            return acts;
        });

        const healthAddedActivities = allEvents.flatMap(e => {
            const acts = [];
            if (e.created_at) {
                const dt = new Date(e.created_at);
                
                let title = 'Registro Adicionado';
                let type = 'health_added';
                if (e.type === 'vaccine') { title = 'Vacina Agendada'; type = 'vaccine_added'; }
                if (e.type === 'deworming') { title = 'Vermífugo Agendado'; type = 'deworming_added'; }
                if (e.type === 'appointment') { title = 'Consulta Marcada'; type = 'appointment_added'; }

                acts.push({
                    date: e.created_at.split('T')[0],
                    hora: dt.toTimeString().substring(0,5),
                    type: type,
                    title: title,
                    pet_data: e.pet_data || pets?.find(p => p.id === e.pet),
                    status: 'Novo',
                    real_date: dt
                });
            }
            return acts;
        });

        const allActivities = [...eventActivities, ...petActivities, ...healthAddedActivities]
            .sort((a, b) => b.real_date - a.real_date);
            
        const recentActivities = allActivities.slice(0, 4);

        // Renderiza o HTML
        container.innerHTML = `
            ${renderHeader(greeting, summaryText)}
            ${renderAttentionPets(displayPets)}
            
            <div class="mb-10 animate-fade-in">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    ${renderNextEvents(nextEvents, today)}
                </div>
                <div>
                    ${renderQuickCalendar(monthEvents)}
                </div>
              </div>
            </div>

            <div class="mb-10 animate-fade-in">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    ${renderRecentActivities(recentActivities, today)}
                </div>
                <div>
                    ${renderSummary(allEvents, petsWithStatus, today, nextWeek, overdueCount)}
                </div>
              </div>
            </div>
        `;

        const btnViewAll = document.getElementById('btn-view-all-activities');
        if (btnViewAll) {
            btnViewAll.addEventListener('click', () => {
                showActivitiesHistoryModal(allActivities, today);
            });
        }

    } catch (err) {
        console.error('Failed to load dashboard:', err);
        container.innerHTML = renderErrorState();
    }
};
