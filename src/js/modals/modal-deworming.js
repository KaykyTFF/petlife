import { ModalManager } from './modalManager.js';
import { createDeworming, updateDeworming, getDeworming } from '../services/healthService.js';
import { showToast } from '../pages/detalhes-pet/pet-actions.js';

/**
 * Abre o modal para registrar a aplicação de um novo vermífugo.
 * @param {number|string} petId - ID do pet.
 * @param {Function} onRefresh - Callback chamado após sucesso.
 */
export const showAddDewormingModal = (petId, onRefresh) => {
  const content = `
    <form id="form-deworming" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="form-group"><label class="form-label">Nome/Produto</label><input type="text" name="product_name" class="input-field" required></div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Data da Aplicação</label><input type="date" name="last_date" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Próxima Dose</label><input type="date" name="next_date" class="input-field" required></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Frequência</label><input type="text" name="frequency" placeholder="Ex: Mensal" class="input-field"></div>
        <div class="form-group"><label class="form-label">Dosagem</label><input type="text" name="dosage" placeholder="Ex: 1/2 comprimido" class="input-field"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Peso do Pet (kg)</label><input type="number" min="0" step="0.1" name="pet_weight_at_time" class="input-field"></div>
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
        <button type="submit" class="btn-primary w-full">Salvar Vermífugo</button>
      </div>
    </form>
  `;
  const { container, modal } = ModalManager.open('modal-deworming', 'Adicionar Vermífugo', content);
  
  const form = container.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Salvando...';
    
    const formData = new FormData(form);
    const data = {
        pet: petId,
        nome_produto: formData.get('product_name'),
        ultima_data: formData.get('last_date'),
        proxima_data: formData.get('next_date') || null,
        frequencia: formData.get('frequency'),
        dosagem: formData.get('dosage'),
        peso_momento: formData.get('pet_weight_at_time') ? parseFloat(formData.get('pet_weight_at_time')) : null,
        clinica: formData.get('clinic'),
        veterinario: formData.get('veterinarian'),
        lembrete_ativo: formData.get('reminder_enabled') === 'on',
        observacoes: formData.get('notes'),
        concluido: false
    };
    
    try {
        await createDeworming(data);
        ModalManager.close('modal-deworming');
        showToast('Vermífugo registrado com sucesso!', 'success');
        if (onRefresh) onRefresh();
    } catch (err) {
        showToast(err?.next_date?.[0] || 'Erro ao registrar vermífugo.', 'danger');
        btn.disabled = false;
        btn.innerText = 'Salvar Vermífugo';
    }
  });
};

/**
 * Abre o modal para editar um vermífugo previamente registrado.
 * @param {number|string} id - ID do vermífugo.
 * @param {number|string} petId - ID do pet.
 * @param {Function} onRefresh - Callback chamado após sucesso.
 */
export const showEditDewormingModal = async (id, petId, onRefresh) => {
    const res = await getDeworming(petId);
    const item = (res.data || res)?.find(v => v.id == id);
    if (!item) return;

  const content = `
    <form id="form-deworming" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="form-group"><label class="form-label">Nome/Produto</label><input type="text" name="product_name" value="${item.nome_produto}" class="input-field" required></div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Data da Aplicação</label><input type="date" name="last_date" value="${item.ultima_data}" class="input-field" required></div>
        <div class="form-group"><label class="form-label">Próxima Dose</label><input type="date" name="next_date" value="${item.proxima_data || ''}" class="input-field" required></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Frequência</label><input type="text" name="frequency" value="${item.frequencia || ''}" placeholder="Ex: Mensal" class="input-field"></div>
        <div class="form-group"><label class="form-label">Dosagem</label><input type="text" name="dosage" value="${item.dosagem || ''}" placeholder="Ex: 1/2 comprimido" class="input-field"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group"><label class="form-label">Peso do Pet (kg)</label><input type="number" min="0" step="0.1" name="pet_weight_at_time" value="${item.peso_momento || ''}" class="input-field"></div>
        <div class="form-group"><label class="form-label">Clínica</label><input type="text" name="clinic" value="${item.clinica || ''}" class="input-field"></div>
      </div>

      <div class="form-group"><label class="form-label">Veterinário</label><input type="text" name="veterinarian" value="${item.veterinario || ''}" class="input-field"></div>

      <div class="form-group">
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="reminder_enabled" ${item.lembrete_ativo ? 'checked' : ''} class="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]">
          <span class="text-sm font-medium text-slate-700">Ativar lembrete</span>
        </label>
      </div>

      <div class="form-group"><label class="form-label">Observações</label><textarea name="notes" class="input-field h-20">${item.observacoes || ''}</textarea></div>
      
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
        <button type="submit" class="btn-primary w-full">Salvar Alterações</button>
      </div>
    </form>
  `;
  const { container, modal } = ModalManager.open('modal-deworming', 'Editar Vermífugo', content);
  
  const form = container.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Salvando...';
    
    const formData = new FormData(form);
    const data = {
        nome_produto: formData.get('product_name'),
        ultima_data: formData.get('last_date'),
        proxima_data: formData.get('next_date') || null,
        frequencia: formData.get('frequency'),
        dosagem: formData.get('dosage'),
        peso_momento: formData.get('pet_weight_at_time') ? parseFloat(formData.get('pet_weight_at_time')) : null,
        clinica: formData.get('clinic'),
        veterinario: formData.get('veterinarian'),
        lembrete_ativo: formData.get('reminder_enabled') === 'on',
        observacoes: formData.get('notes'),
    };
    
    try {
        await updateDeworming(id, data);
        ModalManager.close('modal-deworming');
        showToast('Vermífugo atualizado com sucesso!', 'success');
        if (onRefresh) onRefresh();
    } catch (err) {
        showToast(err?.next_date?.[0] || 'Erro ao atualizar vermífugo.', 'danger');
        btn.disabled = false;
        btn.innerText = 'Salvar Alterações';
    }
  });
};
