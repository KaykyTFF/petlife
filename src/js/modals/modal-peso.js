import { ModalManager } from './modalManager.js';
import { createPeso } from '../services/healthService.js';
import { showToast } from '../pages/detalhes-pet/pet-actions.js';

/**
 * Abre o modal para registrar um novo peso.
 * @param {number|string} petId - ID do pet.
 * @param {Function} onRefresh - Callback chamado após sucesso.
 */
export const showAddPesoModal = (petId, onRefresh) => {
  const today = new Date().toISOString().split('T')[0];
  
  const content = `
    <form id="form-peso" class="space-y-4 max-h-[70vh] overflow-y-auto px-1 no-scrollbar pb-6 relative">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Data da Pesagem</label>
          <input type="date" name="data" class="input-field" value="${today}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Peso (kg)</label>
          <input type="number" step="0.01" min="0.1" name="peso" class="input-field" placeholder="Ex: 10.5" required>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Observações</label>
        <textarea name="observacoes" class="input-field h-20" placeholder="Ex: Pesagem realizada após cirurgia..."></textarea>
      </div>
      
      <div class="sticky bottom-0 pt-4 bg-white border-t border-slate-100">
        <button type="submit" class="btn-primary w-full">Salvar Peso</button>
      </div>
    </form>
  `;
  
  // Abre o modal usando o ModalManager
  const { container, modal } = ModalManager.open('modal-peso', 'Registrar Peso', content);
  
  // Seleciona o formulário que acabamos de injetar no container
  const form = container.querySelector('form');
  
  // Lida com o evento de envio (submit) do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Captura o botão para exibir estado de loading
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Salvando...';
    
    // Extrai facilmente os dados de todos os inputs que possuem a tag 'name'
    const formData = new FormData(form);
    
    // Constrói o payload para envio à API
    const data = {
        pet: petId,
        data: formData.get('data'),
        peso: formData.get('peso'),
        observacoes: formData.get('observacoes')
    };
    
    try {
        // Envia os dados criados para o backend
        await createPeso(data);
        showToast('Peso registrado com sucesso!', 'success');
        
        // Fecha o modal e recarrega os dados da página
        ModalManager.close('modal-peso');
        if (onRefresh) onRefresh();
    } catch (error) {
        console.error(error);
        showToast('Erro ao salvar peso.', 'danger');
        // Restaura o botão em caso de falha
        btn.disabled = false;
        btn.innerText = 'Salvar Peso';
    }
  });
};
