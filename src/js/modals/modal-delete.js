import { ModalManager } from './modalManager.js';
import { handleDeleteItemAction } from '../pages/detalhes-pet/pet-actions.js';

/**
 * Modal para exclusão genérica de itens (vacinas, consultas, vermífugos, etc.).
 *
 * @param {number|string} id - ID do item a ser excluído.
 * @param {string} type - O tipo de item a excluir.
 * @param {number|string} petId - O ID do pet relacionado.
 * @param {Function} onRefresh - Callback chamado após a exclusão com sucesso.
 */
export const showDeleteItemModal = (id, type, petId, onRefresh) => {
  const content = `
    <div class="text-center space-y-4 py-4">
      <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <p class="text-sm text-slate-500">Tem certeza que deseja excluir este registro? Essa ação não poderá ser desfeita.</p>
      <div class="flex gap-3 pt-6">
        <button type="button" class="btn-secondary w-full" id="btn-cancel-del-item">Cancelar</button>
        <button type="button" class="btn-primary w-full !bg-red-600 hover:!bg-red-700 !border-red-600" id="btn-confirm-del-item">Excluir</button>
      </div>
    </div>
  `;
  const { container, modal } = ModalManager.open('modal-delete-item', 'Excluir Registro', content);
  
  document.getElementById('btn-cancel-del-item').addEventListener('click', () => {
    ModalManager.close('modal-delete-item');
  });
  
  const confirmBtn = document.getElementById('btn-confirm-del-item');
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.innerText = 'Excluindo...';
    const success = await handleDeleteItemAction(id, type);
    if (success) {
        ModalManager.close('modal-delete-item');
        if (onRefresh) onRefresh();
    } else {
        confirmBtn.disabled = false;
        confirmBtn.innerText = 'Excluir';
    }
  });
};
