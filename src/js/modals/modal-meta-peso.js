import { ModalManager } from './modalManager.js';
import { updatePet, getPetDetails } from '../services/petService.js';
import { showToast } from '../pages/detalhes-pet/pet-actions.js';

/**
 * Abre o modal para definir a meta de peso do pet.
 * @param {number|string} petId - ID do pet.
 * @param {Function} onRefresh - Callback chamado após sucesso.
 */
export const showAddMetaPesoModal = async (petId, onRefresh) => {
  // Buscar o pet para preencher o valor atual se já existir
  let currentMeta = '';
  try {
      const pet = await getPetDetails(petId);
      if (pet && pet.meta_peso) {
          currentMeta = pet.meta_peso;
      }
  } catch (e) {
      console.error('Erro ao buscar detalhes do pet', e);
  }

  const content = `
    <form id="form-meta-peso" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="form-group">
        <label class="form-label">Qual é a meta de peso para este pet?</label>
        <div class="flex items-center gap-2 mt-2">
            <input type="number" step="0.01" min="0.1" name="meta_peso" class="input-field flex-1" placeholder="Ex: 12.5" value="${currentMeta}" required>
            <span class="text-slate-500 font-medium">kg</span>
        </div>
        <p class="text-xs text-slate-500 mt-2">A meta de peso aparecerá no histórico de peso para facilitar o acompanhamento da evolução.</p>
      </div>
      
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100 flex gap-2">
        <button type="button" class="btn-secondary flex-1 btn-cancel-meta">Cancelar</button>
        <button type="submit" class="btn-primary flex-1">Salvar Meta</button>
      </div>
    </form>
  `;
  
  const { container, modal } = ModalManager.open('modal-meta-peso', 'Definir Meta de Peso', content);
  
  const btnCancel = container.querySelector('.btn-cancel-meta');
  if (btnCancel) {
      btnCancel.addEventListener('click', () => ModalManager.close('modal-meta-peso'));
  }
  
  const form = container.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Salvando...';
    
    const formData = new FormData(form);
    const meta_peso = formData.get('meta_peso');
    
    try {
        await updatePet(petId, { meta_peso: meta_peso });
        ModalManager.close('modal-meta-peso');
        showToast('Meta de peso definida com sucesso!', 'success');
        if (onRefresh) onRefresh();
    } catch (err) {
        showToast(err?.detail || 'Erro ao definir meta.', 'danger');
        btn.disabled = false;
        btn.innerText = 'Salvar Meta';
    }
  });
};
