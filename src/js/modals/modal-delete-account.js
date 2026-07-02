import { ModalManager } from './modalManager.js';
import { deleteAccount } from '../services/profileService.js';
import { logoutUser } from '../auth.js';

/**
 * Exibe o modal de confirmação para exclusão permanente da conta de usuário.
 * Requer a inserção da senha atual para confirmar a ação.
 */
export const showDeleteAccountModal = () => {
  const content = `
    <div class="space-y-4 py-4">
      <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p class="text-sm text-center text-slate-500 mb-6">Esta ação é irreversível. Todos os seus dados, pets, histórico de vacinas e consultas serão perdidos para sempre.</p>
      
      <div class="form-group mb-6">
          <label for="delete_account_password" class="block text-sm font-medium text-[var(--color-text)] mb-2">Digite sua senha atual para confirmar:</label>
          <input type="password" id="delete_account_password" class="form-input w-full" placeholder="Sua senha secreta">
      </div>
      
      <div id="delete_account_message" class="text-sm mb-4 hidden rounded p-3 text-center font-medium"></div>

      <div class="flex gap-3">
        <button type="button" class="btn-secondary w-full" id="btn-cancel-del-account">Cancelar</button>
        <button type="button" class="btn-primary w-full !bg-red-600 hover:!bg-red-700 !border-red-600" id="btn-confirm-del-account">Deletar permanentemente</button>
      </div>
    </div>
  `;
  const { container, modal } = ModalManager.open('modal-delete-account', 'Excluir Conta Permanentemente', content);
  
  document.getElementById('btn-cancel-del-account').addEventListener('click', () => {
    ModalManager.close('modal-delete-account');
  });
  
  const confirmBtn = document.getElementById('btn-confirm-del-account');
  const passwordInput = document.getElementById('delete_account_password');
  const messageDiv = document.getElementById('delete_account_message');

  const showMessage = (msg, isError = true) => {
    messageDiv.textContent = msg;
    messageDiv.className = `text-sm mb-4 rounded p-3 text-center font-medium ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`;
  };

  confirmBtn.addEventListener('click', async () => {
    messageDiv.className = 'hidden';
    const password = passwordInput.value.trim();
    if (!password) {
        showMessage("Por favor, digite sua senha atual para confirmar.");
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerText = 'Excluindo...';
    try {
        await deleteAccount(password);
        showMessage("Conta excluída com sucesso.", false);
        // O logout limpa o localStorage e redireciona pro login
        setTimeout(() => {
            ModalManager.close('modal-delete-account');
            logoutUser();
        }, 1500);
    } catch (error) {
        showMessage(error?.detail || "Erro ao excluir conta. Verifique sua senha e tente novamente.");
        confirmBtn.disabled = false;
        confirmBtn.innerText = 'Deletar permanentemente';
    }
  });
};
