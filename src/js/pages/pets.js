import { getPets } from '../services/petService.js';
import { getVaccines, getDeworming, getAppointments } from '../services/healthService.js';
import { Logger } from '../utils/logger.js';
import { PetCard } from '../../components/pet-card.js';
import { EmptyState } from '../../components/empty-state.js';

/**
 * Auxiliar para obter o status de um pet com base em seus eventos
 */
const getPetStatus = (petId, allEvents) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const petEvents = allEvents.filter(e => e.pet === petId);
    
    const overdue = petEvents.find(e => {
        if (!e.date) return false;
        const eventDate = new Date(e.date + 'T12:00:00');
        return eventDate < today && e.status !== 'concluido' && e.status !== 'realizado';
    });
    
    if (overdue) return { text: 'Atrasado', type: 'danger' };
    
    const upcoming = petEvents.find(e => {
        if (!e.date) return false;
        const eventDate = new Date(e.date + 'T12:00:00');
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return eventDate >= today && eventDate <= nextWeek;
    });
    
    if (upcoming) return { text: 'Próximo', type: 'warning' };
    
    return { text: 'Em dia', type: 'success' };
};

/**
 * Inicializa a página "Meus Pets", carregando e renderizando os dados dos pets.
 */
export const initMeusPets = async () => {
    const petsContainer = document.getElementById('pets-content');
    if (!petsContainer) return;

    Logger.info('Meus Pets', 'Carregando listagem de pets...');

    try {
        const [data, vaccines, deworming, appointments] = await Promise.all([
            getPets(),
            getVaccines().catch(() => []),
            getDeworming().catch(() => []),
            getAppointments().catch(() => [])
        ]);

        let pets = [];
        if (Array.isArray(data)) {
            pets = data;
        } else if (data && Array.isArray(data.results)) {
            pets = data.results;
        }

        const allEvents = [
            ...(vaccines || []).map(v => ({ ...v, date: v.proxima_data })),
            ...(deworming || []).map(d => ({ ...d, date: d.proxima_data })),
            ...(appointments || []).map(a => ({ ...a, date: a.data }))
        ];

        if (pets.length > 0) {
            let html = '<div class="section-grid">';
            html += pets.map(pet => {
                const status = getPetStatus(pet.id, allEvents);
                
                // Adapta os dados da API para o formato do PetCard
                const petData = {
                    id: pet.id,
                    name: pet.nome,
                    species: pet.especie,
                    breed: pet.raca || pet.especie,
                    age: pet.idade + ' ' + (pet.idade === 1 ? (pet.unidade_idade === 'meses' ? 'mês' : pet.unidade_idade === 'semanas' ? 'semana' : 'ano') : (pet.unidade_idade || 'anos')),
                    image: pet.foto || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
                    statusText: status.text,
                    statusType: status.type
                };
                return PetCard(petData);
            }).join('');
            
            html += `
                <a href="/pages/adicionar-pet/index.html" class="card flex flex-col items-center justify-center border-dashed hover:border-[var(--color-primary)] hover:bg-gray-50 transition-colors min-h-[220px]">
                  <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 class="text-sm font-semibold text-[var(--color-text)]">Cadastrar pet</h3>
                </a>
              </div>
            `;
            
            petsContainer.innerHTML = `
                <div class="page-header">
                  <div>
                    <h1 class="page-title">Meus Pets</h1>
                    <p class="page-subtitle">Gerencie o histórico e a saúde de todos os seus animais.</p>
                  </div>
                  <a href="/pages/adicionar-pet/index.html" class="btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Novo Pet
                  </a>
                </div>
                ${html}
            `;
        } else {
            petsContainer.innerHTML = EmptyState({
                title: 'Nenhum pet cadastrado',
                description: 'Você ainda não possui pets na sua conta. Vamos cadastrar o primeiro?',
                actionText: 'Cadastrar Pet',
                actionHref: '/pages/adicionar-pet/index.html'
            });
        }
    } catch (err) {
        console.error('Erro inesperado:', err);
        petsContainer.innerHTML = `<div class="text-center py-10 text-red-500 font-bold">Erro ao carregar seus pets. Tente novamente mais tarde.</div>`;
    }
};
