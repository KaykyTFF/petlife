import { ModalManager } from './modalManager.js';
import { updateProfile, requestEmailChange, confirmEmailChange, changePassword } from '../services/profileService.js';
import { getMediaUrl } from '../services/apiClient.js';
import { logoutUser } from '../auth.js';
import { formatPhoneBR } from '../utils/formatters.js';
import { showToast } from '../pages/detalhes-pet/pet-actions.js';
import { showAvatarCropperModal } from './modal-avatar-cropper.js';

/**
 * Abre o modal para editar os dados do perfil do usuário.
 * @param {Object} user - Objeto com as informações atuais do usuário.
 * @param {Function} onRefresh - Callback chamado quando o perfil for atualizado.
 */
export const showEditProfileModal = (user, onRefresh) => {
    const initial = (user.first_name || user.username || 'U').charAt(0).toUpperCase();
    const rawAvatar = user.avatar || user.perfil?.avatar;
    const avatarUrl = rawAvatar ? getMediaUrl(rawAvatar) : null;

    const content = `
        <form id="edit-profile-form" class="space-y-6">
            <div class="flex items-center gap-6 mb-6">
                <div id="avatar-preview-container" class="w-20 h-20 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden border border-slate-200">
                    ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" alt="Preview">` : initial}
                </div>
                <div class="flex-1">
                    <label class="form-label mb-2">Foto do Perfil</label>
                    <button type="button" id="btn-edit-avatar" class="btn-secondary !py-2 !px-4 !text-xs">Escolher imagem</button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group">
                    <label class="form-label">Nome</label>
                    <input type="text" name="first_name" value="${user.first_name || ''}" class="input-field" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Sobrenome</label>
                    <input type="text" name="last_name" value="${user.last_name || ''}" class="input-field" required>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="form-group">
                    <label class="form-label">Telefone</label>
                    <input type="text" id="phone-modal-input" name="phone" value="${user.phone || user.perfil?.phone || ''}" class="input-field" placeholder="(00) 00000-0000">
                </div>
                <div class="form-group">
                    <label class="form-label">Data de Nascimento</label>
                    <input type="date" name="data_nascimento" value="${user.data_nascimento || user.perfil?.data_nascimento || ''}" class="input-field">
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" id="btn-cancel-edit-profile" class="btn-secondary">Cancelar</button>
                <button type="submit" id="save-profile-btn" class="btn-primary">Salvar Alterações</button>
            </div>
        </form>
    `;

    const { container, modal } = ModalManager.open('modal-edit-profile', 'Editar Perfil', content);

    const editForm = document.getElementById('edit-profile-form');
    const btnEditAvatar = document.getElementById('btn-edit-avatar');
    const phoneInput = document.getElementById('phone-modal-input');
    const previewContainer = document.getElementById('avatar-preview-container');

    document.getElementById('btn-cancel-edit-profile').addEventListener('click', () => {
        ModalManager.close('modal-edit-profile');
    });

    if (btnEditAvatar) {
        btnEditAvatar.addEventListener('click', () => {
            showAvatarCropperModal(avatarUrl, () => {
                // Atualiza a foto no modal de perfil após salvar no cropper
                const updatedUser = JSON.parse(localStorage.getItem('user'));
                const newAvatarUrl = getMediaUrl(updatedUser.avatar || updatedUser.perfil?.avatar);
                if (newAvatarUrl) {
                    previewContainer.innerHTML = `<img src="${newAvatarUrl}" class="w-full h-full object-cover" alt="Preview">`;
                }
            });
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneBR(e.target.value);
        });
    }

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-profile-btn');
        const originalText = btn.innerText;

        try {
            btn.disabled = true;
            btn.innerText = 'Salvando...';

            const formData = new FormData(editForm);

            // Remove o campo avatar se o usuário não tiver selecionado uma nova foto
            // Isso evita que o backend apague a foto atual
            const avatarFile = formData.get('avatar');
            if (!avatarFile || avatarFile.size === 0) {
                formData.delete('avatar');
            }

            const updatedUser = await updateProfile(formData);

            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new CustomEvent('user-updated'));
            showToast('Perfil atualizado com sucesso!');

            ModalManager.close('modal-edit-profile');
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            showToast(err.detail || 'Erro ao atualizar perfil.', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    });
};

/**
 * Abre o modal para solicitar e confirmar a alteração de e-mail do usuário.
 */
export const showEmailModal = () => {
    const content = `
        <form id="email-change-form" class="space-y-4">
            <div class="form-group">
                <label class="form-label">Novo E-mail</label>
                <input type="email" id="new-email-input" class="input-field" placeholder="exemplo@email.com" required>
            </div>
            <div class="form-group">
                <label class="form-label">Senha Atual</label>
                <input type="password" id="current-password-email-input" class="input-field" placeholder="••••••••" required>
            </div>
            
            <div id="email-code-container" class="hidden animate-fade-in pt-4 border-t border-slate-100">
                <div class="form-group">
                    <label class="form-label text-[var(--color-primary)]">Código de Confirmação</label>
                    <input type="text" id="email-code-input" maxlength="6" class="input-field text-center tracking-[0.5em] font-bold" placeholder="000000">
                    <p class="text-[10px] text-slate-400 mt-2">Verifique seu novo e-mail (ou o terminal do Django).</p>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" id="btn-cancel-email" class="btn-secondary">Cancelar</button>
                <button type="submit" id="email-modal-btn" class="btn-primary">Enviar Código</button>
            </div>
        </form>
    `;

    const { container, modal } = ModalManager.open('modal-email', 'Alterar E-mail', content);

    document.getElementById('btn-cancel-email').addEventListener('click', () => {
        ModalManager.close('modal-email');
    });

    const emailForm = document.getElementById('email-change-form');
    let emailState = 'request';

    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('email-modal-btn');
        const newEmail = document.getElementById('new-email-input').value;
        const currentPass = document.getElementById('current-password-email-input').value;
        const codeContainer = document.getElementById('email-code-container');
        const codeInput = document.getElementById('email-code-input');

        if (emailState === 'request') {
            try {
                btn.disabled = true;
                btn.innerText = 'Enviando...';
                await requestEmailChange(newEmail, currentPass);

                showToast('Código enviado!');
                emailState = 'confirm';
                codeContainer.classList.remove('hidden');
                btn.innerText = 'Confirmar Alteração';
                document.getElementById('new-email-input').disabled = true;
                document.getElementById('current-password-email-input').disabled = true;
            } catch (err) {
                console.error(err);
                showToast(err.detail || err.current_password || 'Erro ao solicitar alteração.', 'danger');
            } finally {
                btn.disabled = false;
            }
        } else {
            try {
                const code = codeInput.value;
                if (code.length !== 6) {
                    showToast('Digite o código de 6 dígitos.', 'warning');
                    return;
                }

                btn.disabled = true;
                btn.innerText = 'Confirmando...';
                const updatedUser = await confirmEmailChange(newEmail, code);

                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new CustomEvent('user-updated'));
                showToast('E-mail alterado com sucesso!');

                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                console.error(err);
                showToast(err.detail || 'Código inválido.', 'danger');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Confirmar Alteração';
            }
        }
    });
};

/**
 * Abre o modal para alterar a senha do usuário.
 */
export const showPasswordModal = () => {
    const content = `
        <form id="password-change-form" class="space-y-4">
            <div class="form-group">
                <label class="form-label">Senha Atual</label>
                <input type="password" name="current_password" class="input-field" placeholder="••••••••" required>
            </div>
            <div class="form-group">
                <label class="form-label">Nova Senha</label>
                <input type="password" name="new_password" class="input-field" placeholder="••••••••" required minlength="8">
            </div>
            <div class="form-group">
                <label class="form-label">Confirmar Nova Senha</label>
                <input type="password" name="new_password_confirm" class="input-field" placeholder="••••••••" required minlength="8">
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" id="btn-cancel-password" class="btn-secondary">Cancelar</button>
                <button type="submit" id="password-modal-btn" class="btn-primary">Salvar nova senha</button>
            </div>
        </form>
    `;

    const { container, modal } = ModalManager.open('modal-password', 'Alterar Senha', content);

    document.getElementById('btn-cancel-password').addEventListener('click', () => {
        ModalManager.close('modal-password');
    });

    const passwordForm = document.getElementById('password-change-form');
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('password-modal-btn');

        const current_password = passwordForm.querySelector('[name="current_password"]').value;
        const new_password = passwordForm.querySelector('[name="new_password"]').value;
        const new_password_confirm = passwordForm.querySelector('[name="new_password_confirm"]').value;

        if (new_password !== new_password_confirm) {
            showToast('As senhas não coincidem.', 'warning');
            return;
        }

        try {
            btn.disabled = true;
            btn.innerText = 'Alterando...';

            await changePassword(current_password, new_password, new_password_confirm);

            showToast('Senha alterada! Saindo...');
            setTimeout(() => logoutUser(), 2000);
        } catch (err) {
            console.error(err);
            showToast(err.detail || err.new_password || 'Erro ao alterar senha.', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerText = 'Salvar nova senha';
        }
    });
};
