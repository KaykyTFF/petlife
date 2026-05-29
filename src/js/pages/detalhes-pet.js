/**
 * Pet Details Page Logic - Standardized Design System Compliance
 */
import { getPetById, getVaccines, getDeworming, getAppointments, getHistory, saveVaccine, saveDeworming, saveAppointment, deleteVaccine, deleteDeworming, deleteAppointment, addHistory, deletePet, savePet } from '../storage.js';
import { StatusBadge } from '../../components/status-badge.js';
import { Toast } from '../../components/toast.js';
import { Modal } from '../../components/modal.js';

/**
 * Generates the standardized HTML for the pet details page
 * @returns {string} HTML string
 */
export const getPetDetailsHTML = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('id');
  
  if (!petId) {
    window.location.href = '/pages/meus-pets/index.html';
    return '';
  }

  const pet = getPetById(petId);
  if (!pet) {
    return `
      <div class="empty-state">
        <div class="w-16 h-16 bg-[#F4F7F8] text-[#64748B] rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-[#0F172A]">Pet não encontrado</h2>
        <p class="text-[#64748B] mt-2 mb-6">Não conseguimos localizar as informações deste pet.</p>
        <a href="/pages/meus-pets/index.html" class="btn-primary">Voltar para Meus Pets</a>
      </div>
    `;
  }

  return `
    <div class="flex flex-col lg:flex-row gap-8" id="pet-details-wrapper">
      
      <!-- Pet Info Sidebar -->
      <div class="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div class="card text-center p-8">
          <div class="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-sm mb-4 bg-[#F4F7F8]">
            <img src="${pet.image}" class="w-full h-full object-cover">
          </div>
          <h2 class="text-xl font-bold text-[#0F172A]">${pet.name}</h2>
          <p class="text-sm text-[#64748B] mt-1 font-medium">${pet.breed || pet.species} • ${pet.age}</p>
          
          <div class="mt-4 flex justify-center">
            ${StatusBadge(pet.statusText, pet.statusType)}
          </div>

          <div class="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-[#E5E7EB]">
            <button class="btn-primary !px-4 !py-2 !text-xs" id="btn-edit-pet">Editar</button>
            <button class="btn-secondary !text-[#DC2626] !px-4 !py-2 !text-xs" id="btn-delete-pet">Excluir</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header border-b border-[#E5E7EB] pb-4 mb-4">
            <h3 class="card-title text-sm">Informações Gerais</h3>
          </div>
          <div class="space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-[#64748B] font-medium">Peso</span>
              <span class="text-[#0F172A] font-bold">${pet.weight}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-[#64748B] font-medium">Sexo</span>
              <span class="text-[#0F172A] font-bold">${pet.sex}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-[#64748B] font-medium">Castrado</span>
              <span class="text-[#0F172A] font-bold">Sim</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-[#64748B] font-medium">Próximo Cuidado</span>
              <span class="text-[#0F172A] font-bold">12 Jun</span>
            </div>
          </div>
          <button class="w-full btn-secondary mt-6 !text-xs" onclick="window.location.href='/pages/meus-pets/index.html'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para lista
          </button>
        </div>
      </div>

      <!-- Pet Content Area -->
      <div class="flex-1 space-y-6">
        <div class="border-b border-[#E5E7EB]">
          <nav class="flex gap-8 overflow-x-auto no-scrollbar">
            <button class="tab-btn active" data-tab="resumo">Resumo</button>
            <button class="tab-btn" data-tab="vacinas">Vacinas</button>
            <button class="tab-btn" data-tab="vermifugo">Vermífugo</button>
            <button class="tab-btn" data-tab="consultas">Consultas</button>
            <button class="tab-btn" data-tab="historico">Histórico</button>
          </nav>
        </div>

        <div id="tab-content" class="min-h-[400px]">
          <!-- Content Injected -->
        </div>
      </div>

    </div>
  `;
};

/**
 * Initializes events and default tab content
 */
