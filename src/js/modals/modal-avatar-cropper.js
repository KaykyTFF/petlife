import { ModalManager } from './modalManager.js';
import { updateProfile } from '../services/profileService.js';
import { Toast } from '../../components/toast.js';

/**
 * Abre um modal com a ferramenta de corte de imagem (Cropper.js) para a foto de perfil.
 * @param {string} currentAvatarUrl - URL do avatar atual.
 * @param {Function} onSaveCallback - Callback invocado quando a nova foto for salva.
 */
export const showAvatarCropperModal = (currentAvatarUrl, onSaveCallback) => {
    const content = `
      <div class="space-y-6">
        <p class="text-sm text-slate-500">Selecione uma imagem do seu computador e corte-a para usar como foto de perfil.</p>
        
        <div class="flex flex-col items-center gap-4">
            <!-- Hidden file input -->
            <input type="file" id="avatar-file-input" accept="image/*" class="hidden">
            
            <!-- Select button -->
            <button id="btn-select-image" class="btn-secondary w-full flex justify-center items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Escolher Imagem
            </button>
            
            <!-- Cropper Container (hidden initially if no image) -->
            <div id="cropper-container" class="w-full max-w-sm hidden">
                <div class="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
                    <img id="cropper-image" src="" class="max-w-full block" alt="Imagem para cortar">
                </div>
            </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" class="btn-secondary px-6" onclick="document.getElementById('modal-avatar-cropper').remove()">Cancelar</button>
          <button type="button" id="btn-save-avatar" class="btn-primary px-6" disabled>Salvar Foto</button>
        </div>
      </div>
    `;

    const { container, modal } = ModalManager.open('modal-avatar-cropper', 'Editar Foto de Perfil', content);
    
    const fileInput = container.querySelector('#avatar-file-input');
    const selectBtn = container.querySelector('#btn-select-image');
    const cropperContainer = container.querySelector('#cropper-container');
    const imageEl = container.querySelector('#cropper-image');
    const saveBtn = container.querySelector('#btn-save-avatar');
    
    let cropperInstance = null;

    selectBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Destroy previous cropper if exists
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }

        const url = URL.createObjectURL(file);
        imageEl.src = url;
        cropperContainer.classList.remove('hidden');
        saveBtn.disabled = false;

        // Initialize Cropper.js
        cropperInstance = new Cropper(imageEl, {
            aspectRatio: 1, // 1:1 square
            viewMode: 1,    // Restrict the crop box to not exceed the size of the canvas
            dragMode: 'move',
            autoCropArea: 0.9,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        });
    });

    saveBtn.addEventListener('click', () => {
        if (!cropperInstance) return;

        saveBtn.innerText = 'Salvando...';
        saveBtn.disabled = true;

        cropperInstance.getCroppedCanvas({
            width: 400,
            height: 400,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        }).toBlob(async (blob) => {
            if (!blob) {
                const toastHtml = Toast('Erro ao cortar a imagem.', 'error');
                document.body.insertAdjacentHTML('beforeend', toastHtml);
                saveBtn.innerText = 'Salvar Foto';
                saveBtn.disabled = false;
                return;
            }

            try {
                const formData = new FormData();
                // Append the blob with a filename
                formData.append('avatar', blob, 'avatar.jpg');

                const response = await updateProfile(formData);
                
                // Update local storage user object
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    // The backend returns the updated user inside the response or just the avatar URL
                    if (response.avatar) {
                        user.avatar = response.avatar;
                    }
                    localStorage.setItem('user', JSON.stringify(user));
                    // Dispatch event so header updates instantly
                    window.dispatchEvent(new Event('user-updated'));
                }

                const toastHtml = Toast('Foto atualizada com sucesso!', 'success');
                document.body.insertAdjacentHTML('beforeend', toastHtml);
                
                modal.remove();
                if (onSaveCallback) onSaveCallback();
            } catch (err) {
                console.error(err);
                const toastHtml = Toast('Erro ao salvar a foto.', 'error');
                document.body.insertAdjacentHTML('beforeend', toastHtml);
                saveBtn.innerText = 'Salvar Foto';
                saveBtn.disabled = false;
            }
        }, 'image/jpeg', 0.9);
    });
};
