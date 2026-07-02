import { ModalManager } from './modalManager.js';
import { createVaccine, updateVaccine, getVaccines } from '../services/healthService.js';
import { showToast } from '../pages/detalhes-pet/pet-actions.js';

/**
 * Abre o modal para registrar uma nova vacina.
 * @param {number|string} petId - ID do pet.
 * @param {Function} onRefresh - Callback chamado após sucesso.
 */
export const showAddVaccineModal = (petId, onRefresh) => {
  const content = `
    <form id="form-vaccine" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="form-group"><label class="form-label">Nome da Vacina</label><input type="text" name="name" class="input-field" required></div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Data da Aplicação</label><input type="date" name="last_date" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Próxima Dose</label><input type="date" name="next_date" class="input-field" required></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Fabricante</label><input type="text" name="manufacturer" class="input-field"></div>
        <div class="form-group"><label class="form-label">Lote</label><input type="text" name="batch_number" class="input-field"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Dose</label><input type="text" name="dose" class="input-field"></div>
        <div class="form-group"><label class="form-label">Clínica</label><input type="text" name="clinic" class="input-field"></div>
      </div>

      <div class="form-group"><label class="form-label">Veterinário</label><input type="text" name="veterinarian" class="input-field"></div>
      
      <div class="form-group">
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="reminder_enabled" checked class="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]">
          <span class="text-sm font-medium text-slate-700">Ativar lembrete</span>
        </label>
      </div>

      <div class="form-group"><label class="form-label">Observações</label><textarea name="notes" class="input-field h-20"></textarea></div>
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
        <button type="submit" class="btn-primary w-full">Salvar Vacina</button>
      </div>
    </form>
  `;
  
  const { container, modal } = ModalManager.open('modal-vaccine', 'Registrar Vacina', content);
  
  const form = container.querySelector('form');
  form.addEventListener('submit', async (e) => {
    // segura o reload padrão da tela pra dispararmos o fetch assíncrono
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    // lock no botão de submit pra prevenir do usuário meter duplo clique
    btn.disabled = true;
    btn.innerText = 'Salvando...';
    
    const formData = new FormData(form);
    const data = {
        pet: petId,
        nome: formData.get('name'),
        ultima_data: formData.get('last_date'),
        proxima_data: formData.get('next_date') || null,
        fabricante: formData.get('manufacturer'),
        lote: formData.get('batch_number'),
        dose: formData.get('dose'),
        clinica: formData.get('clinic'),
        veterinario: formData.get('veterinarian'),
        lembrete_ativo: formData.get('reminder_enabled') === 'on',
        observacoes: formData.get('notes'),
        concluido: false
    };
    
    try {
        await createVaccine(data);
        ModalManager.close('modal-vaccine');
        showToast('Vacina registrada com sucesso!', 'success');
        if (onRefresh) onRefresh();
    } catch (err) {
        showToast(err?.next_date?.[0] || 'Erro ao registrar vacina.', 'danger');
        btn.disabled = false;
        btn.innerText = 'Salvar Vacina';
    }
  });
};

/**
 * Abre o modal para editar uma vacina existente.
 * @param {number|string} id - ID da vacina.
 * @param {number|string} petId - ID do pet.
 * @param {Function} onRefresh - Callback chamado após sucesso.
 */
export const showEditVaccineModal = async (id, petId, onRefresh) => {
    const res = await getVaccines(petId);
    const vaccine = (res.data || res)?.find(v => v.id == id);
    if (!vaccine) return;

  const content = `
    <form id="form-vaccine" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="form-group"><label class="form-label">Nome da Vacina</label><input type="text" name="name" value="${vaccine.nome}" class="input-field" required></div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Data da Aplicação</label><input type="date" name="last_date" value="${vaccine.ultima_data}" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Próxima Dose</label><input type="date" name="next_date" value="${vaccine.proxima_data || ''}" class="input-field" required></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Fabricante</label><input type="text" name="manufacturer" value="${vaccine.fabricante || ''}" class="input-field"></div>
        <div class="form-group"><label class="form-label">Lote</label><input type="text" name="batch_number" value="${vaccine.lote || ''}" class="input-field"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Dose</label><input type="text" name="dose" value="${vaccine.dose || ''}" class="input-field"></div>
        <div class="form-group"><label class="form-label">Clínica</label><input type="text" name="clinic" value="${vaccine.clinica || ''}" class="input-field"></div>
      </div>

      <div class="form-group"><label class="form-label">Veterinário</label><input type="text" name="veterinarian" value="${vaccine.veterinario || ''}" class="input-field"></div>

      <div class="form-group">
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="reminder_enabled" ${vaccine.lembrete_ativo ? 'checked' : ''} class="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]">
          <span class="text-sm font-medium text-slate-700">Ativar lembrete</span>
        </label>
      </div>

      <div class="form-group"><label class="form-label">Observações</label><textarea name="notes" class="input-field h-20">${vaccine.observacoes || ''}</textarea></div>
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
        <button type="submit" class="btn-primary w-full">Salvar Alterações</button>
      </div>
    </form>
  `;
  
  const { container, modal } = ModalManager.open('modal-vaccine', 'Editar Vacina', content);
  
  const form = container.querySelector('form');
  form.addEventListener('submit', async (e) => {
    // bloqueia form reload
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    // previne double submit
    btn.disabled = true;
    btn.innerText = 'Salvando...';
    
    const formData = new FormData(form);
    const data = {
        nome: formData.get('name'),
        ultima_data: formData.get('last_date'),
        proxima_data: formData.get('next_date') || null,
        fabricante: formData.get('manufacturer'),
        lote: formData.get('batch_number'),
        dose: formData.get('dose'),
        clinica: formData.get('clinic'),
        veterinario: formData.get('veterinarian'),
        lembrete_ativo: formData.get('reminder_enabled') === 'on',
        observacoes: formData.get('notes'),
    };
    
    try {
        await updateVaccine(id, data);
        ModalManager.close('modal-vaccine');
        showToast('Vacina atualizada com sucesso!', 'success');
        if (onRefresh) onRefresh();
    } catch (err) {
        showToast(err?.next_date?.[0] || 'Erro ao atualizar vacina.', 'danger');
        btn.disabled = false;
        btn.innerText = 'Salvar Alterações';
    }
  });
};