export const initPetDetailsEvents = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('id');
  const pet = getPetById(petId);
  if (!pet) return;

  initModalContainer();

  // Initialize tabs
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTabContent(tab.dataset.tab, pet.id);
    });
  });

  // Default tab
  renderTabContent('resumo', pet.id);

  // Global actions
  document.getElementById('btn-delete-pet')?.addEventListener('click', () => handleDeletePet(pet));
  document.getElementById('btn-edit-pet')?.addEventListener('click', () => showEditPetModal(pet));
};

const initModalContainer = () => {
  if (!document.getElementById('modal-container')) {
    const div = document.createElement('div');
    div.id = 'modal-container';
    document.body.appendChild(div);
  }
};

const renderTabContent = (tab, petId) => {
  const content = document.getElementById('tab-content');
  if (!content) return;
  
  switch(tab) {
    case 'resumo': renderResumo(content, petId); break;
    case 'vacinas': renderVacinas(content, petId); break;
    case 'vermifugo': renderVermifugo(content, petId); break;
    case 'consultas': renderConsultas(content, petId); break;
    case 'historico': renderHistorico(content, petId); break;
  }
};

const renderResumo = (container, petId) => {
  const history = getHistory(petId).slice(0, 5);
  container.innerHTML = `
    <div class="grid grid-cols-1 gap-6">
      <div class="card">
        <h3 class="card-title mb-6">Últimas Atividades</h3>
        <div class="space-y-6">
          ${history.length > 0 ? history.map(h => `
            <div class="flex items-center justify-between p-4 bg-[#F4F7F8] rounded-xl border border-[#E5E7EB]">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#006F93] border border-[#E5E7EB]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-[#0F172A]">${h.description}</p>
                  <p class="text-xs text-[#64748B] font-medium mt-0.5">${h.date}</p>
                </div>
              </div>
              ${StatusBadge(h.status === 'success' ? 'Concluído' : 'Registro', h.status === 'success' ? 'success' : 'info')}
            </div>
          `).join('') : '<div class="text-center py-8 text-[#64748B] text-sm">Nenhuma atividade recente encontrada.</div>'}
        </div>
        <div class="mt-6 text-center">
          <button class="text-xs font-bold text-[#006F93] hover:underline" id="view-all-history">Ver histórico completo</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('view-all-history')?.addEventListener('click', () => {
    const tab = document.querySelector('[data-tab="historico"]');
    if (tab) tab.click();
  });
};

const renderVacinas = (container, petId) => {
  const items = getVaccines(petId);
  container.innerHTML = `
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 class="card-title">Carteira de Vacinação</h3>
          <p class="text-xs text-[#64748B] font-medium mt-1">Histórico de doses e próximos agendamentos.</p>
        </div>
        <button class="btn-primary !text-xs" id="btn-add-vaccine">Registrar Vacina</button>
      </div>
      
      ${items.length === 0 ? renderEmptySection('Nenhuma vacina cadastrada', 'btn-add-vaccine-empty') : `
        <div class="space-y-3">
          ${items.map(v => `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-[#F4F7F8] rounded-xl flex items-center justify-center text-[#64748B]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-base font-bold text-[#0F172A]">${v.name}</p>
                  <p class="text-xs text-[#64748B] font-medium mt-0.5">Aplicada em: ${v.dateApplied} • Próxima: ${v.nextDose}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 mt-4 sm:mt-0">
                ${StatusBadge(v.status === 'applied' ? 'Aplicada' : 'Pendente', v.status === 'applied' ? 'success' : 'warning')}
                <div class="flex gap-1 ml-4 border-l border-[#E5E7EB] pl-4">
                  ${v.status !== 'applied' ? `<button class="p-2 text-[#64748B] hover:text-[#006F93] transition-colors" title="Marcar como aplicada" onclick="window.handleMarkApplied('${v.id}', 'vaccine', '${petId}')"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></button>` : ''}
                  <button class="p-2 text-[#64748B] hover:text-[#DC2626] transition-colors" title="Excluir" onclick="window.handleDeleteItem('${v.id}', 'vaccine', '${petId}')"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  document.getElementById('btn-add-vaccine')?.addEventListener('click', () => showAddModal('vaccine', petId));
  document.getElementById('btn-add-vaccine-empty')?.addEventListener('click', () => showAddModal('vaccine', petId));
};

const renderVermifugo = (container, petId) => {
  const items = getDeworming(petId);
  container.innerHTML = `
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 class="card-title">Controle de Vermífugo</h3>
          <p class="text-xs text-[#64748B] font-medium mt-1">Acompanhe a frequência de desparasitação.</p>
        </div>
        <button class="btn-primary !text-xs" id="btn-add-deworming">Registrar Dose</button>
      </div>

      ${items.length === 0 ? renderEmptySection('Nenhum registro de vermífugo', 'btn-add-deworming-empty') : `
        <div class="space-y-3">
          ${items.map(v => `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-[#F4F7F8] rounded-xl flex items-center justify-center text-[#64748B]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-base font-bold text-[#0F172A]">${v.name}</p>
                  <p class="text-xs text-[#64748B] font-medium mt-0.5">Dose: ${v.dateApplied} • Próxima: ${v.nextDose} (${v.frequency})</p>
                </div>
              </div>
              <div class="flex items-center gap-3 mt-4 sm:mt-0">
                ${StatusBadge(v.status === 'applied' ? 'Em dia' : 'Vencido', v.status === 'applied' ? 'success' : 'danger')}
                <div class="flex gap-1 ml-4 border-l border-[#E5E7EB] pl-4">
                   ${v.status !== 'applied' ? `<button class="p-2 text-[#64748B] hover:text-[#006F93] transition-colors" title="Marcar dose aplicada" onclick="window.handleMarkApplied('${v.id}', 'deworming', '${petId}')"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></button>` : ''}
                  <button class="p-2 text-[#64748B] hover:text-[#DC2626] transition-colors" title="Excluir" onclick="window.handleDeleteItem('${v.id}', 'deworming', '${petId}')"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  document.getElementById('btn-add-deworming')?.addEventListener('click', () => showAddModal('deworming', petId));
  document.getElementById('btn-add-deworming-empty')?.addEventListener('click', () => showAddModal('deworming', petId));
};

const renderConsultas = (container, petId) => {
  const items = getAppointments(petId);
  container.innerHTML = `
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 class="card-title">Agendamentos de Consultas</h3>
          <p class="text-xs text-[#64748B] font-medium mt-1">Gerencie consultas médicas e veterinárias.</p>
        </div>
        <button class="btn-primary !text-xs" id="btn-add-appointment">Agendar Consulta</button>
      </div>

      ${items.length === 0 ? renderEmptySection('Nenhuma consulta agendada', 'btn-add-appointment-empty') : `
        <div class="space-y-3">
          ${items.map(a => `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-[#F4F7F8] rounded-xl flex items-center justify-center text-[#006F93]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-base font-bold text-[#0F172A]">${a.reason}</p>
                  <p class="text-xs text-[#64748B] font-medium mt-0.5">${a.date} às ${a.time} • ${a.vet}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 mt-4 sm:mt-0">
                ${StatusBadge(a.status === 'scheduled' ? 'Agendado' : 'Realizado', a.status === 'scheduled' ? 'info' : 'success')}
                <div class="flex gap-1 ml-4 border-l border-[#E5E7EB] pl-4">
                  ${a.status === 'scheduled' ? `<button class="p-2 text-[#64748B] hover:text-[#006F93] transition-colors" title="Marcar como realizada" onclick="window.handleMarkApplied('${a.id}', 'appointment', '${petId}')"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></button>` : ''}
                  <button class="p-2 text-[#64748B] hover:text-[#DC2626] transition-colors" title="Excluir" onclick="window.handleDeleteItem('${a.id}', 'appointment', '${petId}')"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  document.getElementById('btn-add-appointment')?.addEventListener('click', () => showAddModal('appointment', petId));
  document.getElementById('btn-add-appointment-empty')?.addEventListener('click', () => showAddModal('appointment', petId));
};

const renderHistorico = (container, petId) => {
  const items = getHistory(petId);
  container.innerHTML = `
    <div class="card">
      <div class="mb-8">
        <h3 class="card-title">Histórico Completo</h3>
        <p class="text-xs text-[#64748B] font-medium mt-1">Linha do tempo de todos os eventos registrados.</p>
      </div>

      ${items.length === 0 ? renderEmptySection('Nenhum evento registrado') : `
        <div class="space-y-8 pl-4 border-l-2 border-[#E5E7EB] ml-2">
          ${items.map(h => `
            <div class="relative">
              <div class="absolute -left-[25px] top-1 w-4 h-4 bg-white border-2 border-[var(--color-primary)] rounded-full"></div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">${h.date}</span>
                <p class="text-sm font-bold text-[#0F172A]">${h.description}</p>
                <div class="mt-1">${StatusBadge(h.status === 'success' ? 'Sucesso' : 'Registro', h.status === 'success' ? 'success' : 'info')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
};

const renderEmptySection = (text, btnId) => `
  <div class="p-12 text-center bg-[#F4F7F8] rounded-2xl border border-dashed border-[#E5E7EB]">
    <p class="text-sm text-[#64748B] font-medium">${text}</p>
    ${btnId ? `<button id="${btnId}" class="mt-4 text-xs font-bold text-[#006F93] hover:underline">Clique para adicionar</button>` : ''}
  </div>
`;

const showEditPetModal = (pet) => {
  const container = document.getElementById('modal-container');
  const content = `
    <form id="form-edit-pet" class="space-y-4">
      <div class="form-group"><label class="form-label">Nome do Pet</label><input type="text" name="name" value="${pet.name}" class="input-field" required></div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Espécie</label><input type="text" name="species" value="${pet.species}" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Raça</label><input type="text" name="breed" value="${pet.breed}" class="input-field" required></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Idade</label><input type="text" name="age" value="${pet.age}" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Peso</label><input type="text" name="weight" value="${pet.weight}" class="input-field" required></div>
      </div>
      <button type="submit" class="btn-primary w-full mt-4">Salvar Alterações</button>
    </form>
  `;
  container.innerHTML = Modal({ id: 'modal-edit-pet', title: 'Editar Perfil', content });
  const modal = document.getElementById('modal-edit-pet');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const form = container.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const updatedPet = { ...pet, name: formData.get('name'), species: formData.get('species'), breed: formData.get('breed'), age: formData.get('age'), weight: formData.get('weight') };
    savePet(updatedPet);
    addHistory(pet.id, 'edit', `Perfil de ${updatedPet.name} atualizado.`);
    modal.classList.add('hidden');
    showToast('Perfil atualizado com sucesso!');
    window.location.reload();
  });
};

const showAddModal = (type, petId) => {
  const container = document.getElementById('modal-container');
  let title = '';
  let content = '';
  if (type === 'vaccine') {
    title = 'Adicionar Vacina';
    content = `
      <form id="form-add-vaccine" class="space-y-4">
        <div class="form-group"><label class="form-label">Nome da Vacina</label><input type="text" name="name" class="input-field" required></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Data da Dose</label><input type="date" name="date" class="input-field" required></div>
          <div class="form-group"><label class="form-label">Próxima Dose</label><input type="date" name="next" class="input-field" required></div>
        </div>
        <div class="form-group"><label class="form-label">Observações</label><textarea name="note" class="input-field h-24"></textarea></div>
        <button type="submit" class="btn-primary w-full mt-4">Salvar Registro</button>
      </form>
    `;
  } else if (type === 'deworming') {
    title = 'Adicionar Vermífugo';
    content = `
      <form id="form-add-deworming" class="space-y-4">
        <div class="form-group"><label class="form-label">Produto/Nome</label><input type="text" name="name" class="input-field" required></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Data</label><input type="date" name="date" class="input-field" required></div>
          <div class="form-group"><label class="form-label">Próxima</label><input type="date" name="next" class="input-field" required></div>
        </div>
        <div class="form-group"><label class="form-label">Frequência</label><input type="text" name="freq" placeholder="ex: 3 meses" class="input-field" required></div>
        <button type="submit" class="btn-primary w-full mt-4">Salvar Registro</button>
      </form>
    `;
  } else if (type === 'appointment') {
    title = 'Agendar Consulta';
    content = `
      <form id="form-add-appointment" class="space-y-4">
        <div class="form-group"><label class="form-label">Motivo</label><input type="text" name="reason" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Veterinário/Clínica</label><input type="text" name="vet" class="input-field" required></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Data</label><input type="date" name="date" class="input-field" required></div>
          <div class="form-group"><label class="form-label">Horário</label><input type="time" name="time" class="input-field" required></div>
        </div>
        <button type="submit" class="btn-primary w-full mt-4">Agendar</button>
      </form>
    `;
  }
  container.innerHTML = Modal({ id: 'modal-add', title, content });
  const modal = document.getElementById('modal-add');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const form = container.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    if (type === 'vaccine') {
      saveVaccine({ petId, name: formData.get('name'), dateApplied: formData.get('date'), nextDose: formData.get('next'), note: formData.get('note'), status: 'applied' });
      addHistory(petId, 'vaccine', `Vacina ${formData.get('name')} aplicada.`);
    } else if (type === 'deworming') {
      saveDeworming({ petId, name: formData.get('name'), dateApplied: formData.get('date'), nextDose: formData.get('next'), frequency: formData.get('freq'), status: 'applied' });
      addHistory(petId, 'deworming', `Vermífugo ${formData.get('name')} administrado.`);
    } else if (type === 'appointment') {
      saveAppointment({ petId, reason: formData.get('reason'), vet: formData.get('vet'), date: formData.get('date'), time: formData.get('time'), status: 'scheduled' });
      addHistory(petId, 'appointment', `Consulta agendada: ${formData.get('reason')}.`);
    }
    modal.classList.add('hidden');
    showToast('Registro salvo com sucesso!');
    renderTabContent(type === 'appointment' ? 'consultas' : type === 'deworming' ? 'vermifugo' : 'vacinas', petId);
  });
};

window.handleMarkApplied = (id, type, petId) => {
  if (type === 'vaccine') {
    const items = getVaccines(petId);
    const item = items.find(i => i.id === id);
    if (item) {
      item.status = 'applied';
      saveVaccine(item);
      addHistory(petId, 'vaccine', `Vacina ${item.name} marcada como aplicada.`);
    }
  } else if (type === 'deworming') {
    const items = getDeworming(petId);
    const item = items.find(i => i.id === id);
    if (item) {
      item.status = 'applied';
      saveDeworming(item);
      addHistory(petId, 'deworming', `Vermífugo ${item.name} marcado como administrado.`);
    }
  } else if (type === 'appointment') {
    const items = getAppointments(petId);
    const item = items.find(i => i.id === id);
    if (item) {
      item.status = 'completed';
      saveAppointment(item);
      addHistory(petId, 'appointment', `Consulta ${item.reason} marcada como realizada.`);
    }
  }
  showToast('Atualizado com sucesso!');
  renderTabContent(type === 'appointment' ? 'consultas' : type === 'deworming' ? 'vermifugo' : 'vacinas', petId);
};

window.handleDeleteItem = (id, type, petId) => {
  if (confirm('Deseja excluir este registro?')) {
    if (type === 'vaccine') deleteVaccine(id);
    else if (type === 'deworming') deleteDeworming(id);
    else if (type === 'appointment') deleteAppointment(id);
    showToast('Registro removido');
    renderTabContent(type === 'appointment' ? 'consultas' : type === 'deworming' ? 'vermifugo' : 'vacinas', petId);
  }
};

const handleDeletePet = (pet) => {
  if (confirm(`Tem certeza que deseja excluir o perfil de ${pet.name}?`)) {
    deletePet(pet.id);
    showToast('Perfil excluído com sucesso');
    setTimeout(() => window.location.href = '/pages/meus-pets/index.html', 1500);
  }
};

const showToast = (msg, type = 'success') => {
  const toastEl = document.createElement('div');
  toastEl.innerHTML = Toast(msg, type);
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
};
